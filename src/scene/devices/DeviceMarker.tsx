import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { selectCurrentScene, usePresentationStore } from '../../store/usePresentationStore'
import type { DeviceInfo } from '../../types'
import { offsetFor, useFloorOffsets } from '../house/CutawayController'
import { DeviceModel, useAccentMaterial } from './DeviceModel'

type DeviceMarkerProps = {
  device: DeviceInfo
  focused: boolean
  hovered: boolean
  selected: boolean
}

const CATEGORY_DE: Record<DeviceInfo['category'], string> = {
  security: 'Sicherheit',
  energy: 'Energie',
  comfort: 'Komfort',
  climate: 'Klima',
  media: 'Multimedia',
  infrastructure: 'Infrastruktur',
  garden: 'Garten',
}

/** Aimed view cone + ground footprint for camera devices. */
function ViewCone({
  delta,
  color,
  strength,
}: {
  delta: THREE.Vector3
  color: string
  strength: number
}) {
  const { quaternion, length, radius, midpoint } = useMemo(() => {
    const length = delta.length()
    const dir = delta.clone().normalize()
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
    return { quaternion, length, radius: length * 0.36, midpoint: dir.multiplyScalar(length / 2) }
  }, [delta])

  return (
    <group>
      <mesh position={midpoint} quaternion={quaternion}>
        <coneGeometry args={[radius, length, 24, 1, true]} />
        <meshBasicMaterial color={color} depthWrite={false} opacity={0.055 + strength * 0.11} side={THREE.DoubleSide} transparent />
      </mesh>
      {/* footprint ellipse on the ground at the aim point */}
      <mesh position={[delta.x, delta.y + 0.04, delta.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.9, radius, 36]} />
        <meshBasicMaterial color={color} depthWrite={false} opacity={0.25 + strength * 0.35} side={THREE.DoubleSide} transparent />
      </mesh>
    </group>
  )
}

export function DeviceMarker({ device, focused, hovered, selected }: DeviceMarkerProps) {
  const rootRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const scene = usePresentationStore(selectCurrentScene)
  const selectDevice = usePresentationStore((state) => state.selectDevice)
  const setHoveredDevice = usePresentationStore((state) => state.setHoveredDevice)
  const accent = useAccentMaterial(device.glowColor ?? '#39a9ff')
  const haloColor = useMemo(() => new THREE.Color(device.glowColor ?? '#39a9ff'), [device.glowColor])
  const offsets = useFloorOffsets()

  /** Presentation focus: irrelevant devices leave the stage, others step back. */
  const onVisibleFloor = !scene.visibleFloorIds || scene.visibleFloorIds.includes(device.floor)
  const hasFocusList = (scene.focusDeviceIds?.length ?? 0) > 0
  const dimmed = !focused && !hovered && !selected && hasFocusList

  /** Camera bodies look at their cone target. */
  const { aimQuaternion, coneDelta } = useMemo(() => {
    if (!device.coneTarget) return { aimQuaternion: null, coneDelta: null }
    const delta = new THREE.Vector3(
      device.coneTarget[0] - device.position[0],
      device.coneTarget[1] - device.position[1],
      device.coneTarget[2] - device.position[2],
    )
    const helper = new THREE.Object3D()
    helper.lookAt(delta)
    return { aimQuaternion: helper.quaternion.clone(), coneDelta: delta }
  }, [device.coneTarget, device.position])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  const yOffset = offsetFor(offsets, device.floor)

  useFrame(({ clock }, delta) => {
    const root = rootRef.current
    if (root) {
      root.position.y = THREE.MathUtils.damp(root.position.y, device.position[1] + yOffset, 3.2, delta)
    }
    const pulse = focused ? 1 + Math.sin(clock.elapsedTime * 2.6 + device.position[0]) * 0.05 : 1
    const baseScale = selected ? 1.3 : hovered ? 1.2 : dimmed ? 0.86 : 1
    bodyRef.current?.scale.setScalar(baseScale * pulse)
    accent.emissiveIntensity = selected ? 3.4 : hovered ? 2.8 : focused ? 2.2 : dimmed ? 0.55 : 1.25
  })

  if (!focused && !selected && !onVisibleFloor) return null

  const strength = selected ? 1 : hovered ? 0.8 : focused ? 0.45 : 0

  return (
    <group position={device.position} ref={rootRef}>
      <group
        onClick={(event) => {
          event.stopPropagation()
          selectDevice(device.id)
        }}
        onPointerOut={() => setHoveredDevice(null)}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHoveredDevice(device.id)
        }}
        ref={bodyRef}
      >
        <group quaternion={aimQuaternion ?? undefined}>
          <DeviceModel accent={accent} emissiveBoost={strength} kind={device.kind ?? 'sensor'} />
        </group>
        {/* soft aura so devices stay findable at distance */}
        <mesh>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshBasicMaterial
            color={haloColor}
            depthWrite={false}
            opacity={selected || hovered ? 0.11 : focused ? 0.09 : dimmed ? 0.02 : 0.05}
            transparent
          />
        </mesh>
      </group>

      {coneDelta && !dimmed ? <ViewCone color={device.glowColor ?? '#39a9ff'} delta={coneDelta} strength={strength} /> : null}

      {hovered && !selected ? (
        <Html center distanceFactor={11} position={[0, 0.6, 0]} zIndexRange={[2, 1]}>
          <div className="deviceTip">
            <span className="deviceTipTitle">{device.label}</span>
            <span className="deviceTipMeta">
              {CATEGORY_DE[device.category]} · {device.shortLabel}
            </span>
            <span className="deviceTipHint">Klicken für Details</span>
          </div>
        </Html>
      ) : null}
    </group>
  )
}
