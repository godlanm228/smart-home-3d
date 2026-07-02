import { CanvasLabel } from '../CanvasLabel'
import { FLOOR_TOP, FRONT_Z, HW } from '../constants'
import { railGlassMat, railMetalMat, structureMat } from '../materials'

const BAL_W = 4.5
const BAL_D = 2.4
const BAL_X = HW - BAL_W / 2
const BAL_Z = FRONT_Z - BAL_D / 2
const FLOOR_Y = FLOOR_TOP.og1

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

/** Recessed corner loggia on the 1.OG (front-right, flush with the facade). */
export function Balcony() {
  return (
    <group>
      <mesh castShadow position={[BAL_X, FLOOR_Y - 0.09, BAL_Z]} receiveShadow>
        <boxGeometry args={[BAL_W, 0.18, BAL_D]} />
        <primitive attach="material" object={structureMat} />
      </mesh>
      <RailSegment d={0.05} w={BAL_W} x={BAL_X} z={FRONT_Z} />
      <RailSegment d={BAL_D} w={0.05} x={BAL_X - BAL_W / 2} z={BAL_Z} />
      {[
        [BAL_X - BAL_W / 2, FRONT_Z],
        [BAL_X + BAL_W / 2, FRONT_Z],
        [BAL_X - BAL_W / 2, BAL_Z - BAL_D / 2],
      ].map(([x, z]) => (
        <mesh castShadow key={`${x}-${z}`} position={[x, FLOOR_Y + 0.29, z]}>
          <boxGeometry args={[0.1, 0.62, 0.1]} />
          <primitive attach="material" object={railMetalMat} />
        </mesh>
      ))}
      <CanvasLabel color="#dce8f6" position={[BAL_X, FLOOR_Y + 0.9, BAL_Z]} scale={1.6} text="BALKON" />
    </group>
  )
}
