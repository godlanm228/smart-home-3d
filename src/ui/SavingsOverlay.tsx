/** Scene 16: how the savings numbers actually arise — three levers with the
 *  mechanism per line, each ending in the Pflichtenheft target. Faustregeln
 *  are labeled as such so every number stays defensible in the exam. */
const LEVERS = [
  {
    title: 'Beleuchtung',
    goal: 'Ziel: −20 % Beleuchtungsstrom (Pflichtenheft-Muss)',
    lines: [
      'LED statt Alt-Leuchtmitteln — bis zu −85 % pro Lampe',
      'Präsenzautomatik: Licht brennt nur, wenn jemand im Raum ist',
      'Szenen & Dimmen statt dauerhaft 100 % Helligkeit',
    ],
  },
  {
    title: 'Heizung',
    goal: 'Ziel: −15 % Heizkosten (Pflichtenheft-Muss)',
    lines: [
      'Einzelraumregelung: ungenutzte Räume werden automatisch abgesenkt',
      'Faustregel: 1 °C weniger heizen ≈ −6 % Heizenergie',
      'Fenster-offen-Erkennung stoppt das Heizen sofort',
    ],
  },
  {
    title: 'Grundlast & Monitoring',
    goal: 'Basis für die Stufen-Kalkulation',
    lines: [
      'Smarte Steckdosen schalten Standby ab — bis ~10 % des Haushaltsstroms',
      'Energiemonitoring (Shelly Pro 3EM): Verbrauch sichtbar → gezielt senken',
      'Ausbau: PV + Energiemanagement — Eigenverbrauch statt Netzbezug',
    ],
  },
]

export function SavingsOverlay() {
  return (
    <div className="pitchOverlay savingsOverlay">
      <div className="pitchHead">
        <span className="pitchKicker">Der Rechenweg</span>
        <h2>Wie entsteht die Einsparung?</h2>
      </div>
      <div className="savingsGrid">
        {LEVERS.map((lever, i) => (
          <div className="savingsCard glass" key={lever.title} style={{ animationDelay: `${0.45 + i * 0.45}s` }}>
            <span className="savingsTitle">{lever.title}</span>
            {lever.lines.map((line) => (
              <span className="savingsLine" key={line}>{line}</span>
            ))}
            <span className="savingsGoal">{lever.goal}</span>
          </div>
        ))}
      </div>
      <div className="savingsTotal glass" style={{ animationDelay: '1.95s' }}>
        In Summe je Ausbaustufe: <b>Basic ≥ 10 %</b> · <b>Standard 15–20 %</b> · <b>Premium 25–30 %</b> — so kalkuliert in den drei Vollkosten-Stufen
      </div>
      <div className="pitchSrc" style={{ animationDelay: '2.3s' }}>
        Basis: Pflichtenheft-Zielwerte · Ausbaustufen-Kalkulation 06/2026 · Herstellerangaben & anerkannte Faustregeln
      </div>
    </div>
  )
}
