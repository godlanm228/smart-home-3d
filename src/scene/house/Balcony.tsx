import { CanvasLabel } from '../CanvasLabel'
import { FLOOR_TOP, FRONT_Z, HW } from '../constants'
import { railGlassMat, railMetalMat, structureMat } from '../materials'
import { ExplodeGroup, useFloorOffsets } from './CutawayController'

const BAL_W = 4.5
const BAL_D = 2.4
const BAL_X = HW - BAL_W / 2 // front-right, over the entrance
const BAL_Z = FRONT_Z + BAL_D / 2 // cantilevered OUTSIDE the facade
const FLOOR_Y = FLOOR_TOP.og1
const OUTER_Z = FRONT_Z + BAL_D

function RailSegment({ w, d, x, z }: { w: number; d: number; x: number; z: number }) {
  return (
    <group>
      <mesh castShadow position={[x, FLOOR_Y + 0.27, z]}>
        <boxGeometry args={[w, 0.5, d]} />
        <primitive attach="material" object={railGlassMat} />
      </mesh>
      <mesh position={[x, FLOOR_Y + 0.55, z]}>
        <boxGeometry args={[w + 0.06, 0.07, d + 0.06]} />
        <primitive attach="material" object={railMetalMat} />
      </mesh>
    </group>
  )
}

/** Cantilevered balcony on the 1.OG — protrudes from the front facade above
 *  the entrance (doubles as its canopy), glass railing on all three open
 *  sides, two slim porch posts down to the ground. */
export function Balcony() {
  const offsets = useFloorOffsets()
  return (
    <ExplodeGroup target={offsets.og1}>
      <mesh castShadow position={[BAL_X, FLOOR_Y - 0.09, BAL_Z]} receiveShadow>
        <boxGeometry args={[BAL_W, 0.18, BAL_D]} />
        <primitive attach="material" object={structureMat} />
      </mesh>
      {/* glass railing: outer edge + both sides */}
      <RailSegment d={0.05} w={BAL_W} x={BAL_X} z={OUTER_Z} />
      <RailSegment d={BAL_D} w={0.05} x={BAL_X - BAL_W / 2} z={BAL_Z} />
      <RailSegment d={BAL_D} w={0.05} x={BAL_X + BAL_W / 2} z={BAL_Z} />
      {[
        [BAL_X - BAL_W / 2, OUTER_Z],
        [BAL_X + BAL_W / 2, OUTER_Z],
        [BAL_X - BAL_W / 2, FRONT_Z + 0.05],
        [BAL_X + BAL_W / 2, FRONT_Z + 0.05],
      ].map(([x, z]) => (
        <mesh castShadow key={`${x}-${z}`} position={[x, FLOOR_Y + 0.29, z]}>
          <boxGeometry args={[0.1, 0.62, 0.1]} />
          <primitive attach="material" object={railMetalMat} />
        </mesh>
      ))}
      {/* slim porch posts — carry the cantilever, frame the entrance */}
      {[BAL_X - BAL_W / 2 + 0.15, BAL_X + BAL_W / 2 - 0.15].map((x) => (
        <mesh castShadow key={x} position={[x, (FLOOR_Y - 0.18) / 2, OUTER_Z - 0.18]}>
          <boxGeometry args={[0.12, FLOOR_Y - 0.18, 0.12]} />
          <primitive attach="material" object={railMetalMat} />
        </mesh>
      ))}
      <CanvasLabel color="#dce8f6" position={[BAL_X, FLOOR_Y + 0.95, BAL_Z]} scale={1.6} text="BALKON" />
    </ExplodeGroup>
  )
}
