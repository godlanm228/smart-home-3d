import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Experience } from './Experience'

export function SceneCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [16, 11, 24], fov: 42, near: 0.1, far: 180 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 1.8]}
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  )
}
