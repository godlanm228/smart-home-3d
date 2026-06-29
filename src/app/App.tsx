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

  return <Layout />
}
