import { create } from 'zustand'
import { BOOTSTRAP_DEVICES, BOOTSTRAP_METRICS, BOOTSTRAP_SCENES } from '../core/bootstrapData'
import type { DeviceInfo, Metrics, PackageTier, PresentationScene } from '../types'

type PresentationState = {
  scenes: PresentationScene[]
  devices: DeviceInfo[]
  metrics: Metrics
  tier: PackageTier['id']
  currentSceneIndex: number
  selectedDeviceId: string | null
  hoveredDeviceId: string | null
  introDismissed: boolean
  setSceneByIndex: (index: number) => void
  setSceneById: (id: string) => void
  nextScene: () => void
  previousScene: () => void
  selectDevice: (id: string | null) => void
  setHoveredDevice: (id: string | null) => void
  dismissIntro: () => void
}

const clampSceneIndex = (index: number, scenes: PresentationScene[]) =>
  Math.max(0, Math.min(index, scenes.length - 1))

export const usePresentationStore = create<PresentationState>((set, get) => ({
  scenes: BOOTSTRAP_SCENES,
  devices: BOOTSTRAP_DEVICES,
  metrics: BOOTSTRAP_METRICS,
  tier: BOOTSTRAP_METRICS.tier,
  currentSceneIndex: 0,
  selectedDeviceId: null,
  hoveredDeviceId: null,
  introDismissed: false,
  setSceneByIndex: (index) => {
    const current = get()
    set({
      currentSceneIndex: clampSceneIndex(index, current.scenes),
      selectedDeviceId: null,
    })
  },
  setSceneById: (id) => {
    const current = get()
    const nextIndex = current.scenes.findIndex((scene) => scene.id === id)
    if (nextIndex >= 0) {
      set({ currentSceneIndex: nextIndex, selectedDeviceId: null })
    }
  },
  nextScene: () => {
    const current = get()
    set({
      currentSceneIndex: clampSceneIndex(current.currentSceneIndex + 1, current.scenes),
      selectedDeviceId: null,
    })
  },
  previousScene: () => {
    const current = get()
    set({
      currentSceneIndex: clampSceneIndex(current.currentSceneIndex - 1, current.scenes),
      selectedDeviceId: null,
    })
  },
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setHoveredDevice: (id) => set({ hoveredDeviceId: id }),
  dismissIntro: () => set({ introDismissed: true }),
}))

// Dev-only debug handle: lets agents drive scenes from the browser console /
// eval-based screenshot tooling (Agent B extension, see HANDOFF 0.2b).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).__smartHomeStore = usePresentationStore
}

export const selectCurrentScene = (state: PresentationState) =>
  state.scenes[state.currentSceneIndex] ?? state.scenes[0]

export const selectSelectedDevice = (state: PresentationState) => {
  const scene = selectCurrentScene(state)
  const selectedId = state.selectedDeviceId ?? scene.focusDeviceIds?.[0] ?? null
  return state.devices.find((device) => device.id === selectedId) ?? null
}
