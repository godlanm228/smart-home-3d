import { SceneCanvas } from '../core/SceneCanvas'
import { DeviceInfoPanel } from './DeviceInfoPanel'
import { FloorSelector } from './FloorSelector'
import { MetricsDock } from './MetricsDock'
import { RoomCards } from './RoomCards'
import { SceneNavigation } from './SceneNavigation'
import { StartOverlay } from './StartOverlay'
import { TopBar } from './TopBar'

export function Layout() {
  return (
    <main className="experience">
      <div className="canvasLayer">
        <SceneCanvas />
      </div>
      <div className="hud">
        <TopBar />
        <SceneNavigation />
        <FloorSelector />
        <DeviceInfoPanel />
        <MetricsDock />
        <RoomCards />
        <StartOverlay />
      </div>
    </main>
  )
}
