import * as THREE from 'three'

/** Shared static materials (module singletons — created once, app-lifetime).
 *  Attach in JSX via <primitive attach="material" object={...} />. */

/** See-through facade glass — the interior must stay readable (approved look). */
export const glassMat = new THREE.MeshStandardMaterial({
  color: '#eaf2fb',
  transparent: true,
  opacity: 0.14,
  roughness: 0.06,
  metalness: 0.1,
  side: THREE.DoubleSide,
})

/** Balcony/terrace railing glass — slightly denser than the facade. */
export const railGlassMat = new THREE.MeshStandardMaterial({
  color: '#bcd6ea',
  transparent: true,
  opacity: 0.3,
  roughness: 0.1,
  metalness: 0.1,
  side: THREE.DoubleSide,
})

export const railMetalMat = new THREE.MeshStandardMaterial({
  color: '#2b3038',
  roughness: 0.45,
  metalness: 0.75,
})

export const partitionFrameMat = new THREE.MeshStandardMaterial({
  color: '#4a6076',
  roughness: 0.4,
  metalness: 0.6,
  transparent: true,
  opacity: 0.9,
})

export const structureMat = new THREE.MeshStandardMaterial({
  color: '#2b3442',
  roughness: 0.7,
  metalness: 0.04,
})

export const darkTrimMat = new THREE.MeshStandardMaterial({
  color: '#20262e',
  roughness: 0.7,
})
