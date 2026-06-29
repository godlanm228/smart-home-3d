import type { FloorId } from '../types'

export interface FloorMeta {
  id: FloorId
  label: string
  sublabel: string
  rooms: string[]
}

/** Top → bottom order for the vertical floor selector (matches the mockup rail).
 *  KG · EG · 1.OG · Dachgeschoss · Dachboden — there is NO 2.OG. */
export const FLOORS: FloorMeta[] = [
  { id: 'dachboden', label: 'Dachboden', sublabel: 'Speicher (unbeheizt)', rooms: ['Speicher', 'Abstell'] },
  { id: 'dachgeschoss', label: 'Dachgeschoss', sublabel: 'Schlafräume & Bad', rooms: ['Schlafen', 'Schlafen', 'Schlafen', 'Bad/WC'] },
  { id: 'og1', label: '1. OG', sublabel: 'Schlafräume & Balkon', rooms: ['Schlafen', 'Schlafen', 'Schlafen', 'Bad/WC', 'Balkon'] },
  { id: 'eg', label: 'EG', sublabel: 'Wohnen & Küche', rooms: ['Wohnen', 'Küche', 'Diele/WC', 'Terrasse'] },
  { id: 'keller', label: 'KG', sublabel: 'Technik', rooms: ['Technik', 'Waschen', 'Lager'] },
  { id: 'garage', label: 'Garage', sublabel: 'Doppelgarage · 3 Zugänge', rooms: ['Garage'] },
  { id: 'outdoor', label: 'Garten', sublabel: 'Garten & Grundstück', rooms: ['Vorgarten', 'Garten 400 m²', 'Zufahrt'] },
]
