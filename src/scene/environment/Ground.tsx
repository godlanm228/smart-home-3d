import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'

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
  // shape lies in XY and is rotated -90° around X → world z = -y
  hole.moveTo(-10, -9.6)
  hole.lineTo(10, -9.6)
  hole.lineTo(10, 6.5)
  hole.lineTo(-10, 6.5)
  hole.closePath()
  shape.holes.push(hole)
  return new THREE.ShapeGeometry(shape)
}

/** Plot extents (fence line) and the front Lichthof trench that exposes the KG. */
export const PLOT_X = 24
export const PLOT_Z = 20
export const PIT = { x0: -7, x1: 3.5, z0: 5.5, z1: 9.0, floorY: -3.3 }
/** House + plinth footprint — the lawn is a FRAME around it, never under it,
 *  so the Keller stays readable when the dollhouse cut opens the top view. */
const FOOT = { x: 9.4, z: 5.9 }

const dirtMat = new THREE.MeshStandardMaterial({ color: '#5e4126', roughness: 1 })
const soilMat = new THREE.MeshStandardMaterial({ color: '#3a2c1c', roughness: 1 })
const FLOWER_COLORS = ['#d14f6e', '#e8b84b', '#b05bd6', '#e0663a']

function FlowerBed({ x, z, w, d }: { x: number; z: number; w: number; d: number }) {
  const flowers = useMemo(() => {
    const count = Math.max(4, Math.round(w * d))
    return Array.from({ length: count }, (_, f) => ({
      color: FLOWER_COLORS[f % 4],
      dx: (((f * 53) % 100) / 100 - 0.5) * (w - 0.3),
      dz: (((f * 811) % 100) / 100 - 0.5) * (d - 0.3),
    }))
  }, [w, d])
  return (
    <group>
      <mesh position={[x, 0.11, z]}>
        <boxGeometry args={[w, 0.22, d]} />
        <primitive attach="material" object={dirtMat} />
      </mesh>
      {flowers.map((f, i) => (
        <mesh key={i} position={[x + f.dx, 0.3, z + f.dz]}>
          <sphereGeometry args={[0.13, 6, 6]} />
          <meshStandardMaterial color={f.color} emissive={f.color} emissiveIntensity={0.3} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Plot ground: PBR lawn framing the front Lichthof trench (keeps the Keller
 * visible from the street), concrete driveway to the garage, entrance path,
 * flower beds and lawn variation patches. A huge dark plane catches the fog.
 */
export function Ground() {
  const [diff, nor, rough, concrete] = useTexture([
    '/textures/grass_diff.jpg',
    '/textures/grass_nor.jpg',
    '/textures/grass_rough.jpg',
    '/textures/concrete.jpg',
  ])

  const { grassMat, concreteMat, paveMat, retainingMat } = useMemo(() => {
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
      map: prep(diff, 12, true),
      normalMap: prep(nor, 12, false),
      roughnessMap: prep(rough, 12, false),
      color: '#4ec225',
      roughness: 1,
    })
    grass.normalScale.set(1.2, 1.2)
    return {
      grassMat: grass,
      concreteMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 4, true), color: '#c2c7cc', roughness: 0.92 }),
      paveMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 3, true), color: '#9aa0a6', roughness: 0.9 }),
      retainingMat: new THREE.MeshStandardMaterial({ map: prep(concrete, 2, true), color: '#b6bcc2', roughness: 0.9 }),
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

      {/* lawn as a frame around house footprint + Lichthof trench */}
      {grassSlab(PLOT_X * 2, PLOT_Z - FOOT.z, 0, -(FOOT.z + PLOT_Z) / 2, 'garden')}
      {grassSlab(PLOT_X - FOOT.x, FOOT.z * 2, (FOOT.x + PLOT_X) / 2, 0, 'right')}
      {grassSlab(PLOT_X - FOOT.x, FOOT.z * 2, -(FOOT.x + PLOT_X) / 2, 0, 'left')}
      {grassSlab(PIT.x0 + PLOT_X, PIT.z1 - FOOT.z, (PIT.x0 - PLOT_X) / 2, (FOOT.z + PIT.z1) / 2, 'front-left')}
      {grassSlab(PLOT_X - PIT.x1, PIT.z1 - FOOT.z, (PIT.x1 + PLOT_X) / 2, (FOOT.z + PIT.z1) / 2, 'front-right')}
      {grassSlab(PLOT_X * 2, PLOT_Z - PIT.z1, 0, (PIT.z1 + PLOT_Z) / 2, 'front')}

      {/* earth cut around the basement (visible in the dollhouse keller view) */}
      <mesh position={[-(FOOT.x + 0.15), -1.65, 0]}>
        <boxGeometry args={[0.3, 3.3, FOOT.z * 2]} />
        <primitive attach="material" object={soilMat} />
      </mesh>
      <mesh position={[FOOT.x + 0.15, -1.65, 0]}>
        <boxGeometry args={[0.3, 3.3, FOOT.z * 2]} />
        <primitive attach="material" object={soilMat} />
      </mesh>
      <mesh position={[0, -1.65, -(FOOT.z + 0.15)]}>
        <boxGeometry args={[FOOT.x * 2 + 0.6, 3.3, 0.3]} />
        <primitive attach="material" object={soilMat} />
      </mesh>

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

      {/* driveway to the garage + footpath to the entrance */}
      <mesh position={[12.75, 0.08, 13.2]} receiveShadow>
        <boxGeometry args={[7.5, 0.16, 13.6]} />
        <primitive attach="material" object={concreteMat} />
      </mesh>
      <mesh position={[6.2, 0.07, 12.9]} receiveShadow>
        <boxGeometry args={[2.2, 0.14, 14]} />
        <primitive attach="material" object={paveMat} />
      </mesh>

      <FlowerBed d={8} w={0.7} x={4.8} z={12.5} />
      <FlowerBed d={8} w={0.7} x={7.6} z={12.5} />
      <FlowerBed d={6} w={0.7} x={17.0} z={13} />

      {/* lawn variation — no uniform carpet */}
      {[
        [-9, -12, 11, 8, '#3f7a2e'],
        [8, -14, 9, 7, '#2d5a20'],
        [-13, 9, 7, 5, '#47842f'],
      ].map(([x, z, w, d, color]) => (
        <mesh key={`${x}-${z}`} position={[x as number, -0.13, z as number]} receiveShadow>
          <boxGeometry args={[w as number, 0.32, d as number]} />
          <meshStandardMaterial color={color as string} roughness={1} />
        </mesh>
      ))}

      <CanvasLabel color="#9fd9b0" position={[0, 0.4, -13]} scale={4.2} text="GARTEN · 400 m²" />
      <CanvasLabel color="#9fd9b0" position={[-4, 0.4, 11]} scale={3.2} text="VORGARTEN" />
    </group>
  )
}
