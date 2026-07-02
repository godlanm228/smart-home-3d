import { useMemo } from 'react'
import * as THREE from 'three'

type CanvasLabelProps = {
  text: string
  position: [number, number, number]
  color?: string
  scale?: number
}

/** Offline-safe sprite label (canvas texture) — no font CDN dependency. */
export function CanvasLabel({ text, position, color = '#dce8f6', scale = 2 }: CanvasLabelProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 256, 64)
      ctx.font = "bold 30px 'Plus Jakarta Sans', Arial, sans-serif"
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.shadowColor = 'rgba(0,0,0,.8)'
      ctx.shadowBlur = 8
      ctx.fillText(text, 128, 34)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 4
    return tex
  }, [text, color])

  return (
    <sprite position={position} scale={[scale * 2, scale * 0.5, 1]}>
      <spriteMaterial depthWrite={false} map={texture} transparent />
    </sprite>
  )
}
