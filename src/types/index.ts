export type FloorId =
  | 'outdoor'
  | 'keller'
  | 'eg'
  | 'og1'
  | 'dachgeschoss'
  | 'dachboden'
  | 'roof'
  | 'garage'

export type DeviceCategory =
  | 'security'
  | 'energy'
  | 'comfort'
  | 'climate'
  | 'media'
  | 'infrastructure'
  | 'garden'

export interface CameraPose {
  position: [number, number, number]
  target: [number, number, number]
  fov?: number
  duration?: number
}

export interface PresentationScene {
  id: string
  index: number
  title: string
  subtitle: string
  floor?: FloorId
  camera: CameraPose
  description: string
  focusDeviceIds?: string[]
  visibleFloorIds?: FloorId[]
  cutawayMode?: 'none' | 'roof-off' | 'floor-focus' | 'exploded'
  /** Arbeitspaket tag (PM course WBS), e.g. "AP 4 · Sicherheit & Zutritt". */
  workPackage?: string
}

/** Visual body of a device marker — picks a procedural mini-model. */
export type DeviceKind =
  | 'camera'
  | 'doorbell'
  | 'lock'
  | 'fingerprint'
  | 'siren'
  | 'controlbox'
  | 'wallbox'
  | 'poller'
  | 'sprinkler'
  | 'mower'
  | 'light'
  | 'tv'
  | 'speaker'
  | 'thermostat'
  | 'sensor'
  | 'plug'
  | 'rack'
  | 'nvr'
  | 'meter'
  | 'smoke'
  | 'pv'

export interface DeviceInfo {
  id: string
  label: string
  shortLabel: string
  category: DeviceCategory
  floor: FloorId
  position: [number, number, number]
  status: 'online' | 'offline' | 'planned' | 'included'
  packageLevel?: 'basic' | 'standard' | 'premium' | 'module'
  description: string
  features: string[]
  benefit: string
  cost?: number
  showCone?: boolean
  glowColor?: string
  /** Procedural 3D body for the marker (fallback: glowing orb). */
  kind?: DeviceKind
  /** Where a camera looks — drives the aimed view cone + body orientation. */
  coneTarget?: [number, number, number]
}

export interface PackageTier {
  id: 'basic' | 'standard' | 'premium'
  label: string
  hardware: number
  personnel: number
  durationWeeks: number
  energySaving: number
}

export interface Metrics {
  devicesActive: number
  camerasActive: number
  tempC: number
  humidity: number
  energyKw: number
  securityScore: number
  tier: PackageTier['id']
}
