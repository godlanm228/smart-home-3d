import type { PackageTier } from '../types'
import { TIERS, MODULES } from './packages'

export interface CostBreakdown {
  hardware: number
  personnel: number
  total: number
  durationWeeks: number
  energySaving: number
}

/** Total cost for a tier + chosen extra modules (ported calc: split add-on 60/40 hw/pers). */
export function calcCost(tierId: PackageTier['id'], selected: string[]): CostBreakdown {
  const tier = TIERS.find((t) => t.id === tierId) ?? TIERS[1]
  let hardware = tier.hardware
  let personnel = tier.personnel
  let total = tier.hardware + tier.personnel
  for (const m of MODULES) {
    const inBasis = m.inBasis.includes(tierId)
    if (!inBasis && selected.includes(m.id)) {
      const k = m.cost[tierId] || 0
      hardware += Math.round(k * 0.6)
      personnel += Math.round(k * 0.4)
      total += k
    }
  }
  return { hardware, personnel, total, durationWeeks: tier.durationWeeks, energySaving: tier.energySaving }
}

const SEC_WEIGHT: Record<string, number> = {
  alarm: 6, locks: 4, cam_garten: 8, vorgarten_cam: 5, garage: 5, poller: 6, praesenz: 4,
}

/** Security score 0..100: base by tier + active security modules. */
export function securityScore(tierId: PackageTier['id'], selected: string[]): number {
  let lvl = { basic: 35, standard: 55, premium: 80 }[tierId]
  for (const m of MODULES) {
    if (!m.security) continue
    const on = m.inBasis.includes(tierId) || selected.includes(m.id)
    if (on) lvl += SEC_WEIGHT[m.id] ?? 3
  }
  return Math.min(100, lvl)
}
