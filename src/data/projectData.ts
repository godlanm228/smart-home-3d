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

/** Team & Verantwortungsbereiche (PSP / Arbeitspakete; A. Abdulai hat das Team verlassen). */
export const TEAM = [
  { name: 'Ali Al-Toki', area: 'Beleuchtung' },
  { name: 'Amir Salehi', area: 'Klima & Energie' },
  { name: 'Soukaina Rhanimi', area: 'Steuerung & Interface · Protokoll' },
  { name: 'Ruben Garcia Gomes', area: 'Sicherheit' },
  { name: 'Vladyslav Kulahin', area: 'Datenschutz · IT-Sicherheit · Trends' },
]

/** PSP-Hauptknoten mit Verantwortlichen — gezeigt im Menü. */
export const WORK_PACKAGES = [
  'AP 1 · Projektmanagement — Team',
  'AP 2.1 · Beleuchtung — A. Al-Toki',
  'AP 2.2 · Klima & Energie — A. Salehi',
  'AP 2.3 · Steuerung & Interface — S. Rhanimi',
  'AP 2.4 · Sicherheit — R. Garcia Gomes',
  'AP 2.5 · Datenschutz & Trends — V. Kulahin',
  'AP 3 · Konzeption — Team',
  'AP 4 · Dokumentation — Team',
  'AP 5 · Präsentation — Team',
]

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
