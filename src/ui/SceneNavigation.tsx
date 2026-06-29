import { Layers } from 'lucide-react'
import { usePresentationStore } from '../store/usePresentationStore'

export function SceneNavigation() {
  const scenes = usePresentationStore((state) => state.scenes)
  const currentSceneIndex = usePresentationStore((state) => state.currentSceneIndex)
  const setSceneByIndex = usePresentationStore((state) => state.setSceneByIndex)

  return (
    <nav aria-label="Szenen" className="sceneNav glass">
      <h2 className="sectionTitle">
        <Layers size={15} /> Szenen
      </h2>
      <div className="sceneList">
        {scenes.map((scene, index) => (
          <button
            className={`sceneButton ${index === currentSceneIndex ? 'isActive' : ''}`}
            key={scene.id}
            onClick={() => setSceneByIndex(index)}
            type="button"
          >
            <span className="sceneButtonIndex">{scene.index}</span>
            <span className="sceneButtonText">
              <span className="sceneButtonTitle">{scene.title}</span>
              <span className="sceneButtonSubtitle">{scene.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
