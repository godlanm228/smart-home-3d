// Agent B (Claude): rewired from placeholders to the real ported data in src/data.
// Export names kept identical so the store/consumers stay untouched.
import { SCENES } from '../data/scenes'
import { DEVICES } from '../data/devices'
import { METRICS } from '../data/projectData'

export const BOOTSTRAP_SCENES = SCENES
export const BOOTSTRAP_DEVICES = DEVICES
export const BOOTSTRAP_METRICS = METRICS
