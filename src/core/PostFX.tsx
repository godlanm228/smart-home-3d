import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      {/* Threshold raised so only emissives (markers, windows, LEDs) bloom —
          walls/sky stay crisp (Agent B tweak, see HANDOFF 0.2b). */}
      <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={0.55} />
    </EffectComposer>
  )
}
