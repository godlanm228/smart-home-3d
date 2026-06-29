import { Clock, Home, Menu, Sun } from 'lucide-react'
import { SceneStepper } from './SceneStepper'

export function TopBar() {
  return (
    <header className="topBar glass">
      <div className="brand">
        <div className="brandIcon" aria-hidden="true">
          <Home size={25} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brandTitle">SMART HOME</h1>
          <p className="eyebrow">Interactive Presentation</p>
        </div>
      </div>
      <SceneStepper />
      <div className="ambient">
        <span className="chip">
          <Sun size={15} /> 21 C
        </span>
        <span className="chip">
          <Clock size={15} /> 20:45
        </span>
        <button aria-label="Menue" className="iconButton" type="button">
          <Menu size={18} />
        </button>
      </div>
    </header>
  )
}
