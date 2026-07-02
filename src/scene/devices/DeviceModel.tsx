import { useMemo } from 'react'
import * as THREE from 'three'
import type { DeviceKind } from '../../types'

/** Shared neutral materials for device bodies. */
const bodyDark = new THREE.MeshStandardMaterial({ color: '#252d36', roughness: 0.45, metalness: 0.45 })
const bodyLight = new THREE.MeshStandardMaterial({ color: '#d7dde3', roughness: 0.5, metalness: 0.15 })
const bodyMid = new THREE.MeshStandardMaterial({ color: '#5b6570', roughness: 0.55, metalness: 0.3 })
const glassDark = new THREE.MeshStandardMaterial({ color: '#0d141c', roughness: 0.15, metalness: 0.6 })

type Props = {
  kind: DeviceKind
  accent: THREE.MeshStandardMaterial
  emissiveBoost: number
}

/**
 * Procedural mini-models for every device kind — real bodies instead of glow
 * orbs. Each model is centred on the marker position, ~0.3–0.6 m tall, and
 * carries an accent part driven by the device glow colour.
 */
export function DeviceModel({ kind, accent, emissiveBoost }: Props) {
  void emissiveBoost
  switch (kind) {
    case 'camera':
      return (
        <group>
          {/* mount arm points back, body looks toward +Z (group is aimed by the marker) */}
          <mesh position={[0, 0.1, -0.16]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.22, 8]} />
            <primitive attach="material" object={bodyMid} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.2, 0.17, 0.34]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.08, 14]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
          <mesh position={[0.06, 0.055, 0.18]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'doorbell':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.13, 0.26, 0.05]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.06, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
          <mesh position={[0, -0.06, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.02, 12]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'lock':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.14, 0.3, 0.06]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0.03, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.06, 14]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, -0.1, 0.035]}>
            <boxGeometry args={[0.08, 0.02, 0.02]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'fingerprint':
      return (
        <group>
          <mesh rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.14, 0.2, 0.045]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.02, 0.035]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.08, 0.1, 0.012]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'siren':
      return (
        <group>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.07, 16]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'controlbox':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.24, 0.3, 0.09]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0.09, 0.26, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[-0.05, 0.06, 0.05]}>
            <boxGeometry args={[0.08, 0.05, 0.01]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'wallbox':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.3, 0.42, 0.12]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0.05, 0.065]}>
            <boxGeometry args={[0.2, 0.16, 0.012]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
          <mesh position={[0, -0.13, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, -0.245, 0.03]}>
            <torusGeometry args={[0.09, 0.02, 8, 14, Math.PI]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.17, 0.065]}>
            <boxGeometry args={[0.22, 0.02, 0.012]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'poller':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.09, 0.1, 0.52, 14]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.05, 14]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'sprinkler':
      return (
        <group>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.16, 10]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'mower':
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.34, 0.13, 0.5]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.1, -0.05]}>
            <boxGeometry args={[0.28, 0.06, 0.3]} />
            <primitive attach="material" object={accent} />
          </mesh>
          {[
            [-0.15, -0.18],
            [0.15, -0.18],
            [-0.15, 0.16],
            [0.15, 0.16],
          ].map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, -0.045, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.03, 10]} />
              <primitive attach="material" object={glassDark} />
            </mesh>
          ))}
        </group>
      )
    case 'light':
      return (
        <group>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 5]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.14, 0.12, 16, 1, true]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'tv':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.5, 0.3, 0.03]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
          <mesh position={[0, 0.01, 0.012]}>
            <boxGeometry args={[0.46, 0.24, 0.012]} />
            <primitive attach="material" object={accent} />
          </mesh>
          <mesh position={[0, -0.19, 0]}>
            <boxGeometry args={[0.16, 0.02, 0.1]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
        </group>
      )
    case 'speaker':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.09, 0.11, 0.3, 14]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.02, 14]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'thermostat':
      return (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.045, 20]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.085, 0.014, 8, 24]} />
            <primitive attach="material" object={accent} />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
        </group>
      )
    case 'sensor':
      return (
        <group>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.09, 0.1, 0.045, 14]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <sphereGeometry args={[0.055, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'plug':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.16, 0.16, 0.05]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 14]} />
            <primitive attach="material" object={bodyMid} />
          </mesh>
          <mesh position={[0, -0.095, 0.02]}>
            <boxGeometry args={[0.1, 0.015, 0.015]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'rack':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.3, 0.5, 0.24]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          {[0.14, 0.02, -0.1].map((y) => (
            <mesh key={y} position={[0, y, 0.125]}>
              <boxGeometry args={[0.22, 0.03, 0.01]} />
              <primitive attach="material" object={accent} />
            </mesh>
          ))}
        </group>
      )
    case 'nvr':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.34, 0.12, 0.26]} />
            <primitive attach="material" object={bodyDark} />
          </mesh>
          {[-0.08, 0.04].map((x) => (
            <mesh key={x} position={[x, 0, 0.135]}>
              <boxGeometry args={[0.07, 0.025, 0.01]} />
              <primitive attach="material" object={accent} />
            </mesh>
          ))}
        </group>
      )
    case 'meter':
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.26, 0.34, 0.08]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0.05, 0.045]}>
            <boxGeometry args={[0.18, 0.12, 0.012]} />
            <primitive attach="material" object={accent} />
          </mesh>
          <mesh position={[0, -0.1, 0.045]}>
            <boxGeometry args={[0.18, 0.04, 0.01]} />
            <primitive attach="material" object={glassDark} />
          </mesh>
        </group>
      )
    case 'smoke':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.11, 0.13, 0.05, 18]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0.05, -0.03, 0.05]}>
            <sphereGeometry args={[0.016, 6, 6]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    case 'pv':
      return (
        <group rotation={[0.5, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.42, 0.02, 0.3]} />
            <primitive attach="material" object={bodyLight} />
          </mesh>
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.38, 0.012, 0.26]} />
            <primitive attach="material" object={accent} />
          </mesh>
        </group>
      )
    default:
      return (
        <mesh>
          <sphereGeometry args={[0.14, 16, 16]} />
          <primitive attach="material" object={accent} />
        </mesh>
      )
  }
}

/** Per-device accent material (emissive in the device glow colour). */
export function useAccentMaterial(color: string) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.3,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [color],
  )
}
