import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'

/** Plot layout: the house sits at the FRONT of the plot (street side, +Z),
 *  the big garden stretches behind it (-Z). Fence line = PLOT bounds. */
export const PLOT = { x: 22, zFront: 12.5, zBack: -34 }
/** Front Lichthof trench that exposes the KG. */
export const PIT = { x0: -7, x1: 3.5, z0: 5.5, z1: 9.0, floorY: -3.3 }
/** House + plinth footprint — the lawn is a FRAME around it, never under it,
 *  so the Keller stays readable when the dollhouse cut opens the top view. */
const FOOT = { x: 9.4, z: 5.9 }
/** Street strip in front of the plot. */
export const STREET = { verge0: PLOT.zFront, walk0: 16, walk1: 17.5, road1: 23.5 }

const dirtMat = new THREE.MeshStandardMaterial({ color: '#4a3520', roughness: 1 })
const FLOWER_COLORS = ['#d14f6e', '#e8b84b', '#b05bd6', '#e0663a']

/** Dirt bed + colourful low flowers (shared with Garden). */
export function FlowerBed({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const flowers = useMemo(() => {
    const count = Math.max(5, Math.round(w * d * 1.6))
    return Array.from({ length: count }, (_, f) => ({
      color: FLOWER_COLORS[f % 4],
      dx: (((f * 53) % 100) / 100 - 0.5) * (w - 0.3),
      dz: (((f * 811) % 100) / 100 - 0.5) * (d - 0.3),
      s: 0.09 + ((f * 37) % 10) / 100,
    }))
  }, [w, d])
  return (
    <group>
      <mesh position={[x, 0.11, z]} receiveShadow>
        <boxGeometry args={[w, 0.22, d]} />
        <primitive attach="material" object={dirtMat} />
      </mesh>
      {flowers.map((f, i) => (
        <group key={i} position={[x + f.dx, 0.22, z + f.dz]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.2, 5]} />
            <meshStandardMaterial color="#2e6b28" roughness={1} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[f.s, 6, 6]} />
            <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.35} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** 600 m fog-catcher plane with a hole over house + Lichthof — it sits just
 *  below the lawn, so without the hole it would slice through the basement. */
function makeFarGroundGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-300, -300)
  shape.lineTo(300, -300)
  shape.lineTo(300, 300)
  shape.lineTo(-300, 300)
  shape.closePath()
  const hole = new THREE.Path()
  // shape lies in XY and is rotated -90° around X → world z = -shape.y
  hole.moveTo(-10, -9.6)
  hole.lineTo(10, -9.6)
  hole.lineTo(10, 6.5)
  hole.lineTo(-10, 6.5)
  hole.closePath()
  shape.holes.push(hole)
  return new THREE.ShapeGeometry(shape)
}

/** Stepping-stone path from the terrace into the garden (gentle S-curve). */
const GARDEN_PATH: Array<[number, number, number]> = Array.from({ length: 11 }, (_, i) => {
  const t = i / 10
  const z = -10.6 - t * 11.5
  const x = -2.5 + Math.sin(t * Math.PI * 0.9) * 5.2
  return [x, z, (i % 3) * 0.18 - 0.18]
})

/**
 * Plot ground: PBR lawn framing the house footprint + Lichthof trench,
 * street with sidewalk in front, driveway, entrance path, stepping stones
 * into the garden, flower beds and lawn variation patches.
 */
export function Ground() {
  const [diff, nor, rough, concrete] = useTexture([
    '/textures/grass_diff.jpg',
    '/textures/grass_nor.jpg',
    '/textures/grass_rough.jpg',
    '/textures/concrete.jpg',
  ])

  const { grassMat, concreteMat, paveMat, retainingMat, stoneMat } = useMemo(() => {
    const prep = (src: THREE.Texture, repeat: number, srgb: boolean) => {
      const t = src.clone()
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(repeat, repeat)
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
      return t
    }
    const grass = new THREE.MeshStandardMaterial({
      map: prep(diff, 16, true),
      normalMap: prep(nor, 16, false),
      roughnessMap: prep(rough, 16, false),
      color: '#3f9a2e', // natural lawn green — the old tint was neon
      roughness: 1,
    })
    grass.normalScale.set(1.5, 1.5)
    return {
      grassMat: grass,
      concreteMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 4, true), color: '#c2c7cc', roughness: 0.92 }),
      paveMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 3, true), color: '#9aa0a6', roughness: 0.9 }),
      retainingMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 2, true), color: '#b6bcc2', roughness: 0.9 }),
      stoneMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 1, true), color: '#aeb6ba', roughness: 0.85 }),
    }
  }, [diff, nor, rough, concrete])

  const farGroundGeometry = useMemo(makeFarGroundGeometry, [])
  const pitW = PIT.x1 - PIT.x0
  const pitD = PIT.z1 - PIT.z0
  const pitCX = (PIT.x0 + PIT.x1) / 2
  const pitCZ = (PIT.z0 + PIT.z1) / 2
  const wallH = -PIT.floorY
  const wallY = PIT.floorY + wallH / 2

  const grassSlab = (w: number, d: number, x: number, z: number, key: string) => (
    <mesh key={key} position={[x, -0.15, z]} receiveShadow>
      <boxGeometry args={[w, 0.3, d]} />
      <primitive attach="material" object={grassMat} />
    </mesh>
  )

  return (
    <group>
      {/* fog-catcher far ground (hole over house + Lichthof, see helper above) */}
      <mesh geometry={farGroundGeometry} position={[0, -0.4, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#131c12" roughness={1} />
      </mesh>

      {/* lawn frame: big garden behind, narrow Vorgarten in front */}
      {grassSlab(PLOT.x * 2, -PLOT.zBack - FOOT.z, 0, (PLOT.zBack - FOOT.z) / 2, 'garden')}
      {grassSlab(PLOT.x - FOOT.x, FOOT.z * 2, (FOOT.x + PLOT.x) / 2, 0, 'right')}
      {grassSlab(PLOT.x - FOOT.x, FOOT.z * 2, -(FOOT.x + PLOT.x) / 2, 0, 'left')}
      {grassSlab(PIT.x0 + PLOT.x, PIT.z1 - FOOT.z, (PIT.x0 - PLOT.x) / 2, (FOOT.z + PIT.z1) / 2, 'front-left')}
      {grassSlab(PLOT.x - PIT.x1, PIT.z1 - FOOT.z, (PIT.x1 + PLOT.x) / 2, (FOOT.z + PIT.z1) / 2, 'front-right')}
      {grassSlab(PLOT.x * 2, STREET.walk0 - PIT.z1, 0, (PIT.z1 + STREET.walk0) / 2, 'vorgarten')}

      {/* street: sidewalk + asphalt with centre markings */}
      <mesh position={[0, 0.03, (STREET.walk0 + STREET.walk1) / 2]} receiveShadow>
        <boxGeometry args={[PLOT.x * 2 + 16, 0.12, STREET.walk1 - STREET.walk0]} />
        <primitive attach="material" object={paveMat} />
      </mesh>
      <mesh position={[0, 0.01, (STREET.walk1 + STREET.road1) / 2]} receiveShadow>
        <boxGeometry args={[PLOT.x * 2 + 26, 0.08, STREET.road1 - STREET.walk1]} />
        <meshStandardMaterial color="#20242a" roughness={0.95} />
      </mesh>
      {[-24, -16, -8, 0, 8, 16, 24].map((x) => (
        <mesh key={x} position={[x, 0.06, (STREET.walk1 + STREET.road1) / 2]}>
          <boxGeometry args={[2.2, 0.02, 0.16]} />
          <meshStandardMaterial color="#c9cdd2" roughness={0.8} />
        </mesh>
      ))}

      {/* Lichthof trench: concrete floor + retaining walls (house side open) */}
      <mesh position={[pitCX, PIT.floorY + 0.1, pitCZ]} receiveShadow>
        <boxGeometry args={[pitW, 0.2, pitD]} />
        <primitive attach="material" object={retainingMat} />
      </mesh>
      <mesh position={[pitCX, wallY, PIT.z1]} receiveShadow>
        <boxGeometry args={[pitW + 0.4, wallH, 0.4]} />
        <primitive attach="material" object={retainingMat} />
      </mesh>
      {[PIT.x0, PIT.x1].map((x) => (
        <mesh key={x} position={[x, wallY, pitCZ]} receiveShadow>
          <boxGeometry args={[0.4, wallH, pitD]} />
          <primitive attach="material" object={retainingMat} />
        </mesh>
      ))}

      {/* earth cut around the basement (visible in the dollhouse keller view) */}
      <mesh position={[-(FOOT.x + 0.15), -1.65, 0]}>
        <boxGeometry args={[0.3, 3.3, FOOT.z * 2]} />
        <primitive attach="material" object={dirtMat} />
      </mesh>
      <mesh position={[FOOT.x + 0.15, -1.65, 0]}>
        <boxGeometry args={[0.3, 3.3, FOOT.z * 2]} />
        <primitive attach="material" object={dirtMat} />
      </mesh>
      <mesh position={[0, -1.65, -(FOOT.z + 0.15)]}>
        <boxGeometry args={[FOOT.x * 2 + 0.6, 3.3, 0.3]} />
        <primitive attach="material" object={dirtMat} />
      </mesh>

      {/* driveway to the garage + footpath to the entrance (both reach the sidewalk) */}
      <mesh position={[12.75, 0.08, (6.5 + STREET.walk1) / 2]} receiveShadow>
        <boxGeometry args={[7.5, 0.16, STREET.walk1 - 6.5]} />
        <primitive attach="material" object={concreteMat} />
      </mesh>
      <mesh position={[6.2, 0.07, (5.9 + STREET.walk1) / 2]} receiveShadow>
        <boxGeometry args={[2.2, 0.14, STREET.walk1 - 5.9]} />
        <primitive attach="material" object={paveMat} />
      </mesh>

      {/* stepping stones from the terrace into the garden */}
      {GARDEN_PATH.map(([x, z, j], i) => (
        <mesh key={i} position={[x + j, 0.03, z]} receiveShadow rotation={[0, j, 0]}>
          <boxGeometry args={[0.85, 0.07, 0.6]} />
          <primitive attach="material" object={stoneMat} />
        </mesh>
      ))}

      {/* front-yard beds along the entrance path */}
      <FlowerBed d={4.5} w={0.7} x={4.8} z={10.2} />
      <FlowerBed d={4.5} w={0.7} x={7.6} z={10.2} />

      {/* lawn variation — no uniform carpet (subtle tone patches in the garden) */}
      {[
        [-10, -16, 11, 8, '#357f26'],
        [8, -22, 9, 7, '#2c6b1f'],
        [-14, -28, 7, 5, '#3f8f2c'],
        [12, -12, 6, 4, '#357a24'],
      ].map(([x, z, w, d, color]) => (
        <mesh key={`${x}-${z}`} position={[x as number, -0.13, z as number]} receiveShadow>
          <boxGeometry args={[w as number, 0.32, d as number]} />
          <meshStandardMaterial color={color as string} roughness={1} />
        </mesh>
      ))}

      <CanvasLabel color="#9fd9b0" position={[0, 0.4, -21]} scale={4.2} text="GARTEN · 400 m²" />
      <CanvasLabel color="#9fd9b0" position={[-4, 0.4, 10.8]} scale={3.0} text="VORGARTEN" />
      <CanvasLabel color="#8da0b8" position={[-12, 0.4, 20.5]} scale={2.6} text="STRASSE" />
    </group>
  )
}
