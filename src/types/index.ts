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
}

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
