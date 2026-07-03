import { Clone, useGLTF } from '@react-three/drei'
import { FLOOR_TOP } from '../constants'
import { ExplodeGroup, offsetFor, useCutaway, useFloorOffsets } from '../house/CutawayController'
import type { FloorId } from '../../types'
import { assetUrl } from '../../utils/assetUrl'

type SetPlacement = {
  url: string
  floor: FloorId & keyof typeof FLOOR_TOP
  position: [number, number]
  scale?: number
}

/** Blender room sets (ported placements; sets were modelled for a -Z street,
 *  so every set is rotated 180° to face the new +Z front). */
const SETS: SetPlacement[] = [
  { url: assetUrl('/models/livingroom.glb'), floor: 'eg', position: [-6, 2.2] },
  { url: assetUrl('/models/kitchen.glb'), floor: 'eg', position: [0, -3.0] },
  { url: assetUrl('/models/dining.glb'), floor: 'eg', position: [0, 2.5] },
  { url: assetUrl('/models/bedroom.glb'), floor: 'og1', position: [-6.7, -0.5] },
  { url: assetUrl('/models/bathroom.glb'), floor: 'og1', position: [6.75, 0] },
  { url: assetUrl('/models/technik.glb'), floor: 'keller', position: [-6, 0] },
  // Dachgeschoss reuses the bedroom/bathroom sets (3 Schlafzimmer + Bad)
  { url: assetUrl('/models/bedroom.glb'), floor: 'dachgeschoss', position: [-6.7, -0.5] },
  { url: assetUrl('/models/bedroom.glb'), floor: 'dachgeschoss', position: [2.2, -0.5], scale: 0.92 },
  { url: assetUrl('/models/bathroom.glb'), floor: 'dachgeschoss', position: [6.75, 0] },
]

function FurnitureSet({ url, floor, position, scale = 1 }: SetPlacement) {
  const { scene } = useGLTF(url)
  return (
    <Clone
      castShadow
      object={scene}
      position={[position[0], FLOOR_TOP[floor], position[1]]}
      receiveShadow
      rotation-y={Math.PI}
      scale={scale}
    />
  )
}

export function Furniture() {
  const { hiddenFloors } = useCutaway()
  const offsets = useFloorOffsets()
  return (
    <group>
      {SETS.map((set, index) => (
        <ExplodeGroup
          key={`${set.url}-${index}`}
          target={offsetFor(offsets, set.floor)}
          visible={!hiddenFloors.has(set.floor)}
        >
          <FurnitureSet {...set} />
        </ExplodeGroup>
      ))}
    </group>
  )
}

useGLTF.preload(assetUrl('/models/livingroom.glb'))
useGLTF.preload(assetUrl('/models/kitchen.glb'))
useGLTF.preload(assetUrl('/models/dining.glb'))
useGLTF.preload(assetUrl('/models/bedroom.glb'))
useGLTF.preload(assetUrl('/models/bathroom.glb'))
useGLTF.preload(assetUrl('/models/technik.glb'))
