import { Html, Line } from '@react-three/drei'
import { useEffect, useState } from 'react'
import type { DeviceInfo } from '../../types'

/** World-space offsets the callouts fan out to — cycled by focus index so
 *  neighbouring callouts pick different directions and don't stack. */
const DIRECTIONS: [number, number, number][] = [
  [1.35, 0.95, 0],
  [-1.35, 1.15, 0],
  [0.15, 1.65, 0],
  [1.15, 1.45, 0.4],
  [-1.2, 0.7, -0.4],
  [1.5, 0.55, -0.3],
]

/** Phones: fewer + tighter callouts so the small screen stays readable. */
const COMPACT =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse), (max-width: 900px)').matches
const MAX_COMPACT_CALLOUTS = 3
const COMPACT_DIR_SCALE = 0.75

type DeviceCalloutProps = {
  device: DeviceInfo
  /** Position in the scene's focus list — drives direction + stagger. */
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const timer = window.setTimeout(() => setReady(true), settleMs + index * 340)
    return () => window.clearTimeout(timer)
  }, [sceneId, settleMs, index])

  if (!ready) return null
  if (COMPACT && index >= MAX_COMPACT_CALLOUTS) return null

  const base = DIRECTIONS[index % DIRECTIONS.length]
  const dir: [number, number, number] = COMPACT
    ? [base[0] * COMPACT_DIR_SCALE, base[1] * COMPACT_DIR_SCALE, base[2] * COMPACT_DIR_SCALE]
    : base

  return (
    <group>
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
    </group>
  )
}
