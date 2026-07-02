import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { selectCurrentScene, usePresentationStore } from '../store/usePresentationStore'

export function CameraRig() {
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const scene = usePresentationStore(selectCurrentScene)
  const target = useMemo(() => new THREE.Vector3(...scene.camera.target), [])
  const targetRef = useRef(target)

  useEffect(() => {
    const from = targetRef.current
    const nextTarget = { x: from.x, y: from.y, z: from.z }
    // longer, softer glide = presentation-grade transition
    const duration = (scene.camera.duration ?? 1.1) * 1.25
    const ease = 'power3.inOut'

    const positionTween = gsap.to(camera.position, {
      x: scene.camera.position[0],
      y: scene.camera.position[1],
      z: scene.camera.position[2],
      duration,
      ease,
    })

    const fovTween = gsap.to(camera, {
      fov: scene.camera.fov ?? 42,
      duration,
      ease,
      onUpdate: () => camera.updateProjectionMatrix(),
    })

    const targetTween = gsap.to(nextTarget, {
      x: scene.camera.target[0],
      y: scene.camera.target[1],
      z: scene.camera.target[2],
      duration,
      ease,
      onUpdate: () => {
        targetRef.current.set(nextTarget.x, nextTarget.y, nextTarget.z)
        camera.lookAt(targetRef.current)
      },
    })

    return () => {
      positionTween.kill()
      fovTween.kill()
      targetTween.kill()
    }
  }, [camera, scene])

  useFrame(() => {
    camera.lookAt(targetRef.current)
  })

  return null
}
