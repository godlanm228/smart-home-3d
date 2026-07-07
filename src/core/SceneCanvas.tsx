import { Canvas } from '@react-three/fiber'
import { Component, Suspense, type ReactNode } from 'react'
import { Experience } from './Experience'

/** One failed asset must never blank the whole presentation: the HUD keeps
 *  running and the error lands in the console instead of an empty page. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[SceneCanvas] 3D scene crashed:', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

const COARSE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function SceneCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [16, 11, 24], fov: 42, near: 0.1, far: 180 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
      }}
      dpr={COARSE_POINTER ? [1, 1.5] : [1, 1.8]}
    >
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </SceneErrorBoundary>
    </Canvas>
  )
}
