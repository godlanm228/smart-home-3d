import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'
import { EAVES_Y, HD, HOUSE_D, HOUSE_W, HW, RIDGE_Y, ROOF_H, SLAB_T } from '../constants'
import { glassMat } from '../materials'
import { useCutaway } from './CutawayController'

const OVERHANG = 0.3
const RW = HW + OVERHANG
const RD = HD + OVERHANG
const SLOPE = Math.atan2(ROOF_H, RW)
const PLANE_LEN = Math.hypot(RW, ROOF_H)

const crateMat = new THREE.MeshStandardMaterial({ color: '#6b5a42', roughness: 0.85 })
const pvPanelMat = new THREE.MeshStandardMaterial({
  color: '#12233f',
  emissive: '#1e3a5f',
  emissiveIntensity: 0.35,
  roughness: 0.25,
  metalness: 0.55,
})
const pvFrameMat = new THREE.MeshStandardMaterial({ color: '#8d99a6', roughness: 0.4, metalness: 0.7 })

function GableGlass({ z }: { z: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-RW, EAVES_Y)
    shape.lineTo(RW, EAVES_Y)
    shape.lineTo(0, RIDGE_Y)
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])
  return (
    <mesh geometry={geometry} position={[0, 0, z]}>
      <primitive attach="material" object={glassMat} />
    </mesh>
  )
}

/** PV array laid onto one roof plane (driveway side, +X). */
function PVArray() {
  const rows = [0.55, 1.75] // along the slope (plane-local x)
  const cols = [-3.9, -1.3, 1.3, 3.9] // along the ridge (plane-local z)
  return (
    <group position={[RW / 2, EAVES_Y + ROOF_H / 2, 0]} rotation={[0, 0, -SLOPE]}>
      {rows.map((rx) =>
        cols.map((cz) => (
          <group key={`${rx}-${cz}`} position={[rx - 1.1, 0.12, cz]}>
            <mesh castShadow>
              <boxGeometry args={[1.7, 0.06, 2.3]} />
              <primitive attach="material" object={pvFrameMat} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <boxGeometry args={[1.56, 0.04, 2.16]} />
              <primitive attach="material" object={pvPanelMat} />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

/**
 * Gable roof (ridge along Z) with tiled PBR planes + PV array. The Dachboden
 * is the roof interior: attic floor + storage stays visible when the cutaway
 * lifts the roof planes (`roof-off`).
 */
export function Roof() {
  const { roofHidden, atticHidden } = useCutaway()
  const [diff, nor, rough] = useTexture([
    '/textures/roof_diff.jpg',
    '/textures/roof_nor.jpg',
    '/textures/roof_rough.jpg',
  ])

  const roofMat = useMemo(() => {
    const prep = (src: THREE.Texture, srgb: boolean) => {
      const t = src.clone()
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(3, 2)
      if (srgb) t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
      return t
    }
    return new THREE.MeshStandardMaterial({
      map: prep(diff, true),
      normalMap: prep(nor, false),
      roughnessMap: prep(rough, false),
      roughness: 1,
    })
  }, [diff, nor, rough])

  return (
    <group>
      {/* Attic interior (Dachboden = Speicher inside the roof, not a storey) */}
      <group visible={!atticHidden}>
        <mesh position={[0, EAVES_Y + SLAB_T / 2, 0]} receiveShadow>
          <boxGeometry args={[HOUSE_W - 0.4, SLAB_T, HOUSE_D - 0.4]} />
          <meshStandardMaterial color="#223044" roughness={0.85} />
        </mesh>
        {[
          [-5.4, 0.44, -1.6, 1.1, 0.88, 1.4],
          [-3.8, 0.3, 1.2, 0.9, 0.6, 0.9],
          [3.2, 0.37, -0.6, 1.3, 0.74, 1.0],
          [5.6, 0.26, 1.8, 0.8, 0.52, 0.8],
        ].map(([x, h, z, w, bh, d], i) => (
          <mesh castShadow key={i} position={[x, EAVES_Y + SLAB_T + h, z]} receiveShadow>
            <boxGeometry args={[w, bh, d]} />
            <primitive attach="material" object={crateMat} />
          </mesh>
        ))}
        <CanvasLabel color="#dce8f6" position={[0, EAVES_Y + 1.1, HD - 1.3]} scale={1.6} text="SPEICHER" />
      </group>

      {/* Roof planes + gables + PV (lifted by the cutaway) */}
      <group visible={!roofHidden}>
        {[1, -1].map((sign) => (
          <mesh
            castShadow
            key={sign}
            position={[(sign * RW) / 2, EAVES_Y + ROOF_H / 2, 0]}
            receiveShadow
            rotation={[0, 0, -sign * SLOPE]}
          >
            <boxGeometry args={[PLANE_LEN, 0.12, 2 * RD]} />
            <primitive attach="material" object={roofMat} />
          </mesh>
        ))}
        <mesh castShadow position={[0, RIDGE_Y + 0.02, 0]}>
          <boxGeometry args={[0.3, 0.14, 2 * RD]} />
          <meshStandardMaterial color="#1b2836" roughness={0.6} />
        </mesh>
        <GableGlass z={RD - 0.05} />
        <GableGlass z={-(RD - 0.05)} />
        <PVArray />
      </group>
    </group>
  )
}
