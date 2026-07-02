import { Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { PLOT_X, PLOT_Z } from './Ground'

const postMat = new THREE.MeshStandardMaterial({ color: '#2b3038', roughness: 1, metalness: 0.5 })
const railMat = new THREE.MeshStandardMaterial({ color: '#39424f', roughness: 1, metalness: 0.5 })
const camBodyMat = new THREE.MeshStandardMaterial({ color: '#1b2128', roughness: 1, metalness: 0.4 })

function Fence({ x1, z1, x2, z2 }: { x1: number; z1: number; x2: number; z2: number }) {
  const dx = x2 - x1
  const dz = z2 - z1
  const len = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)
  const posts = Math.max(2, Math.round(len / 2.4))
  return (
    <group>
      <mesh position={[(x1 + x2) / 2, 0.95, (z1 + z2) / 2]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[len, 0.12, 0.06]} />
        <primitive attach="material" object={railMat} />
      </mesh>
      {Array.from({ length: posts + 1 }, (_, p) => (
        <mesh key={p} position={[x1 + (dx * p) / posts, 0.58, z1 + (dz * p) / posts]}>
          <boxGeometry args={[0.1, 1.15, 0.1]} />
          <primitive attach="material" object={postMat} />
        </mesh>
      ))}
    </group>
  )
}

/** Corner camera pole (DSGVO: perimeter covers the own plot only). */
function CameraPole({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <mesh castShadow position={[x, 1.7, z]}>
        <cylinderGeometry args={[0.09, 0.11, 3.4, 8]} />
        <primitive attach="material" object={postMat} />
      </mesh>
      <mesh position={[x, 3.35, z]}>
        <boxGeometry args={[0.4, 0.25, 0.5]} />
        <primitive attach="material" object={camBodyMat} />
      </mesh>
    </group>
  )
}

const TREES: Array<[x: number, z: number, scale: number]> = [
  [-16, -15, 1.25],
  [-20, 2, 1.0],
  [12, -16, 1.35],
  [19, -10, 0.9],
  [-9, -17.5, 1.1],
  [-14, 12, 1.05],
  [-20, 15.5, 1.3],
]

/** Perimeter fence, corner camera poles and garden trees. */
export function Garden() {
  const { scene: tree } = useGLTF('/models/tree1.glb')
  return (
    <group>
      <Fence x1={-PLOT_X} x2={PLOT_X} z1={-PLOT_Z} z2={-PLOT_Z} />
      <Fence x1={-PLOT_X} x2={PLOT_X} z1={PLOT_Z} z2={PLOT_Z} />
      <Fence x1={-PLOT_X} x2={-PLOT_X} z1={-PLOT_Z} z2={PLOT_Z} />
      <Fence x1={PLOT_X} x2={PLOT_X} z1={-PLOT_Z} z2={PLOT_Z} />
      <CameraPole x={-PLOT_X + 2} z={-PLOT_Z + 2} />
      <CameraPole x={PLOT_X - 2} z={-PLOT_Z + 2} />
      <CameraPole x={-PLOT_X + 2} z={PLOT_Z - 2} />
      <CameraPole x={PLOT_X - 2} z={PLOT_Z - 2} />
      {TREES.map(([x, z, scale]) => (
        <Clone castShadow key={`${x}-${z}`} object={tree} position={[x, 0, z]} receiveShadow scale={scale} />
      ))}
    </group>
  )
}

useGLTF.preload('/models/tree1.glb')
