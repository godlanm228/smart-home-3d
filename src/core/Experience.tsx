import { ContactShadows, Grid, Stars } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { InteractionLayer } from './InteractionLayer'
import { PostFX } from './PostFX'
import { PlaceholderHouse } from '../scene/PlaceholderHouse'

export function Experience() {
  return (
    <>
      <color attach="background" args={['#07111d']} />
      <fog attach="fog" args={['#07111d', 18, 70]} />
      <ambientLight intensity={0.32} />
      <directionalLight
        castShadow
        color="#f4c987"
        intensity={2.2}
        position={[18, 22, 16]}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight color="#39a9ff" intensity={4.4} position={[-8, 6, 7]} distance={22} />
      <pointLight color="#f3b43f" intensity={3.2} position={[5, 5, -4]} distance={18} />
      <Stars radius={80} depth={30} count={900} factor={3} saturation={0.35} fade speed={0.35} />
      <PlaceholderHouse />
      <InteractionLayer />
      <Grid
        args={[34, 34]}
        cellColor="#18304d"
        cellSize={1}
        fadeDistance={34}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, -0.02, 0]}
        sectionColor="#24486e"
        sectionSize={4}
      />
      <ContactShadows
        blur={2.8}
        far={24}
        frames={1}
        opacity={0.42}
        position={[0, 0, 0]}
        resolution={1024}
        scale={32}
      />
      <CameraRig />
      <PostFX />
    </>
  )
}
