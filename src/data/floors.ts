import type { FloorId } from '../types'

export interface FloorMeta {
  id: FloorId
  label: string
  sublabel: string
  rooms: string[]
}

/** Vertical zones for the floor selector (top → bottom).
 *  ARCHITECTURE: 4 Geschosse + Dachraum — NOT 5 floors.
 *  keller = Keller (BASEMENT, below ground) · eg · og1 · dachgeschoss = TOP living floor.
 *  dachboden = the unfinished attic void INSIDE the roof (Speicher, unbeheizt) — NOT a storey.
 *  There is NO 2.OG. */
export const FLOORS: FloorMeta[] = [
  { id: 'dachboden', label: 'Dachboden', sublabel: 'Speicher (unbeheizt)', rooms: ['Speicher'] },
  { id: 'dachgeschoss', label: 'Dachgeschoss', sublabel: 'Schlafräume & Bad', rooms: ['Schlafen', 'Schlafen', 'Schlafen', 'Bad/WC'] },
  { id: 'og1', label: '1. OG', sublabel: 'Schlafen & Balkon', rooms: ['Schlafen', 'Schlafen', 'Schlafen', 'Bad/WC', 'Balkon'] },
  { id: 'eg', label: 'EG', sublabel: 'Wohnen & Küche', rooms: ['Wohnen', 'Küche', 'Diele/WC', 'Terrasse'] },
  { id: 'keller', label: 'KG', sublabel: 'Keller · Technik', rooms: ['Technik', 'Waschen', 'Lager'] },
  { id: 'garage', label: 'Garage', sublabel: '3 Zugänge', rooms: ['Garage'] },
  { id: 'outdoor', label: 'Garten', sublabel: 'Grundstück', rooms: ['Vorgarten', 'Garten 400 m²', 'Zufahrt'] },
]
