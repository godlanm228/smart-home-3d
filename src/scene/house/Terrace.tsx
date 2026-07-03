import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { CanvasLabel } from '../CanvasLabel'
import { FLOOR_TOP, HD } from '../constants'
import { railGlassMat, railMetalMat } from '../materials'
import { assetUrl } from '../../utils/assetUrl'

const DECK_W = 9
const DECK_D = 4
const DECK_X = -2.5
const DECK_Z = -(HD + DECK_D / 2 + 0.3) // garden side (-Z), attached to the house
const DECK_TOP = FLOOR_TOP.eg

/** Wooden garden deck flush with the EG floor + patio furniture set. */
export function Terrace() {
  const wood = useTexture(assetUrl('/textures/wood.jpg'))
  const { scene: patio } = useGLTF(assetUrl('/models/patio.glb'))

  const deckMat = useMemo(() => {
    const t = wood.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 1.5)
    t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 })
  }, [wood])

  const patioSet = useMemo(() => {
    const set = patio.clone(true)
    set.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return set
  }, [patio])

  const gardenEdge = DECK_Z - DECK_D / 2

  return (
    <group>
      <mesh castShadow position={[DECK_X, DECK_TOP - 0.08, DECK_Z]} receiveShadow>
        <boxGeometry args={[DECK_W, 0.16, DECK_D]} />
        <primitive attach="material" object={deckMat} />
      </mesh>
      <mesh position={[DECK_X, DECK_TOP - 0.18, gardenEdge - 0.28]} receiveShadow>
        <boxGeometry args={[4, 0.12, 0.55]} />
        <primitive attach="material" object={deckMat} />
      </mesh>
      {/* glass railing: garden edge + both sides */}
      <mesh position={[DECK_X, DECK_TOP + 0.27, gardenEdge]}>
        <boxGeometry args={[DECK_W, 0.55, 0.05]} />
        <primitive attach="material" object={railGlassMat} />
      </mesh>
      <mesh position={[DECK_X, DECK_TOP + 0.57, gardenEdge]}>
        <boxGeometry args={[DECK_W + 0.06, 0.06, 0.1]} />
        <primitive attach="material" object={railMetalMat} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[DECK_X + (s * DECK_W) / 2, DECK_TOP + 0.27, DECK_Z]}>
          <boxGeometry args={[0.05, 0.55, DECK_D]} />
          <primitive attach="material" object={railGlassMat} />
        </mesh>
      ))}
      <group position={[DECK_X, DECK_TOP, DECK_Z]}>
        <primitive object={patioSet} />
      </group>
      <CanvasLabel color="#dce8f6" position={[DECK_X, DECK_TOP + 1.4, DECK_Z]} scale={1.6} text="TERRASSE" />
    </group>
  )
}

useGLTF.preload(assetUrl('/models/patio.glb'))
