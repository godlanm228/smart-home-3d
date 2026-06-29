import { usePresentationStore } from '../store/usePresentationStore'

export function StartOverlay() {
  const introDismissed = usePresentationStore((state) => state.introDismissed)
  const dismissIntro = usePresentationStore((state) => state.dismissIntro)

  return (
    <div className={`startOverlay ${introDismissed ? 'isHidden' : ''}`}>
      <div className="startPanel glass">
        <h2>Smart Home</h2>
        <p>Interactive Presentation</p>
        <button className="primaryAction" onClick={dismissIntro} type="button">
          Starten
        </button>
      </div>
    </div>
  )
}
