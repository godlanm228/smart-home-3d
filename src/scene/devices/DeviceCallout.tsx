import { Html, Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { DeviceInfo } from '../../types'

/** Candidate world-space directions a callout can fan out to. The picker
 *  projects each one to screen space, rescales it to a fixed pixel offset
 *  (so distant cameras still separate panels) and takes the least-crowded
 *  spot — panels no longer slide into each other on dense scenes. */
const DIRECTIONS: [number, number, number][] = [
  [1.35, 0.95, 0],
  [-1.35, 1.15, 0],
  [0.15, 1.65, 0],
  [1.15, 1.45, 0.4],
  [-1.2, 0.7, -0.4],
  [1.5, 0.55, -0.3],
  [-0.7, 1.9, 0.2],
  [0.95, 2.05, -0.2],
  // Wide lateral options give dense scenes (e.g. security, 6 cameras) room to
  // separate when the upward fan is already crowded.
  [-1.9, 0.6, 0],
  [1.9, 0.65, 0.2],
]
/** Target screen-space offsets (px); farther rings are fallbacks. */
const SCREEN_STEPS = [110, 165, 225, 290]
const COMPACT_SCREEN_STEPS = [80, 130, 185]
const MAX_WORLD_STRETCH = 8

/** Phones: fewer + tighter callouts so the small screen stays readable. */
const COMPACT =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse), (max-width: 900px)').matches
const MAX_COMPACT_CALLOUTS = 3

/** Approximate panel footprint in px (CSS min/max-width 150–225, compact 118–158). */
const PANEL_W = COMPACT ? 145 : 205
const PANEL_H = COMPACT ? 60 : 80
const MIN_CENTER_DIST = COMPACT ? 100 : 145
const EDGE_MARGIN = 10
const TOP_MARGIN = 64 // top bar / stepper zone
const BOTTOM_MARGIN = 72 // bottom control bar / scene-info card zone

type Rect = { x: number; y: number; w: number; h: number }

/** Screen-space registry of placed callouts, one scene at a time. Placement is
 *  greedy: the 340 ms stagger guarantees callout n runs after n-1 registered. */
let registryScene = ''
const placed = new Map<string, { rect: Rect; anchor: { x: number; y: number } }>()

function registryFor(sceneKey: string) {
  if (registryScene !== sceneKey) {
    registryScene = sceneKey
    placed.clear()
  }
}

function overlapArea(a: Rect, b: Rect) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  return w > 0 && h > 0 ? w * h : 0
}

type DeviceCalloutProps = {
  device: DeviceInfo
  /** Position in the scene's focus list — drives stagger + direction bias. */
  index: number
  /** Restarts the entrance whenever the scene changes. */
  sceneId: string
  /** ms until the camera has settled and callouts may start appearing. */
  settleMs: number
  /** Fade out (without unmount) while the device is hovered/selected. */
  hidden: boolean
}

/** Auto-callout for the live demo: appears after the camera settles — no
 *  mouse needed. Small glass panel + leader line anchored to the device. */
