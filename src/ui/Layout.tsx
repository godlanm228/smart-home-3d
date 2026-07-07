import { SceneCanvas } from '../core/SceneCanvas'
import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'
import { DeviceInfoPanel } from './DeviceInfoPanel'
import { EdgeNav } from './EdgeNav'
import { FloorSelector } from './FloorSelector'
import { MetricsDock } from './MetricsDock'
import { RoomCards } from './RoomCards'
import { SceneInfoCard } from './SceneInfoCard'
import { StartOverlay } from './StartOverlay'
import { TopBar } from './TopBar'

export function Layout() {
  const scene = usePresentationStore(selectCurrentScene)
  const introDismissed = usePresentationStore((state) => state.introDismissed)
  const clean = scene.hud === 'clean'

  return (
    <main className="experience">
      <div className="canvasLayer">
        <SceneCanvas />
      </div>
      <div className="hud">
        {clean ? null : (
          <>
            <TopBar />
            <FloorSelector />
            <SceneInfoCard />
            <DeviceInfoPanel />
            <MetricsDock />
            <RoomCards />
          </>
        )}
        <EdgeNav />
        {clean && introDismissed ? (
          <div className="cleanHint glass">
            Smart Home · Gruppe 7<span className="hintDesktop">Pfeiltaste → für den Rundgang</span>
            <span className="hintTouch">Pfeil antippen → Rundgang</span>
          </div>
        ) : null}
        <StartOverlay />
      </div>
    </main>
  )
}
