import type { CameraPose } from '../types'

export const cloneCameraPose = (pose: CameraPose): CameraPose => ({
  ...pose,
  position: [...pose.position],
  target: [...pose.target],
})