export function DeviceCallout({ device, index, sceneId, settleMs, hidden }: DeviceCalloutProps) {
  const anchorRef = useRef<THREE.Group>(null)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const [dir, setDir] = useState<[number, number, number] | null>(null)
  const armedRef = useRef(false)
  const placedRef = useRef(false)
  const stillFrames = useRef(0)
  const lastCamPos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity))
  const lastCamFov = useRef(0)
  // The device group's Y damps for ~1s after a scene change (DeviceMarker), so
  // the anchor keeps moving even once the camera is still. Track it too, or the
  // panel gets placed against a mid-damp position and then drifts into a
  // neighbour (small overlaps on dense scenes).
  const lastAnchorPos = useRef(new THREE.Vector3(Infinity, Infinity, Infinity))
  const anchorScratch = useRef(new THREE.Vector3())

  useEffect(() => {
    setDir(null)
    armedRef.current = false
    placedRef.current = false
    stillFrames.current = 0
    lastAnchorPos.current.set(Infinity, Infinity, Infinity)
    if (COMPACT && index >= MAX_COMPACT_CALLOUTS) return

    // The timer keeps the staggered entrance; actual placement additionally
    // waits until the camera has truly stopped (throttled tabs, slow devices).
    const timer = window.setTimeout(() => {
      armedRef.current = true
    }, settleMs + index * 340)
    return () => window.clearTimeout(timer)
  }, [sceneId, settleMs, index, camera, size, device.id])

  useFrame(() => {
    if (!armedRef.current || placedRef.current) return
    const persp = camera as THREE.PerspectiveCamera
    const anchorNow = anchorRef.current?.getWorldPosition(anchorScratch.current)
    const anchorMoved = !anchorNow || anchorNow.distanceToSquared(lastAnchorPos.current) > 1e-8
    if (anchorNow) lastAnchorPos.current.copy(anchorNow)
    const moved =
      anchorMoved ||
      camera.position.distanceToSquared(lastCamPos.current) > 1e-8 ||
      Math.abs((persp.fov ?? 0) - lastCamFov.current) > 1e-4
    lastCamPos.current.copy(camera.position)
    lastCamFov.current = persp.fov ?? 0
    if (moved) {
      stillFrames.current = 0
      return
    }
    stillFrames.current += 1
    if (stillFrames.current >= 3) {
      placedRef.current = true
      place()
    }
  })

  const place = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      registryFor(sceneId)

      const worldPos = anchor.getWorldPosition(new THREE.Vector3())
      const project = (world: THREE.Vector3) => {
        const v = world.clone().project(camera)
        return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height, behind: v.z > 1 }
      }
      const anchorPx = project(worldPos)
      // device outside the viewport (e.g. portrait crop) -> no callout at all
      if (
        anchorPx.behind ||
        anchorPx.x < 8 || anchorPx.x > size.width - 8 ||
        anchorPx.y < 8 || anchorPx.y > size.height - 8
      ) {
        return
      }
      const others = [...placed.entries()].filter(([id]) => id !== device.id).map(([, entry]) => entry)

      let best: [number, number, number] | null = null
      let bestRect: Rect | null = null
      let bestCost = Number.POSITIVE_INFINITY

      const steps = COMPACT ? COMPACT_SCREEN_STEPS : SCREEN_STEPS
      DIRECTIONS.forEach((base, dirIdx) => {
        // rotate the preference order by focus index so siblings fan out differently
        const preference = (dirIdx - index + DIRECTIONS.length * 4) % DIRECTIONS.length
        const probe = project(worldPos.clone().add(new THREE.Vector3(...base)))
        if (probe.behind) return
        const probeDx = probe.x - anchorPx.x
        const probeDy = probe.y - anchorPx.y
        const probePx = Math.hypot(probeDx, probeDy)
        if (probePx < 1) return
        steps.forEach((targetPx, lenIdx) => {
          // rescale the world offset so the panel lands targetPx away on screen
          const k = Math.min(targetPx / probePx, MAX_WORLD_STRETCH)
          const candidate: [number, number, number] = [base[0] * k, base[1] * k, base[2] * k]
          const px = { x: anchorPx.x + probeDx * k, y: anchorPx.y + probeDy * k }
          const rect: Rect = { x: px.x - PANEL_W / 2, y: px.y - PANEL_H / 2, w: PANEL_W, h: PANEL_H }

          let cost = preference * 140 + lenIdx * 120
          for (const other of others) {
            // Any overlap is strongly dispreferred: a flat penalty rules out
            // small corner-kisses (a few px² still cost more than switching
            // direction/ring), while the area term scales with how bad it is.
            const ov = overlapArea(rect, other.rect)
            if (ov > 0) cost += 1800 + ov * 40
            const dist = Math.hypot(
              rect.x + rect.w / 2 - (other.rect.x + other.rect.w / 2),
              rect.y + rect.h / 2 - (other.rect.y + other.rect.h / 2),
            )
            if (dist < MIN_CENTER_DIST) cost += (MIN_CENTER_DIST - dist) * 26
            // don't cover a neighbour's device either
            if (
              other.anchor.x > rect.x && other.anchor.x < rect.x + rect.w &&
              other.anchor.y > rect.y && other.anchor.y < rect.y + rect.h
            ) {
              cost += 3200
            }
          }
          // keep the panel inside the viewport (below the top HUD, above the
          // bottom control bar / scene-info card)
          const offX =
            Math.max(0, EDGE_MARGIN - rect.x) + Math.max(0, rect.x + rect.w - size.width + EDGE_MARGIN)
          const offY =
            Math.max(0, TOP_MARGIN - rect.y) + Math.max(0, rect.y + rect.h - (size.height - BOTTOM_MARGIN))
          cost += (offX + offY) * 55

          if (cost < bestCost) {
            bestCost = cost
            best = candidate
            bestRect = rect
          }
        })
      })

      if (best && bestRect) {
        placed.set(device.id, { rect: bestRect, anchor: { x: anchorPx.x, y: anchorPx.y } })
        setDir(best)
      }
  }

  if (COMPACT && index >= MAX_COMPACT_CALLOUTS) return null

  return (
    <group ref={anchorRef}>
      {dir ? (
        <>
          <Line
            color="#bcd7ff"
            lineWidth={1}
            opacity={hidden ? 0 : 0.5}
            points={[[0, 0.14, 0], dir]}
            transparent
          />
          <Html center className="calloutWrap" position={dir} zIndexRange={[3, 2]}>
            <div className={`deviceCallout ${hidden ? 'isHidden' : ''}`}>
              <span className="calloutTitle">{device.label}</span>
              <span className="calloutText">{device.benefit}</span>
            </div>
          </Html>
        </>
      ) : null}
    </group>
  )
}
