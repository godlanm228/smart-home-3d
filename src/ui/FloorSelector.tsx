import { Home } from 'lucide-react'
import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'
import type { FloorId } from '../types'

const floors: Array<{ id: FloorId; label: string; subtitle: string }> = [
  { id: 'dachboden', label: 'DACHBODEN', subtitle: 'Speicher' },
  { id: 'dachgeschoss', label: 'DACHGESCHOSS', subtitle: 'Mansarde' },
  { id: 'og1', label: '1.OG', subtitle: 'Erste Etage' },
  { id: 'eg', label: 'EG', subtitle: 'Erdgeschoss' },
  { id: 'keller', label: 'KG', subtitle: 'Keller' },
  { id: 'garage', label: 'GARAGE', subtitle: 'Zufahrt' },
  { id: 'outdoor', label: 'GARTEN', subtitle: 'Grundstueck' },
]

export function FloorSelector() {
  const currentScene = usePresentationStore(selectCurrentScene)

  return (
    <aside aria-label="Etagen" className="floorSelector glass">
      {floors.map((floor) => (
        <button className={`floorButton ${currentScene.floor === floor.id ? 'isActive' : ''}`} key={floor.id} type="button">
          <Home size={15} />
          <span>
            <span className="sceneButtonTitle">{floor.label}</span>
            <span className="sceneButtonSubtitle">{floor.subtitle}</span>
          </span>
        </button>
      ))}
    </aside>
  )
}
