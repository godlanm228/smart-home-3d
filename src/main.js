import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import gsap from 'gsap'

/* =====================================================================
   Smart Home 3D · Hero
   Eine schwebende Insel über einem Wolkenmeer in der blauen Stunde —
   Haus, Garage, Garten, animierter Rasen, filmische Kamera.
   ===================================================================== */

const container = document.getElementById('app')
const clock = new THREE.Clock()

/* ---------- renderer ---------- */
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.9
container.appendChild(renderer.domElement)

/* ---------- scene & fog ---------- */
const scene = new THREE.Scene()
const FOG = new THREE.Color(0x223046)
scene.fog = new THREE.FogExp2(FOG, 0.0017)

/* ---------- camera ---------- */
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 900)
camera.position.set(12, 32, 84)

/* ---------- environment (cheap PBR reflections, no heavy HDR) ---------- */
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

/* ---------- dreamy twilight sky dome ---------- */
{
  const geo = new THREE.SphereGeometry(380, 32, 16)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x0e1c34) },
      mid: { value: new THREE.Color(0x32507a) },
      bot: { value: new THREE.Color(0xdc9a52) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      varying vec3 vP; uniform vec3 top, mid, bot;
      void main(){
        float h = normalize(vP).y;
        vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0,0.55,h))
                         : mix(mid, bot, smoothstep(0.0,-0.28,h));
        gl_FragColor = vec4(c,1.0);
      }`,
  })
  scene.add(new THREE.Mesh(geo, mat))
}

/* ---------- lights (blue hour, warm key) ---------- */
scene.add(new THREE.HemisphereLight(0x6f8fbf, 0x191d24, 0.32))

const sun = new THREE.DirectionalLight(0xffcf86, 3.0)
sun.position.set(40, 21, 34)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
sun.shadow.camera.near = 10
sun.shadow.camera.far = 170
sun.shadow.camera.left = -55
sun.shadow.camera.right = 55
sun.shadow.camera.top = 55
sun.shadow.camera.bottom = -55
sun.shadow.bias = -0.0004
sun.shadow.normalBias = 0.04
scene.add(sun)

const rim = new THREE.DirectionalLight(0x6f86c4, 0.7)
rim.position.set(-34, 18, -34)
scene.add(rim)

/* ---------- soft cloud texture ---------- */
function cloudTexture(size = 512, blobs = 26) {
  const c = document.createElement('canvas'); c.width = c.height = size
  const x = c.getContext('2d')
  x.clearRect(0, 0, size, size)
  for (let i = 0; i < blobs; i++) {
    const r = size * (0.10 + Math.random() * 0.22)
    const px = Math.random() * size, py = size * (0.35 + Math.random() * 0.45)
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ---------- cloud sea + drifting puffs ---------- */
const cloudGroup = new THREE.Group(); scene.add(cloudGroup)
{
  const tex = cloudTexture(512, 30)
  const seaMat = new THREE.MeshBasicMaterial({ map: tex, color: 0x9fb0c8, transparent: true, opacity: 0.85, depthWrite: false, fog: false })
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), seaMat)
  sea.rotation.x = -Math.PI / 2; sea.position.y = -10
  scene.add(sea)

  const puffMat = new THREE.SpriteMaterial({ map: cloudTexture(512, 22), color: 0x9aabc4, transparent: true, opacity: 0.7, depthWrite: false, fog: false })
  for (let i = 0; i < 30; i++) {
    const s = new THREE.Sprite(puffMat.clone())
    const a = Math.random() * Math.PI * 2, rad = 36 + Math.random() * 80
    s.position.set(Math.cos(a) * rad, -11 + Math.random() * 7, Math.sin(a) * rad)
    const sc = 26 + Math.random() * 40
    s.scale.set(sc, sc * 0.6, 1)
    s.material.opacity = 0.4 + Math.random() * 0.4
    cloudGroup.add(s)
  }
}

/* ---------- materials ---------- */
const texLoader = new THREE.TextureLoader()
const grassDiff = texLoader.load('/assets/grass_diff.jpg')
grassDiff.colorSpace = THREE.SRGBColorSpace
grassDiff.wrapS = grassDiff.wrapT = THREE.RepeatWrapping
grassDiff.repeat.set(8, 8)

const M = {
  grass: new THREE.MeshStandardMaterial({ map: grassDiff, color: 0x46732f, roughness: 1, metalness: 0 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x3a342e, roughness: 1, metalness: 0 }),
  wallLight: new THREE.MeshStandardMaterial({ color: 0xe3ddd2, roughness: 0.85 }),
  wallDark: new THREE.MeshStandardMaterial({ color: 0x1e232b, roughness: 0.6, metalness: 0.12 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.7 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x8b867d, roughness: 0.95 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0e1822, roughness: 0.06, metalness: 0, transmission: 0.5, transparent: true, opacity: 0.7, ior: 1.45 }),
  win: new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffae52, emissiveIntensity: 1.7, roughness: 0.4 }),
  winDim: new THREE.MeshStandardMaterial({ color: 0x2c3340, emissive: 0x222a36, emissiveIntensity: 0.5, roughness: 0.5 }),
  hedge: new THREE.MeshStandardMaterial({ color: 0x2c5024, roughness: 1 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x4a3a29, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x346231, roughness: 1 }),
}

function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m
}

/* ---------- floating island ---------- */
const island = new THREE.Group(); scene.add(island)
{
  const top = box(52, 1.2, 48, M.grass, -4, -0.6, -1, island)   // grass surface top at y≈0
  top.castShadow = false
  box(46, 5, 42, M.rock, -4, -3.5, -1, island)                  // rock body
  box(34, 6, 30, M.rock, -4, -8.5, -1, island)                  // tapered underside
  box(20, 5, 18, M.rock, -4, -13, -1, island)
}

/* ---------- the house (modern villa massing) ---------- */
const house = new THREE.Group(); scene.add(house)
{
  // main two-storey volume
  box(15, 6.6, 11, M.wallLight, -8, 3.3, 0, house)
  // dark recessed upper band / second volume offset
  box(15.4, 3.0, 5.6, M.wallDark, -8, 5.0, 2.9, house)
  // flat roof caps
  box(16, 0.5, 12, M.roof, -8, 6.85, 0, house)
  box(16.2, 0.4, 6, M.roof, -8, 6.6, 2.9, house)

  // ground-floor glass front (-Z faces camera)
  box(11, 3.2, 0.18, M.glass, -8.5, 1.9, -5.55, house)
  // interior warm glow behind the glass
  box(10.6, 3.0, 0.05, new THREE.MeshStandardMaterial({ color: 0x2a2018, emissive: 0xffa64d, emissiveIntensity: 0.4, roughness: 1 }), -8.5, 1.9, -5.35, house)
  // entrance porch + door
  box(4.2, 0.25, 3.2, M.concrete, -3.0, 0.12, -7.0, house)
  box(1.5, 2.6, 0.16, M.wallDark, -3.0, 1.4, -5.55, house)

  // warm windows — upper floor strip + side panes
  const winY = 4.7
  for (let i = 0; i < 5; i++) {
    const m = Math.random() > 0.35 ? M.win : M.winDim
    box(1.7, 1.5, 0.14, m, -13.5 + i * 2.7, winY, -5.55, house)
  }
  box(0.14, 1.6, 1.8, M.win, -15.52, 4.7, -1.5, house)
  box(0.14, 1.6, 1.8, M.winDim, -15.52, 1.9, 1.8, house)

  /* ---------- attached garage (+X side, front-aligned) ---------- */
  box(6.4, 3.4, 7, M.wallDark, 2.2, 1.7, -1.4, house)
  box(6.8, 0.45, 7.4, M.roof, 2.2, 3.55, -1.4, house)
  box(4.6, 2.5, 0.16, new THREE.MeshStandardMaterial({ color: 0x2a2e34, roughness: 0.5, metalness: 0.3 }), 2.2, 1.45, -4.92, house)
  box(1.2, 2.4, 0.16, M.wallLight, -0.95, 1.4, -1.4, house)     // connector / door to house
}

/* ---------- driveway + front path ---------- */
box(6.2, 0.16, 17, M.concrete, 2.2, 0.05, -13.5, scene)
box(2.4, 0.14, 6, M.concrete, -3.0, 0.06, -10.0, scene)

/* ---------- garden behind house (+Z): deck + greenery ---------- */
{
  box(9, 0.22, 5, new THREE.MeshStandardMaterial({ color: 0x5a4129, roughness: 0.8 }), -8, 0.08, 9.5, scene)
  for (let i = 0; i < 6; i++) box(2.2, 1.0, 1.1, M.hedge, -16 + i * 3.0, 0.5, 14, scene)
  function tree(x, z) {
    box(0.5, 2.2, 0.5, M.trunk, x, 1.1, z, scene)
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 1), M.leaf)
    crown.position.set(x, 3.2, z); crown.castShadow = true; crown.scale.y = 1.15; scene.add(crown)
  }
  tree(-18, 8); tree(6, 11)
}

/* ---------- animated grass blades (wind) ---------- */
const grassUniforms = { uTime: { value: 0 } }
{
  const blade = new THREE.PlaneGeometry(0.07, 0.42, 1, 4)
  blade.translate(0, 0.21, 0)                                   // base at y=0
  const colors = []
  const pos = blade.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / 0.42
    colors.push(0.04 + t * 0.16, 0.16 + t * 0.30, 0.04 + t * 0.10)  // dark base → richer green tip
  }
  blade.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, side: THREE.DoubleSide })
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = grassUniforms.uTime
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader
    sh.vertexShader = sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       vec3 ip = vec3(instanceMatrix[3].x, instanceMatrix[3].y, instanceMatrix[3].z);
       float bend = transformed.y * transformed.y * 1.8;
       transformed.x += sin(uTime * 1.5 + ip.x * 0.7 + ip.z * 0.5) * 0.12 * bend;
       transformed.z += cos(uTime * 1.1 + ip.z * 0.6) * 0.08 * bend;`
    )
  }

  const COUNT = 34000
  const mesh = new THREE.InstancedMesh(blade, mat, COUNT)
  mesh.castShadow = false; mesh.receiveShadow = true
  const dummy = new THREE.Object3D()
  const blocked = [
    [-15.7, -0.3, -6, 6],     // house
    [-1.1, 5.5, -5.2, 2.2],   // garage
    [-1, 5.4, -22, -5],       // driveway
    [-4.3, -1.7, -13, -7],    // front path
    [-12.6, -3.4, 7, 12],     // deck
  ]
  const inBlocked = (x, z) => blocked.some(b => x > b[0] && x < b[1] && z > b[2] && z < b[3])
  let placed = 0, guard = 0
  while (placed < COUNT && guard < COUNT * 4) {
    guard++
    const x = -4 + (Math.random() - 0.5) * 50
    const z = -1 + (Math.random() - 0.5) * 46
    if (Math.abs(x + 4) > 24 || Math.abs(z + 1) > 22) continue
    if (inBlocked(x, z)) continue
    dummy.position.set(x, 0, z)
    dummy.rotation.y = Math.random() * Math.PI
    dummy.scale.setScalar(0.7 + Math.random() * 0.7)
    dummy.updateMatrix()
    mesh.setMatrixAt(placed++, dummy.matrix)
  }
  mesh.count = placed
  mesh.instanceMatrix.needsUpdate = true
  scene.add(mesh)
}

