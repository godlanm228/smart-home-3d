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
renderer.toneMappingExposure = 0.84
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

const sun = new THREE.DirectionalLight(0xffcf86, 2.3)
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
  wallLight: new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: 0.88 }),
  wallDark: new THREE.MeshStandardMaterial({ color: 0x1e232b, roughness: 0.6, metalness: 0.12 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.7 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x8b867d, roughness: 0.95 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0e1822, roughness: 0.06, metalness: 0, transmission: 0.5, transparent: true, opacity: 0.7, ior: 1.45 }),
  win: new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffae52, emissiveIntensity: 1.4, roughness: 0.4 }),
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

/* ---------- the house (2-storey villa + double garage, hip roof) ---------- */
const house = new THREE.Group(); scene.add(house)
{
  const cream = M.wallLight
  const stone = new THREE.MeshStandardMaterial({ color: 0x6c6358, roughness: 1 })
  const roofM = new THREE.MeshStandardMaterial({ color: 0x34302a, roughness: 0.8 })
  const doorM = new THREE.MeshStandardMaterial({ color: 0x6f6151, roughness: 0.7, metalness: 0.1 })
  const frameM = new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: 0.6 })

  // framed warm window helper (face 'z' = front/back, 'x' = sides)
  function win(w, h, x, y, z, lit = true, face = 'z') {
    const fr = new THREE.Mesh(
      face === 'z' ? new THREE.BoxGeometry(w + 0.3, h + 0.3, 0.12) : new THREE.BoxGeometry(0.12, h + 0.3, w + 0.3), frameM)
    fr.position.set(x, y, z); fr.castShadow = true; house.add(fr)
    const pane = new THREE.Mesh(
      face === 'z' ? new THREE.BoxGeometry(w, h, 0.08) : new THREE.BoxGeometry(0.08, h, w), lit ? M.win : M.winDim)
    pane.position.set(x + (face === 'z' ? 0 : 0.04), y, z + (face === 'z' ? 0.04 : 0)); house.add(pane)
  }

  // stone plinth + two cream floors
  box(15.6, 0.8, 11.6, stone, -8, 0.4, 0, house)
  box(15, 3.0, 11, cream, -8, 2.3, 0, house)
  box(15, 2.7, 11, cream, -8, 5.15, 0, house)
  box(0.5, 5.7, 11.2, stone, -15.6, 3.65, 0, house)          // stone end accent

  // hip roof (4-sided pyramid) + eave band
  const roof = new THREE.Mesh(new THREE.ConeGeometry(10, 3.0, 4), roofM)
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.12, 1, 0.84)
  roof.position.set(-8, 8.0, 0); roof.castShadow = true; house.add(roof)
  box(15.8, 0.4, 11.8, roofM, -8, 6.6, 0, house)

  // central two-storey glass bay + gable
  box(4, 5.6, 1.0, M.glass, -8, 3.3, -6.0, house)
  box(3.6, 5.2, 0.06, new THREE.MeshStandardMaterial({ color: 0x2a2018, emissive: 0xffa64d, emissiveIntensity: 0.3, roughness: 1 }), -8, 3.3, -5.9, house)
  const gable = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.0, 4), roofM)
  gable.rotation.y = Math.PI / 4; gable.scale.set(1.0, 1, 0.5); gable.position.set(-8, 7.0, -5.4); house.add(gable)

  // front windows: ground + upper
  win(1.8, 1.6, -12.5, 2.3, -5.55, true)
  win(1.8, 1.6, -3.8, 2.3, -5.55, false)
  win(1.6, 1.4, -12.5, 5.2, -5.55, true)
  win(1.6, 1.4, -3.8, 5.2, -5.55, true)
  // balcony on upper floor
  box(6, 0.2, 1.8, stone, -8, 3.75, -6.4, house)
  for (let i = 0; i <= 12; i++) box(0.08, 0.7, 0.08, frameM, -11 + i * 0.5, 4.1, -7.25, house)
  box(6.1, 0.12, 0.12, frameM, -8, 4.45, -7.25, house)
  // left-side windows
  win(1.6, 1.5, -15.55, 2.3, -2.0, true, 'x')
  win(1.6, 1.5, -15.55, 5.1, 2.0, false, 'x')
  // chimney
  box(1.0, 2.6, 1.0, stone, -3.5, 8.6, 1.5, house)

  /* ---- attached double garage (single storey, +X) ---- */
  box(8, 0.8, 7.6, stone, 3.6, 0.4, -1.2, house)
  box(7.6, 3.0, 7, cream, 3.6, 2.3, -1.2, house)
  box(8.2, 0.5, 7.6, roofM, 3.6, 4.0, -1.2, house)
  box(2.7, 2.3, 0.16, doorM, 1.7, 1.95, -4.72, house)        // door 1
  box(2.7, 2.3, 0.16, doorM, 5.2, 1.95, -4.72, house)        // door 2
  box(1.0, 2.2, 0.16, doorM, -0.4, 1.9, -1.2, house)         // door garage → house
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
    [-15.7, -0.3, -7, 6.5],   // house
    [-0.4, 7.7, -5.0, 2.5],   // garage
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
controls.target.set(-6, 2.6, -1)

/* ---------- post processing ---------- */
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.4, 0.7, 0.82)
composer.addPass(bloom)
composer.addPass(new OutputPass())

/* ---------- cinematic intro ---------- */
function startIntro() {
  const look = { x: -6, y: 6, z: -1 }
  gsap.to(camera.position, { x: 31, y: 15, z: 45, duration: 5.5, ease: 'power2.inOut' })
  gsap.to(look, {
    x: -6, y: 2.6, z: -1, duration: 5.5, ease: 'power2.inOut',
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
