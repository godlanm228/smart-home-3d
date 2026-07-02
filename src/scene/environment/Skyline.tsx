import { useMemo } from 'react'
import * as THREE from 'three'

const cityMat = new THREE.MeshStandardMaterial({ color: '#1e2637', roughness: 1 })

/** Distant city silhouettes dissolving in the fog — depth without neighbours. */
export function Skyline() {
  const blocks = useMemo(() => {
    let seed = 7
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    return Array.from({ length: 55 }, () => {
      const angle = rnd() * Math.PI * 2
      const radius = 135 + rnd() * 35
      const h = 7 + rnd() * 24
      const w = 5 + rnd() * 8
      return {
        position: [Math.cos(angle) * radius, h / 2 - 0.4, Math.sin(angle) * radius] as [number, number, number],
        rotationY: rnd() * Math.PI,
        scale: [w, h, w] as [number, number, number],
      }
    })
  }, [])

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.position} rotation={[0, b.rotationY, 0]} scale={b.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <primitive attach="material" object={cityMat} />
        </mesh>
      ))}
    </group>
  )
}
