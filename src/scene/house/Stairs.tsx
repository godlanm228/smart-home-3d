import * as THREE from 'three'
import { FLOOR_TOP } from '../constants'
import { useCutaway } from './CutawayController'

const stepMat = new THREE.MeshStandardMaterial({ color: '#9aa6b4', roughness: 0.7 })

const FLIGHTS: Array<{ floor: 'keller' | 'eg' | 'og1'; from: number; to: number }> = [
  { floor: 'keller', from: FLOOR_TOP.keller, to: FLOOR_TOP.eg },
  { floor: 'eg', from: FLOOR_TOP.eg, to: FLOOR_TOP.og1 },
  { floor: 'og1', from: FLOOR_TOP.og1, to: FLOOR_TOP.dachgeschoss },
]

/** Stair flights in the Diele (x ≈ 3.4). Each flight belongs to its lower storey.
 *  Hidden entirely in the exploded view (they would dangle between storeys). */
export function Stairs() {
  const { hiddenFloors, exploded } = useCutaway()
  const steps = 6
  if (exploded) return null
  return (
    <group>
      {FLIGHTS.map(({ floor, from, to }) => {
        const rise = (to - from) / steps
        return (
          <group key={floor} visible={!hiddenFloors.has(floor)}>
            {Array.from({ length: steps }, (_, i) => (
              <mesh
                castShadow
                key={i}
                position={[3.4, from + rise * (i + 0.5), -1.2 - i * 0.36]}
                receiveShadow
              >
                <boxGeometry args={[2.0, 0.16, 0.42]} />
                <primitive attach="material" object={stepMat} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
