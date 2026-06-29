import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.48} luminanceThreshold={0.22} luminanceSmoothing={0.72} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={0.72} />
    </EffectComposer>
  )
}
