import { Environment as DreiEnvironment, Lightformer, Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'

/** Dusk sun direction — low over the street side, lights the front facade. */
const SUN_DIR = new THREE.Vector3(0.45, 0.22, 0.85).normalize()
const SUN_POS: [number, number, number] = [SUN_DIR.x * 90, SUN_DIR.y * 90, SUN_DIR.z * 90]

/**
 * Dusk atmosphere: Preetham sky with a low sun, warm key light + cool fill,
 * exponential fog and a lightweight offline IBL (Lightformers) so glass and
 * metals pick up believable reflections. No CDN/HDRI downloads — the
 * presentation must run offline.
 */
export function Environs() {
  return (
    <>
      <fogExp2 args={['#242e47', 0.01]} attach="fog" />
      <Sky
        distance={4000}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={2.2}
        sunPosition={SUN_POS}
        turbidity={8}
      />
      <Stars count={650} depth={30} fade factor={2.6} radius={95} saturation={0.3} speed={0.3} />
      <hemisphereLight args={['#8fb4e8', '#2a2018', 0.45]} />
      <directionalLight
        castShadow
        color="#ffb27a"
        intensity={1.7}
        position={[SUN_DIR.x * 55, SUN_DIR.y * 55 + 8, SUN_DIR.z * 55]}
        shadow-bias={-0.0004}
        shadow-camera-bottom={-32}
        shadow-camera-far={200}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight color="#3a5a8c" intensity={0.28} position={[-26, 16, -18]} />
      <DreiEnvironment frames={1} resolution={64}>
        <mesh scale={100}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#25314e" side={THREE.BackSide} />
        </mesh>
        <Lightformer color="#ffb27a" form="circle" intensity={4} position={[45, 14, 78]} scale={14} />
        <Lightformer color="#9fc0ff" intensity={0.65} position={[0, 60, 0]} rotation-x={Math.PI / 2} scale={[120, 120, 1]} />
      </DreiEnvironment>
    </>
  )
}
