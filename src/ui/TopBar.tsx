import { Clock, Home, Keyboard, Layers, Menu, Sun, Users, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PROJECT } from '../data/projectData'
import { SceneStepper } from './SceneStepper'

/** Arbeitspakete summary (PM-Kurs WBS — Nummern/Namen ggf. ans Team anpassen). */
const WORK_PACKAGES = [
  'AP 1 · Projektüberblick & Management',
  'AP 3 · Netzwerk & Infrastruktur',
  'AP 4 · Sicherheit & Zutritt',
  'AP 5 · Komfort & Medien',
  'AP 6 · Garten & Außenbereich',
  'AP 7 · Energie & PV',
]

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="topBar glass">
      <div className="brand">
        <div className="brandIcon" aria-hidden="true">
          <Home size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brandTitle">SMART HOME</h1>
          <p className="eyebrow">Interaktive Präsentation</p>
        </div>
      </div>
      <SceneStepper />
      <div className="ambient" ref={menuRef}>
        <span className="chip">
          <Sun size={14} /> 21 °C
        </span>
        <span className="chip">
          <Clock size={14} /> 20:45
        </span>
        <button
          aria-expanded={menuOpen}
          aria-label="Menü"
          className={`iconButton ${menuOpen ? 'isActive' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>

        {menuOpen ? (
          <div className="menuPanel glass">
            <div className="menuSection">
              <h3 className="menuTitle">
                <Users size={13} /> Projekt & Credits
              </h3>
              <p className="menuLine strong">{PROJECT.group}</p>
              <p className="menuLine">{PROJECT.institution}</p>
              <p className="menuLine">Betreuung: {PROJECT.client}</p>
              <p className="menuLine credits">
                Konzept · Visualisierung · Entwicklung: <b>Vlad</b>
              </p>
              <p className="menuLine dim">3D-Showcase: React Three Fiber / Three.js</p>
            </div>
            <div className="menuSection">
              <h3 className="menuTitle">
                <Layers size={13} /> Arbeitspakete
              </h3>
              <ul className="menuList">
                {WORK_PACKAGES.map((wp) => (
                  <li key={wp}>{wp}</li>
                ))}
              </ul>
            </div>
            <div className="menuSection">
              <h3 className="menuTitle">
                <Keyboard size={13} /> Steuerung
              </h3>
              <p className="menuLine">← → Szenen wechseln</p>
              <p className="menuLine">Klick auf Gerät: Details · Esc: schließen</p>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
