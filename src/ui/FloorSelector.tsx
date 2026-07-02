import { Home } from 'lucide-react'
import { FLOORS } from '../data/floors'
import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'
import type { FloorId } from '../types'

/** First scene that presents each floor — clicking a floor jumps there. */
const FLOOR_SCENE: Partial<Record<FloorId, string>> = {
  dachboden: 'dachboden',
  dachgeschoss: 'dachgeschoss',
  og1: 'og1',
  eg: 'eg-living',
  keller: 'keller',
  garage: 'garage',
  outdoor: 'garden',
}

export function FloorSelector() {
  const currentScene = usePresentationStore(selectCurrentScene)
  const setSceneById = usePresentationStore((state) => state.setSceneById)

  return (
    <aside aria-label="Etagen" className="floorSelector glass">
      {FLOORS.map((floor) => (
        <button
          className={`floorButton ${currentScene.floor === floor.id ? 'isActive' : ''}`}
          key={floor.id}
          onClick={() => {
            const sceneId = FLOOR_SCENE[floor.id]
            if (sceneId) setSceneById(sceneId)
          }}
          type="button"
        >
          <Home size={15} />
          <span>
            <span className="sceneButtonTitle">{floor.label.toUpperCase()}</span>
            <span className="sceneButtonSubtitle">{floor.sublabel}</span>
          </span>
        </button>
      ))}
    </aside>
  )
}
