import type { Metrics } from '../types'
import { securityScore } from './pricing'
import { DEFAULT_SELECTED } from './packages'

export const PROJECT = {
  title: 'Smart Home',
  subtitle: 'Interaktive Präsentation',
  group: 'Gruppe 7 · Projektmanagement SoSe 2026',
  institution: 'HRW · Campus Bottrop',
  client: 'Prof. Dr.-Ing. M. W. Asmah',
  livingAreaM2: 180,
  gardenM2: 400,
  bedrooms: 6,
  bathrooms: 2,
  wc: 3,
  garageAccesses: 3,
}

/** Live metrics dock. securityScore is computed from the real pricing logic
 *  (Standard tier + client pre-selection). temp/humidity/energy are ambient. */
export const METRICS: Metrics = {
  devicesActive: 84,
  camerasActive: 8,
  tempC: 22.3,
  humidity: 48,
  energyKw: 2.4,
  securityScore: securityScore('standard', DEFAULT_SELECTED),
  tier: 'standard',
}
