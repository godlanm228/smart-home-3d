import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'
import { GARAGE_D, GARAGE_H, GARAGE_W, GARAGE_X, GARAGE_Z } from '../constants'
import { darkTrimMat } from '../materials'

const FLOOR_TOP = 0.1

const wallMat = new THREE.MeshStandardMaterial({ color: '#b7bac0', roughness: 0.9 })
const floorMat = new THREE.MeshStandardMaterial({ color: '#2a3038', roughness: 0.9 })
const doorMat = new THREE.MeshStandardMaterial({ color: '#6e5942', roughness: 0.55, metalness: 0.3 })
const panelMat = new THREE.MeshStandardMaterial({ color: '#4a3c2c', roughness: 0.6 })
const passageMat = new THREE.MeshStandardMaterial({ color: '#33404f', roughness: 0.5 })

/** GLB car: normalized to ~4.2 m length, bottom snapped to the garage floor. */
function Car({ url, x, z, rotY = 0 }: { url: string; x: number; z: number; rotY?: number }) {
  const { scene } = useGLTF(url)
  const prepared = useMemo(() => {
    const car = scene.clone(true)
    const box = new THREE.Box3().setFromObject(car)
    const size = box.getSize(new THREE.Vector3())
    car.scale.setScalar(4.2 / Math.max(size.x, size.z, 0.001))
    box.setFromObject(car)
    const center = box.getCenter(new THREE.Vector3())
    car.position.set(-center.x, -box.min.y, -center.z)
    car.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return car
  }, [scene])
  return (
    <group position={[x, FLOOR_TOP, z]} rotation-y={rotY}>
      <primitive object={prepared} />
    </group>
  )
}

useGLTF.preload('/models/car.glb')
useGLTF.preload('/models/car2.glb')

/** Attached double garage: 2 sectional doors to the street, 3 pedestrian passages. */
export function Garage() {
  const wallY = FLOOR_TOP + GARAGE_H / 2
  const frontZ = GARAGE_D / 2

  return (
    <group position={[GARAGE_X, 0, GARAGE_Z]}>
      <mesh position={[0, FLOOR_TOP - 0.1, 0]} receiveShadow>
        <boxGeometry args={[GARAGE_W, 0.2, GARAGE_D]} />
        <primitive attach="material" object={floorMat} />
      </mesh>
      {/* right outer wall / wall to the house / back wall (garden) */}
      <mesh castShadow position={[GARAGE_W / 2, wallY, 0]} receiveShadow>
        <boxGeometry args={[0.2, GARAGE_H, GARAGE_D]} />
        <primitive attach="material" object={wallMat} />
      </mesh>
      <mesh castShadow position={[-GARAGE_W / 2, wallY, 0]} receiveShadow>
        <boxGeometry args={[0.2, GARAGE_H, GARAGE_D]} />
        <primitive attach="material" object={wallMat} />
      </mesh>
      <mesh castShadow position={[0, wallY, -frontZ]} receiveShadow>
        <boxGeometry args={[GARAGE_W, GARAGE_H, 0.2]} />
        <primitive attach="material" object={wallMat} />
      </mesh>
      {/* two sectional doors to the street (+Z) + centre pillar */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh castShadow position={[s * 1.95, FLOOR_TOP + 1.25, frontZ]}>
            <boxGeometry args={[3.3, 2.5, 0.12]} />
            <primitive attach="material" object={doorMat} />
          </mesh>
          {[1, 2, 3, 4].map((line) => (
            <mesh key={line} position={[s * 1.95, FLOOR_TOP + (2.5 * line) / 5, frontZ + 0.02]}>
              <boxGeometry args={[3.3, 0.05, 0.14]} />
              <primitive attach="material" object={panelMat} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh castShadow position={[0, wallY, frontZ]}>
        <boxGeometry args={[0.5, GARAGE_H, 0.5]} />
        <primitive attach="material" object={wallMat} />
      </mesh>
      <mesh castShadow position={[0, FLOOR_TOP + GARAGE_H, 0]}>
        <boxGeometry args={[GARAGE_W + 0.5, 0.18, GARAGE_D + 0.5]} />
        <primitive attach="material" object={darkTrimMat} />
      </mesh>
      {/* 3 pedestrian passages: house / garden / front */}
      <mesh position={[-GARAGE_W / 2 + 0.02, FLOOR_TOP + 1.05, -2.6]}>
        <boxGeometry args={[0.16, 2.1, 1.0]} />
        <primitive attach="material" object={passageMat} />
      </mesh>
      <mesh position={[2.6, FLOOR_TOP + 1.05, -(frontZ - 0.02)]}>
        <boxGeometry args={[1.0, 2.1, 0.16]} />
        <primitive attach="material" object={passageMat} />
      </mesh>
      <mesh position={[-2.7, FLOOR_TOP + 1.05, frontZ - 0.02]}>
        <boxGeometry args={[1.0, 2.1, 0.16]} />
        <primitive attach="material" object={passageMat} />
      </mesh>
      <Car url="/models/car.glb" x={-1.95} z={0.4} />
      <Car rotY={Math.PI} url="/models/car2.glb" x={1.95} z={-0.6} />
      <CanvasLabel color="#dce8f6" position={[0, FLOOR_TOP + GARAGE_H + 0.7, 0]} scale={1.9} text="GARAGE" />
    </group>
  )
}
