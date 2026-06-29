import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePresentationStore } from '../../store/usePresentationStore'
import type { DeviceInfo } from '../../types'

type DeviceMarkerProps = {
  device: DeviceInfo
  focused: boolean
  hovered: boolean
  selected: boolean
}

const tempColor = new THREE.Color()

export function DeviceMarker({ device, focused, hovered, selected }: DeviceMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const selectDevice = usePresentationStore((state) => state.selectDevice)
  const setHoveredDevice = usePresentationStore((state) => state.setHoveredDevice)
  const color = useMemo(() => tempColor.clone().set(device.glowColor ?? '#39a9ff'), [device.glowColor])

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 3.2 + device.position[0]) * 0.08
    const baseScale = selected ? 1.42 : hovered ? 1.24 : focused ? 1.12 : 1
    groupRef.current?.scale.setScalar(baseScale * pulse)

    const material = coreRef.current?.material
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissiveIntensity = selected || hovered ? 3.8 : focused ? 2.4 : 1.45
    }
  })

  return (
    <group
      ref={groupRef}
      position={device.position}
      onClick={(event) => {
        event.stopPropagation()
        selectDevice(device.id)
      }}
      onPointerOut={() => setHoveredDevice(null)}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHoveredDevice(device.id)
      }}
    >
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.7} roughness={0.32} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={selected || hovered ? 0.28 : 0.14} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.018, 10, 42]} />
        <meshBasicMaterial color={color} transparent opacity={0.68} />
      </mesh>
      {device.showCone ? (
        <mesh position={[0, -0.08, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.75, 2.4, 32, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={hovered || selected ? 0.18 : 0.08} side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  )
}
