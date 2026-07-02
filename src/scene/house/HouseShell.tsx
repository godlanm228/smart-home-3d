import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { EAVES_Y, FLOOR_BASE, FLOOR_TOP, FRONT_Z, HD, HOUSE_D, HOUSE_W, HW } from '../constants'
import { structureMat } from '../materials'
import { Balcony } from './Balcony'
import { FloorStack } from './FloorStack'
import { Roof } from './Roof'
import { Stairs } from './Stairs'

const doorMat = new THREE.MeshStandardMaterial({ color: '#3a2f24', roughness: 0.5 })
const handleMat = new THREE.MeshStandardMaterial({ color: '#cfd6dd', roughness: 0.3 })
const stepMat = new THREE.MeshStandardMaterial({ color: '#b6bcc2', roughness: 0.9 })

function Entrance() {
  const doorX = 6.2
  return (
    <group>
      <mesh castShadow position={[doorX, FLOOR_TOP.eg + 1.15, FRONT_Z + 0.03]}>
        <boxGeometry args={[1.5, 2.3, 0.16]} />
        <primitive attach="material" object={doorMat} />
      </mesh>
      <mesh position={[doorX + 0.55, FLOOR_TOP.eg + 1.1, FRONT_Z + 0.13]}>
        <boxGeometry args={[0.07, 0.5, 0.07]} />
        <primitive attach="material" object={handleMat} />
      </mesh>
      <mesh castShadow position={[doorX, FLOOR_TOP.eg + 2.5, FRONT_Z + 0.85]}>
        <boxGeometry args={[3.0, 0.14, 1.6]} />
        <primitive attach="material" object={structureMat} />
      </mesh>
      <mesh castShadow position={[doorX, 0.06, FRONT_Z + 0.45]} receiveShadow>
        <boxGeometry args={[2.4, 0.12, 0.7]} />
        <primitive attach="material" object={stepMat} />
      </mesh>
    </group>
  )
}

/**
 * House assembly: concrete plinth, corner posts (they give the glass volume
 * its read), entrance, the 4-storey stack, roof (with Dachboden), balcony
 * loggia and stairs. Warm interior lights make the house glow at dusk.
 */
export function HouseShell() {
  const concrete = useTexture('/textures/concrete.jpg')

  const plinthMat = useMemo(() => {
    const t = concrete.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(4, 4)
    t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, color: '#c2c7cc', roughness: 0.9 })
  }, [concrete])

  const postH = EAVES_Y - (FLOOR_BASE.keller - 0.2)
  const postY = (EAVES_Y + FLOOR_BASE.keller - 0.2) / 2

  return (
    <group>
      {/* plinth as a perimeter ring — no lid, the dollhouse cut must see the KG */}
      {[
        { args: [HOUSE_W + 0.6, 0.6, 0.45] as [number, number, number], pos: [0, -0.1, HD + 0.08] as [number, number, number] },
        { args: [HOUSE_W + 0.6, 0.6, 0.45] as [number, number, number], pos: [0, -0.1, -HD - 0.08] as [number, number, number] },
        { args: [0.45, 0.6, HOUSE_D + 0.6] as [number, number, number], pos: [HW + 0.08, -0.1, 0] as [number, number, number] },
        { args: [0.45, 0.6, HOUSE_D + 0.6] as [number, number, number], pos: [-HW - 0.08, -0.1, 0] as [number, number, number] },
      ].map((seg, i) => (
        <mesh castShadow key={i} position={seg.pos} receiveShadow>
          <boxGeometry args={seg.args} />
          <primitive attach="material" object={plinthMat} />
        </mesh>
      ))}
      {[
        [-HW, -HD],
        [HW, -HD],
        [-HW, HD],
        [HW, HD],
      ].map(([x, z]) => (
        <mesh castShadow key={`${x}-${z}`} position={[x, postY, z]}>
          <boxGeometry args={[0.34, postH, 0.34]} />
          <primitive attach="material" object={structureMat} />
        </mesh>
      ))}
      <Entrance />
      <FloorStack />
      <Roof />
      <Balcony />
      <Stairs />
    </group>
  )
}
