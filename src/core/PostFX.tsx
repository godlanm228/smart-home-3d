import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

/** Post-processing is a real GPU cost on phones — skip it there entirely.
 *  Desktop (fine pointer) keeps the tuned Bloom/Vignette look. */
const COARSE_POINTER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function PostFX() {
  if (COARSE_POINTER) return null
  return (
    <EffectComposer multisampling={0}>
      {/* Threshold raised so only emissives (markers, windows, LEDs) bloom —
          walls/sky stay crisp (Agent B tweak, see HANDOFF 0.2b). */}
      <Bloom intensity={0.55} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
      <Vignette eskil={false} offset={0.18} darkness={0.55} />
    </EffectComposer>
  )
}
