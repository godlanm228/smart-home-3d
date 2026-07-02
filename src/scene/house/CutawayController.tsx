import { useMemo } from 'react'
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
}

/**
 * Derives the cutaway from the active scene: `floor-focus` hides all storeys
 * ABOVE the focused one plus the roof (dollhouse view — this is what finally
 * makes the Keller readable), `roof-off` lifts only the roof (Dachboden).
 * `exploded` is not implemented yet and falls back to the full house.
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

    return { hiddenFloors, roofHidden, atticHidden }
  }, [scene])
}
