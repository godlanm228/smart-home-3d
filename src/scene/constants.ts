import type { FloorId } from '../types'

/** House footprint (metres). Street/front faces +Z, garden faces -Z. */
export const HOUSE_W = 18
export const HOUSE_D = 11
export const HW = HOUSE_W / 2
export const HD = HOUSE_D / 2
export const FRONT_Z = HD

/** Storey height. Ground (grass top) sits at y = 0; the Keller is below ground. */
export const STOREY_H = 3.1
export const SLAB_T = 0.18

/** Bottom of each storey (4 Geschosse — Dachboden is the roof interior, not a storey). */
export const FLOOR_BASE: Record<'keller' | 'eg' | 'og1' | 'dachgeschoss', number> = {
  keller: -STOREY_H,
  eg: 0,
  og1: STOREY_H,
  dachgeschoss: STOREY_H * 2,
}

/** Walkable floor surface (slab top) per storey. */
export const FLOOR_TOP = {
  keller: FLOOR_BASE.keller + SLAB_T,
  eg: FLOOR_BASE.eg + SLAB_T,
  og1: FLOOR_BASE.og1 + SLAB_T,
  dachgeschoss: FLOOR_BASE.dachgeschoss + SLAB_T,
}

/** Roof: eaves sit on the Dachgeschoss ceiling; the Dachboden lives inside the roof. */
export const EAVES_Y = FLOOR_BASE.dachgeschoss + STOREY_H // 9.3
export const ROOF_H = 2.6
export const RIDGE_Y = EAVES_Y + ROOF_H

/** Attached double garage, right of the house, doors to the street (+Z). */
export const GARAGE_W = 8.2
export const GARAGE_D = 11
export const GARAGE_H = 3.0
export const GARAGE_X = HW + GARAGE_W / 2 - 0.1
export const GARAGE_Z = 1

/** Stacking order used by the cutaway (bottom → top). */
export const STACK_ORDER: FloorId[] = ['keller', 'eg', 'og1', 'dachgeschoss']

/** Room split per storey: [label, x0, x1] in house-local X. */
export type RoomSpan = [label: string, x0: number, x1: number]
export const ROOMS: Record<'keller' | 'eg' | 'og1' | 'dachgeschoss', RoomSpan[]> = {
  keller: [
    ['TECHNIK', -9, -3],
    ['WASCHEN', -3, 3],
    ['LAGER', 3, 9],
  ],
  eg: [
    ['WOHNEN', -9, -3],
    ['KÜCHE', -3, 3],
    ['DIELE/WC', 3, 9],
  ],
  og1: [
    ['SCHLAFEN', -9, -4.5],
    ['SCHLAFEN', -4.5, 0],
    ['SCHLAFEN', 0, 4.5],
    ['BAD/WC', 4.5, 9],
  ],
  dachgeschoss: [
    ['SCHLAFEN', -9, -4.5],
    ['SCHLAFEN', -4.5, 0],
    ['SCHLAFEN', 0, 4.5],
    ['BAD/WC', 4.5, 9],
  ],
}

export const FLOOR_TAG: Record<'keller' | 'eg' | 'og1' | 'dachgeschoss', string> = {
  keller: 'KG',
  eg: 'EG',
  og1: '1.OG',
  dachgeschoss: 'DG',
}
