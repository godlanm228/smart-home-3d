import { BOOTSTRAP_SCENES } from '../core/bootstrapData'
import { PRESENTATION_SCENE_COUNT } from '../utils/constants'

export function smokeTestBootstrapScenes() {
  if (BOOTSTRAP_SCENES.length !== PRESENTATION_SCENE_COUNT) {
    throw new Error('Bootstrap scene count must stay aligned with the 14-scene plan.')
  }
}