/* ---------- controls ---------- */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.enablePan = false
controls.minDistance = 22
controls.maxDistance = 110
controls.minPolarAngle = 0.3
controls.maxPolarAngle = 1.46
controls.autoRotateSpeed = 0.3
controls.enabled = false
controls.target.set(-5, 1.5, 0)

/* ---------- post processing ---------- */
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.7, 0.8)
composer.addPass(bloom)
composer.addPass(new OutputPass())

/* ---------- cinematic intro ---------- */
function startIntro() {
  const look = { x: -5, y: 6, z: 0 }
  gsap.to(camera.position, { x: 29, y: 14, z: 41, duration: 5.5, ease: 'power2.inOut' })
  gsap.to(look, {
    x: -5, y: 1.5, z: 0, duration: 5.5, ease: 'power2.inOut',
    onUpdate() { camera.lookAt(look.x, look.y, look.z) },
    onComplete() { controls.enabled = true; controls.autoRotate = true },
  })
}

/* ---------- loop ---------- */
function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  grassUniforms.uTime.value = t
  cloudGroup.rotation.y = t * 0.006
  if (controls.enabled) controls.update()
  composer.render()
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  composer.setSize(innerWidth, innerHeight)
})

/* ---------- go ---------- */
animate()
setTimeout(() => {
  document.getElementById('veil')?.classList.add('hide')
  startIntro()
}, 600)
