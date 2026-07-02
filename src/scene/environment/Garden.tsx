import { Clone, Instances, Instance, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FlowerBed, PLOT } from './Ground'

const postMat = new THREE.MeshStandardMaterial({ color: '#23282f', roughness: 0.6, metalness: 0.5 })
const slatMat = new THREE.MeshStandardMaterial({ color: '#7a5f42', roughness: 0.75 })
const camBodyMat = new THREE.MeshStandardMaterial({ color: '#1b2128', roughness: 1, metalness: 0.4 })
const benchWoodMat = new THREE.MeshStandardMaterial({ color: '#8a6a48', roughness: 0.7 })
const lampHeadMat = new THREE.MeshStandardMaterial({
  color: '#ffca7a',
  emissive: '#ffb45e',
  emissiveIntensity: 2.4,
  roughness: 0.5,
})
const sprayMat = new THREE.MeshStandardMaterial({
  color: '#9fd4ff',
  transparent: true,
  opacity: 0.13,
  roughness: 0.2,
  side: THREE.DoubleSide,
  depthWrite: false,
})

/** Modern low fence: dark posts + three horizontal wood slats («небольшой красивый»). */
function Fence({ x1, z1, x2, z2 }: { x1: number; z1: number; x2: number; z2: number }) {
  const dx = x2 - x1
  const dz = z2 - z1
  const len = Math.hypot(dx, dz)
  const angle = Math.atan2(dz, dx)
  const posts = Math.max(1, Math.round(len / 2.2))
  return (
    <group>
      {[0.3, 0.52, 0.74].map((y) => (
        <mesh castShadow key={y} position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} rotation={[0, -angle, 0]}>
          <boxGeometry args={[len, 0.1, 0.035]} />
          <primitive attach="material" object={slatMat} />
        </mesh>
      ))}
      {Array.from({ length: posts + 1 }, (_, p) => (
        <mesh castShadow key={p} position={[x1 + (dx * p) / posts, 0.44, z1 + (dz * p) / posts]}>
          <boxGeometry args={[0.09, 0.88, 0.09]} />
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

/** Garden bench: wooden slat seat + back on dark metal legs. */
function Bench({ x, z, rotY = 0 }: { x: number; z: number; rotY?: number }) {
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      {[-0.65, 0.65].map((lx) => (
        <mesh castShadow key={lx} position={[lx, 0.21, 0]}>
          <boxGeometry args={[0.06, 0.42, 0.42]} />
          <primitive attach="material" object={postMat} />
        </mesh>
      ))}
      {[-0.09, 0.09].map((sz) => (
        <mesh castShadow key={sz} position={[0, 0.44, sz]}>
          <boxGeometry args={[1.6, 0.05, 0.16]} />
          <primitive attach="material" object={benchWoodMat} />
        </mesh>
      ))}
      {[0.62, 0.8].map((sy) => (
        <mesh castShadow key={sy} position={[0, sy, -0.24]} rotation={[-0.22, 0, 0]}>
          <boxGeometry args={[1.6, 0.05, 0.14]} />
          <primitive attach="material" object={benchWoodMat} />
        </mesh>
      ))}
    </group>
  )
}

/** Warm bollard lamp; `lit` adds a real point light (keep those to a minimum). */
function GardenLamp({ x, z, lit = false }: { x: number; z: number; lit?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.76, 8]} />
        <primitive attach="material" object={postMat} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.14, 10]} />
        <primitive attach="material" object={lampHeadMat} />
      </mesh>
      {lit ? <pointLight color="#ffb45e" distance={9} intensity={7} position={[0, 1.0, 0]} /> : null}
    </group>
  )
}

/** Pop-up sprinkler: faint spray dome + three rotating water jets. */
function Sprinkler({ x, z, phase = 0 }: { x: number; z: number; phase?: number }) {
  const jetsRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const jets = jetsRef.current
    if (jets) jets.rotation.y = clock.elapsedTime * 1.9 + phase
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.14, 8]} />
        <primitive attach="material" object={camBodyMat} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#7cc4ff" emissive="#4a9fe8" emissiveIntensity={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[1.15, 0.72, 18, 1, true]} />
        <primitive attach="material" object={sprayMat} />
      </mesh>
      <group position={[0, 0.16, 0]} ref={jetsRef}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.5, 0.16, Math.sin(a) * 0.5]} rotation={[0, -a, 0.9]}>
            <cylinderGeometry args={[0.012, 0.045, 1.05, 5]} />
            <primitive attach="material" object={sprayMat} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const TREES: Array<[x: number, z: number, scale: number]> = [
  [-16, -30, 1.35],
  [-8, -32, 1.1],
  [4, -31.5, 1.3],
  [14, -29, 1.0],
  [-19.5, -22, 1.2],
  [19.5, -19, 1.05],
  [-19, -10, 0.95],
  [19.5, -30, 1.25],
  [-15, 10.5, 1.0],
  [-20.5, 7, 1.15],
]

