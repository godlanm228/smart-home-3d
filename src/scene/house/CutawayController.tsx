import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { selectCurrentScene, usePresentationStore } from '../../store/usePresentationStore'
import type { FloorId } from '../../types'
import { STACK_ORDER } from '../constants'

export type CutawayState = {
  /** Storeys hidden by the dollhouse cut (everything stacked above the focused floor). */
  hiddenFloors: Set<FloorId>
  /** Roof planes hidden (floor-focus below the roof, or explicit roof-off). */
  roofHidden: boolean
  /** Attic floor/props hidden too (floor-focus — they would block the top-down view).
   *  Stays visible on roof-off: that IS the Dachboden scene. */
  atticHidden: boolean
  /** Exploded view active (storeys drift apart vertically). */
  exploded: boolean
}

const EXPLODE_STEP = 1.5

/** Extra Y offset per stack level in the exploded view (roof rides on top). */
export type FloorOffsets = { keller: number; eg: number; og1: number; dachgeschoss: number; roof: number }
const ZERO_OFFSETS: FloorOffsets = { keller: 0, eg: 0, og1: 0, dachgeschoss: 0, roof: 0 }
const EXPLODED_OFFSETS: FloorOffsets = {
  keller: 0,
  eg: EXPLODE_STEP,
  og1: EXPLODE_STEP * 2,
  dachgeschoss: EXPLODE_STEP * 3,
  roof: EXPLODE_STEP * 4,
}

/**
 * Derives the cutaway from the active scene: `floor-focus` hides all storeys
 * ABOVE the focused one plus the roof (dollhouse view — this is what finally
 * makes the Keller readable), `roof-off` lifts only the roof (Dachboden),
 * `exploded` spreads the storeys apart (Sicherheitsübersicht).
 */
export function useCutaway(): CutawayState {
  const scene = usePresentationStore(selectCurrentScene)

  return useMemo(() => {
    const hiddenFloors = new Set<FloorId>()
    let roofHidden = false
    let atticHidden = false

    if (scene.cutawayMode === 'floor-focus' && scene.floor && STACK_ORDER.includes(scene.floor)) {
      const focusIndex = STACK_ORDER.indexOf(scene.floor)
      for (const floor of STACK_ORDER.slice(focusIndex + 1)) hiddenFloors.add(floor)
      roofHidden = true
      atticHidden = true
    }
    if (scene.cutawayMode === 'roof-off') roofHidden = true

    return { hiddenFloors, roofHidden, atticHidden, exploded: scene.cutawayMode === 'exploded' }
  }, [scene])
}

/** Target Y offsets for the exploded view — consumers damp toward these. */
export function useFloorOffsets(): FloorOffsets {
  const { exploded } = useCutaway()
  return exploded ? EXPLODED_OFFSETS : ZERO_OFFSETS
}

/** Group that glides to its exploded Y offset (smooth, presentation-grade). */
export function ExplodeGroup({
  target,
  visible = true,
  children,
}: {
  target: number
  visible?: boolean
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    const g = ref.current
    if (g) g.position.y = THREE.MathUtils.damp(g.position.y, target, 3.2, delta)
  })
  return (
    <group ref={ref} visible={visible}>
      {children}
    </group>
  )
}

/** Offset lookup for arbitrary floor ids (devices, furniture, balcony…). */
export function offsetFor(offsets: FloorOffsets, floor: FloorId | undefined): number {
  switch (floor) {
    case 'keller':
      return offsets.keller
    case 'eg':
      return offsets.eg
    case 'og1':
      return offsets.og1
    case 'dachgeschoss':
      return offsets.dachgeschoss
    case 'dachboden':
    case 'roof':
      return offsets.roof
    default:
      return 0
  }
}
