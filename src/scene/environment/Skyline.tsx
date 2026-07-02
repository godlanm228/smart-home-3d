import { useMemo } from 'react'
import * as THREE from 'three'

const houseMat = new THREE.MeshStandardMaterial({ color: '#232b3a', roughness: 1 })
const roofMat = new THREE.MeshStandardMaterial({ color: '#1a2130', roughness: 1 })
const windowMat = new THREE.MeshStandardMaterial({
  color: '#ffd28a',
  emissive: '#f3b43f',
  emissiveIntensity: 0.9,
  roughness: 0.6,
})
const hillMat = new THREE.MeshStandardMaterial({ color: '#16222f', roughness: 1 })
const blobMat = new THREE.MeshStandardMaterial({ color: '#17251b', roughness: 1 })

type Silhouette = {
  pos: [number, number, number]
  rotY: number
  w: number
  h: number
  d: number
  window: boolean
}

/** Distant suburb: low gable-roof silhouettes with a few warm windows,
 *  tree blobs and soft hills — replaces the old tower ring. */
export function Skyline() {
  const { houses, blobs, hills } = useMemo(() => {
    let seed = 13
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const houses: Silhouette[] = []
    // cluster across the street (visible behind the Vorgarten)
    for (let i = 0; i < 7; i++) {
      const x = -36 + i * 12 + rnd() * 4
      houses.push({
        pos: [x, 0, 34 + rnd() * 8],
        rotY: (rnd() - 0.5) * 0.4,
        w: 7 + rnd() * 3,
        h: 3.2 + rnd() * 1.6,
        d: 8,
        window: rnd() > 0.35,
      })
    }
    // surrounding ring
    for (let i = 0; i < 26; i++) {
      const angle = rnd() * Math.PI * 2
      const radius = 62 + rnd() * 55
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      if (z > 26 && Math.abs(x) < 45) continue // street cluster already covers this
      if (z < 26 && z > -40 && Math.abs(x) < 30) continue // keep the plot clear
      houses.push({
        pos: [x, 0, z],
        rotY: rnd() * Math.PI,
        w: 6 + rnd() * 4,
        h: 3 + rnd() * 2,
        d: 7 + rnd() * 3,
        window: rnd() > 0.55,
      })
    }

    const blobs = Array.from({ length: 20 }, () => {
      const angle = rnd() * Math.PI * 2
      const radius = 55 + rnd() * 70
      return {
        pos: [Math.cos(angle) * radius, 1.6 + rnd() * 1.2, Math.sin(angle) * radius] as [number, number, number],
        scale: 2.2 + rnd() * 2.6,
      }
    }).filter((b) => !(b.pos[2] > -42 && b.pos[2] < 26 && Math.abs(b.pos[0]) < 28))

    const hills = Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + 0.5
      const radius = 168 + (i % 2) * 8
      return {
        pos: [Math.cos(angle) * radius, -4, Math.sin(angle) * radius] as [number, number, number],
        scale: [55 + (i % 3) * 12, 9 + (i % 2) * 3, 40] as [number, number, number],
      }
    })

    return { houses, blobs, hills }
  }, [])

  return (
    <group>
      {houses.map((h, i) => (
        <group key={`h-${i}`} position={h.pos} rotation={[0, h.rotY, 0]}>
          <mesh position={[0, h.h / 2 - 0.4, 0]}>
            <boxGeometry args={[h.w, h.h, h.d]} />
            <primitive attach="material" object={houseMat} />
          </mesh>
          <mesh position={[0, h.h - 0.4 + 0.8, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, h.d / h.w]}>
            <coneGeometry args={[h.w * 0.74, 1.7, 4, 1]} />
            <primitive attach="material" object={roofMat} />
          </mesh>
          {h.window ? (
            <mesh position={[0, h.h * 0.45, h.d / 2 + 0.02]}>
              <boxGeometry args={[1.0, 0.6, 0.04]} />
              <primitive attach="material" object={windowMat} />
            </mesh>
          ) : null}
        </group>
      ))}
      {blobs.map((b, i) => (
        <mesh key={`b-${i}`} position={b.pos} scale={b.scale}>
          <sphereGeometry args={[1, 7, 6]} />
          <primitive attach="material" object={blobMat} />
        </mesh>
      ))}
      {hills.map((h, i) => (
        <mesh key={`hill-${i}`} position={h.pos} scale={h.scale}>
          <sphereGeometry args={[1, 12, 8]} />
          <primitive attach="material" object={hillMat} />
        </mesh>
      ))}
    </group>
  )
}
