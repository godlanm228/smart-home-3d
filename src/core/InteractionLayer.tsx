import { usePresentationStore } from '../store/usePresentationStore'
import { DeviceMarker } from '../scene/devices/DeviceMarker'

export function InteractionLayer() {
  const devices = usePresentationStore((state) => state.devices)
  const scene = usePresentationStore((state) => state.scenes[state.currentSceneIndex])
  const hoveredDeviceId = usePresentationStore((state) => state.hoveredDeviceId)
  const selectedDeviceId = usePresentationStore((state) => state.selectedDeviceId)

  // Clean intro scene: pure house visual, no markers/cones/callouts.
  if (scene.hud === 'clean') return null

  return (
    <group>
      {devices.map((device) => (
        <DeviceMarker
          device={device}
          focused={scene.focusDeviceIds?.includes(device.id) ?? false}
          hovered={hoveredDeviceId === device.id}
          key={device.id}
          selected={selectedDeviceId === device.id}
        />
      ))}
    </group>
  )
}
