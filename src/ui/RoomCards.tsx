import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'

const cards = [
  ['Eingangsbereich', 'Tür, Kamera, Licht'],
  ['Wohnzimmer', 'Licht, Klima, Medien'],
  ['Küche', 'Steckdose, Sensorik'],
  ['Bad', 'Feuchte, Wärme, Licht'],
  ['Technik', 'NAS, UPS, Netzwerk'],
]

/** Intro strip — only on the overview/summary scenes to keep the HUD calm. */
export function RoomCards() {
  const scene = usePresentationStore(selectCurrentScene)
  if (scene.id !== 'overview' && scene.id !== 'summary') return null

  return (
    <section aria-label="Beispielzonen" className="roomCards">
      {cards.map(([title, text]) => (
        <article className="roomCard" key={title}>
          <div className="roomCardVisual" />
          <div className="roomCardBody">
            <div className="roomCardTitle">{title}</div>
            <div className="roomCardText">{text}</div>
          </div>
        </article>
      ))}
    </section>
  )
}
