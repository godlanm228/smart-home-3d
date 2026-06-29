const cards = [
  ['Eingangsbereich', 'Tuer, Kamera, Licht'],
  ['Wohnzimmer', 'Licht, Klima, Medien'],
  ['Kueche', 'Steckdose, Sensorik'],
  ['Bad', 'Feuchte, Waerme, Licht'],
  ['Technik', 'NAS, UPS, Netzwerk'],
]

export function RoomCards() {
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