/** Sparse instanced grass tufts — breaks the flat-texture look of the lawn. */
function GrassTufts() {
  const tufts = useMemo(() => {
    let seed = 31
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    const out: Array<{ pos: [number, number, number]; scale: number; rot: number; shade: string }> = []
    while (out.length < 700) {
      const x = -20 + rnd() * 40
      const z = -32.5 + rnd() * 25
      // keep the stepping-stone corridor readable
      if (x > -4 && x < 6 && z > -23 && z < -9) continue
      out.push({
        pos: [x, 0.02, z],
        scale: 0.55 + rnd() * 0.9,
        rot: rnd() * Math.PI,
        shade: ['#2e7a22', '#35892a', '#256b1c'][out.length % 3],
      })
    }
    return out
  }, [])
  return (
    <Instances limit={tufts.length}>
      <coneGeometry args={[0.05, 0.22, 4]} />
      <meshStandardMaterial roughness={1} />
      {tufts.map((t, i) => (
        <Instance color={t.shade} key={i} position={t.pos} rotation={[0.1, t.rot, -0.08]} scale={t.scale} />
      ))}
    </Instances>
  )
}

/**
 * Garden behind the house: perimeter fence with gates at path/driveway,
 * benches, bollard lamps, sprinklers, flower beds, trees and corner
 * security-camera poles.
 */
export function Garden() {
  const { scene: tree } = useGLTF('/models/tree1.glb')
  const F = PLOT.zFront
  const B = PLOT.zBack
  const X = PLOT.x

  return (
    <group>
      {/* perimeter fence; front run leaves gates for footpath (x 5..7.4) and driveway (x 9..16.6) */}
      <Fence x1={-X} x2={X} z1={B} z2={B} />
      <Fence x1={-X} x2={-X} z1={B} z2={F} />
      <Fence x1={X} x2={X} z1={B} z2={F} />
      <Fence x1={-X} x2={5} z1={F} z2={F} />
      <Fence x1={7.4} x2={9} z1={F} z2={F} />
      <Fence x1={16.6} x2={X} z1={F} z2={F} />

      <CameraPole x={-X + 1.5} z={B + 1.5} />
      <CameraPole x={X - 1.5} z={B + 1.5} />
      <CameraPole x={-X + 1.5} z={F - 1.5} />
      <CameraPole x={X - 1.5} z={F - 1.5} />

      {/* garden furniture along the stepping-stone path */}
      <Bench rotY={-0.5} x={3.6} z={-20.6} />
      <Bench rotY={2.4} x={-7.6} z={-24.5} />
      <Bench rotY={Math.PI} x={-11} z={-8.6} />

      <GardenLamp x={-0.6} z={-11.6} />
      <GardenLamp lit x={2.2} z={-15.8} />
      <GardenLamp x={4.6} z={-19.4} />
      <GardenLamp lit x={-6.4} z={-23.2} />
      <GardenLamp x={-6.8} z={-9.6} />
      <GardenLamp x={8.4} z={9.8} />

      <Sprinkler phase={0} x={-9} z={-14} />
      <Sprinkler phase={1.6} x={9} z={-17} />
      <Sprinkler phase={3.1} x={-2} z={-28} />
      <Sprinkler phase={4.7} x={13} z={-25} />

      {/* garden flower beds: along the back fence + near the benches */}
      <FlowerBed d={1.1} w={16} x={0} z={-32.6} />
      <FlowerBed d={1.2} w={3.2} x={5.9} z={-21.8} />
      <FlowerBed d={1.0} w={2.6} x={-9.8} z={-25.6} />
      <FlowerBed d={1.0} w={2.4} x={-11} z={-7.2} />

      <GrassTufts />

      {TREES.map(([x, z, scale]) => (
        <Clone castShadow key={`${x}-${z}`} object={tree} position={[x, 0, z]} receiveShadow scale={scale} />
      ))}
    </group>
  )
}

useGLTF.preload('/models/tree1.glb')
