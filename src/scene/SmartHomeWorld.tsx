import { useThree } from '@react-three/fiber'
import { Environs } from './environment/Environment'
import { Garden } from './environment/Garden'
import { Ground } from './environment/Ground'
import { Skyline } from './environment/Skyline'
import { EnergyFlow } from './effects/EnergyFlow'
import { Garage } from './house/Garage'
import { HouseShell } from './house/HouseShell'
import { Terrace } from './house/Terrace'
import { Furniture } from './interiors/Furniture'

/** Dev-only: exposes the three.js scene + camera for eval-based debugging
 *  (numeric checks, screenshot framing). No-op in production builds. */
function DevSceneHandle() {
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>
    w.__scene = scene
    w.__camera = camera
  }
  return null
}

/** Full 3D world: atmosphere, plot, house with garage and interiors.
 *  Rendered as a fragment so <fogExp2 attach="fog"> reaches the scene root. */
export function SmartHomeWorld() {
  return (
    <>
      <DevSceneHandle />
      <Environs />
      <group>
        <Ground />
        <Garden />
        <Skyline />
        <HouseShell />
        <Garage />
        <Terrace />
        <Furniture />
        <EnergyFlow />
      </group>
    </>
  )
}
