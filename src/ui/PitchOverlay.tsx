/** Finale scene: the concept's key numbers as staggered glass tiles.
 *  Numbers are the Pflichtenheft targets / Ausbaustufen calculation — the
 *  source line keeps the "wissenschaftlicher Verkauf" honest. */
const TILES = [
  { big: '−20 %', label: 'Beleuchtungsstrom', sub: 'LED-Szenen + Präsenzautomatik in Wohnräumen, Küche und Fluren' },
  { big: '−15 %', label: 'Heizkosten', sub: 'Einzelraumregelung an allen Heizkörpern statt Dauerheizen' },
  { big: '10–30 %', label: 'Gesamteinsparung', sub: 'je Ausbaustufe — in drei Vollkosten-Stufen kalkuliert' },
  { big: '≤ 5 s', label: 'Alarm aufs Handy', sub: 'Kamera → Push, mit DSGVO-Masking der Nachbarflächen' },
  { big: '100 % lokal', label: 'Daten bleiben im Haus', sub: 'NVR im Keller statt Cloud — Datenschutz by Design' },
  { big: 'ab 7.245 €', label: 'modular erweiterbar', sub: 'Stufe wählen, Module ergänzen — wächst ohne Neukauf mit' },
]

export function PitchOverlay() {
  return (
    <div className="pitchOverlay">
      <div className="pitchHead">
        <span className="pitchKicker">Das Konzept in Zahlen</span>
        <h2>Messbar sparen — nachweisbar geplant</h2>
      </div>
      <div className="pitchGrid">
        {TILES.map((tile, i) => (
          <div className="pitchTile glass" key={tile.label} style={{ animationDelay: `${0.5 + i * 0.3}s` }}>
            <span className="pitchBig">{tile.big}</span>
            <span className="pitchLabel">{tile.label}</span>
            <span className="pitchSub">{tile.sub}</span>
          </div>
        ))}
      </div>
      <div className="pitchSrc" style={{ animationDelay: `${0.5 + TILES.length * 0.3 + 0.25}s` }}>
        Quellen: Pflichtenheft (Zielwerte) · Ausbaustufen-Kalkulation, Stand 06/2026 · Herstellerangaben
      </div>
    </div>
  )
}
