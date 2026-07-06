import { useEffect } from 'react'
import { Layout } from '../ui/Layout'
import { usePresentationStore } from '../store/usePresentationStore'

export function App() {
  const nextScene = usePresentationStore((state) => state.nextScene)
  const previousScene = usePresentationStore((state) => state.previousScene)
  const selectDevice = usePresentationStore((state) => state.selectDevice)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') nextScene()
      if (event.key === 'ArrowLeft') previousScene()
      if (event.key === 'Escape') selectDevice(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [nextScene, previousScene, selectDevice])

  // Deep-linking: ?scene=N jumps straight to a scene (intro dismissed) and the
  // URL keeps tracking navigation — direct links, reload-safe demo, screenshots.
  useEffect(() => {
    const store = usePresentationStore
    const raw = new URLSearchParams(window.location.search).get('scene')
    if (raw) {
      const n = Number.parseInt(raw, 10)
      if (Number.isFinite(n) && n >= 1 && n <= store.getState().scenes.length) {
        store.getState().setSceneByIndex(n - 1)
        store.getState().dismissIntro()
      }
    }
    return store.subscribe((state, prev) => {
      if (state.currentSceneIndex === prev.currentSceneIndex) return
      const url = new URL(window.location.href)
      url.searchParams.set('scene', String(state.currentSceneIndex + 1))
      window.history.replaceState(null, '', url)
    })
  }, [])

  return <Layout />
}
