import { CameraRig } from './CameraRig'
import { InteractionLayer } from './InteractionLayer'
import { PostFX } from './PostFX'
import { SmartHomeWorld } from '../scene/SmartHomeWorld'

export function Experience() {
  return (
    <>
      <color attach="background" args={['#0b1220']} />
      {/* Lights, sky, fog and the whole world live in scene/SmartHomeWorld (Agent B).
          PlaceholderHouse + bootstrap lights/grid were replaced by the real build. */}
      <SmartHomeWorld />
      <InteractionLayer />
      <CameraRig />
      <PostFX />
    </>
  )
}
