import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'

export function SceneController() {
  usePresentationStore(selectCurrentScene)
  return null
}
