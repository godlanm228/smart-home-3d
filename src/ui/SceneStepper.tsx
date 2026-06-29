import { ChevronLeft, ChevronRight } from 'lucide-react'
import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'

export function SceneStepper() {
  const scene = usePresentationStore(selectCurrentScene)
  const sceneCount = usePresentationStore((state) => state.scenes.length)
  const nextScene = usePresentationStore((state) => state.nextScene)
  const previousScene = usePresentationStore((state) => state.previousScene)

  return (
    <div className="stepper">
      <button aria-label="Vorherige Szene" className="iconButton" onClick={previousScene} type="button">
        <ChevronLeft size={18} />
      </button>
      <div className="stepperMeta">
        <div className="sceneCount">
          {scene.index} / {sceneCount}
        </div>
        <div className="sceneName">{scene.subtitle}</div>
      </div>
      <button aria-label="Naechste Szene" className="iconButton" onClick={nextScene} type="button">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
