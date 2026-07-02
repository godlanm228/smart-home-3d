import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'

/** Bottom-left narration card: what the current scene is about. */
export function SceneInfoCard() {
  const scene = usePresentationStore(selectCurrentScene)
  const sceneCount = usePresentationStore((state) => state.scenes.length)

  return (
    <section aria-label="Szenenbeschreibung" className="sceneInfo glass">
      <div className="sceneInfoHead">
        <span className="sceneInfoIndex">
          {String(scene.index).padStart(2, '0')}<em>/{sceneCount}</em>
        </span>
        <div className="sceneInfoTitles">
          <h2 className="sceneInfoTitle">{scene.title}</h2>
          <p className="sceneInfoSubtitle">{scene.subtitle}</p>
        </div>
      </div>
      <p className="sceneInfoText">{scene.description}</p>
    </section>
  )
}
