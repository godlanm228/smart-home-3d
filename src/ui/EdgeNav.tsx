import { usePresentationStore } from '../store/usePresentationStore'

/** Big edge-mounted prev/next buttons for touch devices (QR visitors on
 *  phones have no keyboard). Hidden on desktop via CSS; safe-area aware. */
export function EdgeNav() {
  const nextScene = usePresentationStore((state) => state.nextScene)
  const previousScene = usePresentationStore((state) => state.previousScene)
  const index = usePresentationStore((state) => state.currentSceneIndex)
  const count = usePresentationStore((state) => state.scenes.length)
  const introDismissed = usePresentationStore((state) => state.introDismissed)

  if (!introDismissed) return null

  return (
    <>
      {index > 0 ? (
        <button aria-label="Vorherige Szene" className="edgeNav edgeNavLeft glass" onClick={previousScene} type="button">
          ‹
        </button>
      ) : null}
      {index < count - 1 ? (
        <button aria-label="Nächste Szene" className="edgeNav edgeNavRight glass" onClick={nextScene} type="button">
          ›
        </button>
      ) : null}
    </>
  )
}
