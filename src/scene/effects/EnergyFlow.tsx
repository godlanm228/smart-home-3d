import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { selectCurrentScene, usePresentationStore } from '../../store/usePresentationStore'

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/** PV → house grid (down the facade into the Keller energy meter). */
const PATH_METER = new THREE.CatmullRomCurve3([
  v(4.6, 11.5, 0),
  v(7.6, 10.2, 2.4),
  v(9.6, 6.4, 4.8),
  v(9.7, 1.2, 4.6),
  v(4, -1.0, 2.2),
  v(-4.2, -1.4, -1),
])

/** PV → wallbox in the garage. */
const PATH_WALLBOX = new THREE.CatmullRomCurve3([
  v(4.6, 11.5, 0),
  v(8.5, 10.4, 1.6),
  v(13, 7.2, 2.8),
  v(16.4, 3.4, 2.9),
  v(17.3, 1.5, 2.5),
])

const dotMat = new THREE.MeshBasicMaterial({ color: '#ffd166' })
const guideMat = new THREE.MeshBasicMaterial({ color: '#f3b43f', transparent: true, opacity: 0.12, depthWrite: false })

function Flow({ curve, count, speed }: { curve: THREE.CatmullRomCurve3; count: number; speed: number }) {
  const dotsRef = useRef<THREE.InstancedMesh>(null)
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.025, 6, false), [curve])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    const mesh = dotsRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      const t = (clock.elapsedTime * speed + i / count) % 1
      const point = curve.getPointAt(t)
      dummy.position.copy(point)
      const s = 0.7 + 0.3 * Math.sin(t * Math.PI) // dots swell mid-path
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <mesh geometry={tube}>
        <primitive attach="material" object={guideMat} />
      </mesh>
      <instancedMesh args={[undefined, undefined, count]} ref={dotsRef}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <primitive attach="material" object={dotMat} />
      </instancedMesh>
    </group>
  )
}

/** Animated energy flow from the PV array — shown on the Dach & Energie scene. */
export function EnergyFlow() {
  const scene = usePresentationStore(selectCurrentScene)
  if (scene.id !== 'roof') return null
  return (
    <group>
      <Flow count={10} curve={PATH_METER} speed={0.085} />
      <Flow count={7} curve={PATH_WALLBOX} speed={0.11} />
    </group>
  )
}
