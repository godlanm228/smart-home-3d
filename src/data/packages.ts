import type { PackageTier } from '../types'

/** Basic / Standard / Premium — real figures ported from the configurator.
 *  total = hardware + personnel. Standard total = 15.414 € (matches the live dock). */
export const TIERS: PackageTier[] = [
  { id: 'basic', label: 'Basic', hardware: 2615, personnel: 4630, durationWeeks: 2.5, energySaving: 10 },
  { id: 'standard', label: 'Standard', hardware: 7954, personnel: 7460, durationWeeks: 4.5, energySaving: 18 },
  { id: 'premium', label: 'Premium', hardware: 27300, personnel: 17610, durationWeeks: 13, energySaving: 28 },
]

export const TIER_TECH: Record<PackageTier['id'], string> = {
  basic: 'Funk-Retrofit (Zigbee/Wi-Fi/DECT) · Samsung SmartThings',
  standard: 'Marken-Funk (Hue, tado°, Ajax) unter SmartThings/Matter',
  premium: 'KNX-Bus (kabelgebunden) + DALI · SmartThings als Bedien-Layer',
}

export interface SmartModule {
  id: string
  name: string
  inBasis: Array<PackageTier['id']>
  cost: Record<PackageTier['id'], number>
  security?: boolean
}

/** Free add-on modules. inBasis = already included at that tier (cost 0). */
export const MODULES: SmartModule[] = [
  { id: 'licht_alle', name: 'Smartes Licht in ALLEN Räumen', inBasis: ['standard', 'premium'], cost: { basic: 1350, standard: 0, premium: 0 } },
  { id: 'hzg_einzel', name: 'Heizung: Einzelraumregelung (tado°/KNX)', inBasis: ['standard', 'premium'], cost: { basic: 980, standard: 0, premium: 0 } },
  { id: 'rollladen', name: 'Rollläden-Automatik EG', inBasis: ['standard', 'premium'], cost: { basic: 640, standard: 0, premium: 0 } },
  { id: 'alarm', name: 'Vollwertige Alarmanlage (Ajax/KNX)', inBasis: ['standard', 'premium'], cost: { basic: 850, standard: 0, premium: 0 }, security: true },
  { id: 'locks', name: 'Smart Locks / elektronische Zutrittskontrolle', inBasis: ['standard', 'premium'], cost: { basic: 520, standard: 0, premium: 0 }, security: true },
  { id: 'cam_garten', name: 'Garten-/Perimeter-Kameras (lückenlos)', inBasis: [], cost: { basic: 1180, standard: 980, premium: 1260 }, security: true },
  { id: 'vorgarten_cam', name: 'Vorgarten- & Straßenseiten-Überwachung', inBasis: [], cost: { basic: 620, standard: 560, premium: 680 }, security: true },
  { id: 'garage', name: 'Garagen-Tor & 3-Zugang-Sicherung', inBasis: [], cost: { basic: 780, standard: 720, premium: 900 }, security: true },
  { id: 'poller', name: 'Versenkbare Poller / Zufahrtssperre', inBasis: [], cost: { basic: 4200, standard: 4200, premium: 4600 }, security: true },
  { id: 'bewaesser', name: 'Gartenbewässerung (Garten + Vorgarten)', inBasis: [], cost: { basic: 680, standard: 620, premium: 900 } },
  { id: 'wallbox', name: 'E-Auto-Ladung / Wallbox 11 kW', inBasis: [], cost: { basic: 1800, standard: 1800, premium: 1400 } },
  { id: 'pv', name: 'PV-Anbindung & Energiemanagement', inBasis: ['premium'], cost: { basic: 1600, standard: 1400, premium: 0 } },
  { id: 'multiroom', name: 'Multiroom-Audio', inBasis: [], cost: { basic: 780, standard: 700, premium: 900 } },
  { id: 'heimkino', name: 'Heimkino / Projektor-Szene', inBasis: [], cost: { basic: 1500, standard: 1400, premium: 1300 } },
  { id: 'tv', name: 'Samsung-TV & Geräte-Einbindung', inBasis: ['standard', 'premium'], cost: { basic: 180, standard: 0, premium: 0 } },
  { id: 'balkon', name: 'Balkon-Automatik (1. OG)', inBasis: [], cost: { basic: 420, standard: 380, premium: 520 } },
  { id: 'praesenz', name: 'Anwesenheitssimulation & Urlaubsmodus', inBasis: ['premium'], cost: { basic: 240, standard: 200, premium: 0 }, security: true },
]

/** Client pre-selection on the Standard tier. */
export const DEFAULT_SELECTED = ['cam_garten', 'vorgarten_cam', 'bewaesser', 'garage']
