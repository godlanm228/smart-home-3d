import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'
import {
  FLOOR_BASE,
  FLOOR_TAG,
  FRONT_Z,
  HD,
  HOUSE_D,
  HOUSE_W,
  HW,
  ROOMS,
  SLAB_T,
  STOREY_H,
} from '../constants'
import { glassMat, partitionFrameMat } from '../materials'
import { useCutaway } from './CutawayController'

type StoreyId = keyof typeof FLOOR_BASE

const STOREYS = Object.keys(FLOOR_BASE) as StoreyId[]

const partitionPaneMat = new THREE.MeshStandardMaterial({
  color: '#a9c4dd',
  transparent: true,
  opacity: 0.4,
  roughness: 0.35,
})

const kellerSlabMat = new THREE.MeshStandardMaterial({ color: '#223044', roughness: 0.85 })

/** Warm interior glow per storey (hidden together with its floor by the cutaway).
 *  three r155+ physical lights: intensity is candela-like, needs ~10-50. */
const STOREY_LIGHTS: Record<StoreyId, Array<{ pos: [number, number, number]; intensity: number; color: string }>> = {
  keller: [
    { pos: [-5, 1.9, 1], intensity: 34, color: '#9fd0ff' },
    { pos: [1, 1.9, -1], intensity: 16, color: '#ffcaa0' },
  ],
  eg: [
    { pos: [-5, 1.9, 0], intensity: 45, color: '#ffcaa0' },
    { pos: [3, 1.9, 0], intensity: 40, color: '#ffcaa0' },
  ],
  og1: [{ pos: [0, 1.9, 0], intensity: 30, color: '#ffcaa0' }],
  dachgeschoss: [{ pos: [-3, 1.8, 0], intensity: 22, color: '#ffcaa0' }],
}

/** Translucent glass envelope band for one storey (four sides). */
function GlassBand({ base }: { base: number }) {
  const y = base + STOREY_H / 2
  return (
    <group>
      <mesh position={[0, y, HD]}>
        <boxGeometry args={[HOUSE_W, STOREY_H, 0.1]} />
        <primitive attach="material" object={glassMat} />
      </mesh>
      <mesh position={[0, y, -HD]}>
        <boxGeometry args={[HOUSE_W, STOREY_H, 0.1]} />
        <primitive attach="material" object={glassMat} />
      </mesh>
      <mesh position={[-HW, y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[HOUSE_D, STOREY_H, 0.1]} />
        <primitive attach="material" object={glassMat} />
      </mesh>
      <mesh position={[HW, y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[HOUSE_D, STOREY_H, 0.1]} />
        <primitive attach="material" object={glassMat} />
      </mesh>
    </group>
  )
}

/** Room partition (translucent pane + visible metal frame so room edges read). */
function Partition({ x, base }: { x: number; base: number }) {
  const wallH = STOREY_H - 0.2
  const depth = HOUSE_D - 0.4
  const y = base + SLAB_T + wallH / 2
  return (
    <group>
      <mesh position={[x, y, 0]}>
        <boxGeometry args={[0.1, wallH, depth]} />
        <primitive attach="material" object={partitionPaneMat} />
      </mesh>
      <mesh position={[x, y + wallH / 2 - 0.02, 0]}>
        <boxGeometry args={[0.13, 0.07, depth]} />
        <primitive attach="material" object={partitionFrameMat} />
      </mesh>
      <mesh position={[x, y - wallH / 2 + 0.02, 0]}>
        <boxGeometry args={[0.13, 0.07, depth]} />
        <primitive attach="material" object={partitionFrameMat} />
      </mesh>
      <mesh position={[x, y, depth / 2 - 0.02]}>
        <boxGeometry args={[0.13, wallH, 0.07]} />
        <primitive attach="material" object={partitionFrameMat} />
      </mesh>
      <mesh position={[x, y, -depth / 2 + 0.02]}>
        <boxGeometry args={[0.13, wallH, 0.07]} />
        <primitive attach="material" object={partitionFrameMat} />
      </mesh>
    </group>
  )
}

/**
 * The 4 Geschosse: floor slabs (oak above ground, dark concrete-ish in the KG),
 * glass envelope bands, room partitions and labels. Each storey group is
 * toggled by the cutaway (dollhouse floor focus).
 */
export function FloorStack() {
  const { hiddenFloors } = useCutaway()
  const wood = useTexture('/textures/wood.jpg')

  const woodMat = useMemo(() => {
    const t = wood.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2.2, 2.2)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })
  }, [wood])

  return (
    <group>
      {STOREYS.map((id) => {
        const base = FLOOR_BASE[id]
        const rooms = ROOMS[id]
        return (
          <group key={id} visible={!hiddenFloors.has(id)}>
            <mesh castShadow position={[0, base + SLAB_T / 2, 0]} receiveShadow>
              <boxGeometry args={[HOUSE_W, SLAB_T, HOUSE_D]} />
              <primitive attach="material" object={id === 'keller' ? kellerSlabMat : woodMat} />
            </mesh>
            <GlassBand base={base} />
            {STOREY_LIGHTS[id].map((light, i) => (
              <pointLight
                color={light.color}
                distance={16}
                intensity={light.intensity}
                key={`${id}-light-${i}`}
                position={[light.pos[0], base + light.pos[1], light.pos[2]]}
              />
            ))}
            {rooms.slice(1).map(([, x0]) => (
              <Partition base={base} key={`${id}-${x0}`} x={x0} />
            ))}
            <CanvasLabel
              color="#bfd2e8"
              position={[-HW - 1.1, base + STOREY_H * 0.55, FRONT_Z + 0.4]}
              scale={2}
              text={FLOOR_TAG[id]}
            />
            {rooms.map(([label, x0, x1], roomIndex) => (
              <CanvasLabel
                color="#dce8f6"
                key={`${id}-room-${roomIndex}`}
                position={[(x0 + x1) / 2, base + SLAB_T + 0.55, FRONT_Z - 1.3]}
                scale={1.5}
                text={label}
              />
            ))}
          </group>
        )
      })}
    </group>
  )
}
