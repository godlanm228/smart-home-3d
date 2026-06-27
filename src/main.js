import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import gsap from 'gsap'

/* =====================================================================
   Smart Home 3D · Cutaway-Dollhouse
   5 Ebenen (KG · EG · 1.OG · 2.OG · Dachboden), Frontwand aufgeschnitten.
   Geräte leuchten je Etage, Hover = Info + Wirkzone, Stufe schaltbar.
   Schwebende Insel über Wolkenmeer, blaue Stunde. Referenz: Gemini-Schnitt.
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
renderer.toneMappingExposure = 0.92
container.appendChild(renderer.domElement)

/* ---------- scene & fog ---------- */
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(new THREE.Color(0x223046), 0.0016)

/* ---------- camera ---------- */
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 900)
camera.position.set(14, 30, 80)

/* ---------- environment ---------- */
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

/* ---------- twilight sky dome ---------- */
{
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, fog: false,
    uniforms: {
      top: { value: new THREE.Color(0x0e1c34) },
      mid: { value: new THREE.Color(0x32507a) },
      bot: { value: new THREE.Color(0xdc9a52) },
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 top,mid,bot;
      void main(){ float h=normalize(vP).y;
        vec3 c = h>0.0 ? mix(mid,top,smoothstep(0.0,0.55,h)) : mix(mid,bot,smoothstep(0.0,-0.28,h));
        gl_FragColor=vec4(c,1.0);} `,
  })
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), mat))
}

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0x6f8fbf, 0x191d24, 0.34))
const sun = new THREE.DirectionalLight(0xffcf86, 2.2)
sun.position.set(46, 40, 38)
sun.castShadow = true
sun.shadow.mapSize.set(2048, 2048)
Object.assign(sun.shadow.camera, { near: 10, far: 200, left: -60, right: 60, top: 70, bottom: -40 })
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04
scene.add(sun)
const rim = new THREE.DirectionalLight(0x6f86c4, 0.6); rim.position.set(-34, 22, -30); scene.add(rim)

/* ---------- clouds ---------- */
function cloudTexture(size = 512, blobs = 26) {
  const c = document.createElement('canvas'); c.width = c.height = size
  const x = c.getContext('2d')
  for (let i = 0; i < blobs; i++) {
    const r = size * (0.10 + Math.random() * 0.22)
    const px = Math.random() * size, py = size * (0.35 + Math.random() * 0.45)
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill()
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
const cloudGroup = new THREE.Group(); scene.add(cloudGroup)
{
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 900),
    new THREE.MeshBasicMaterial({ map: cloudTexture(512, 30), color: 0x9fb0c8, transparent: true, opacity: 0.85, depthWrite: false, fog: false }))
  sea.rotation.x = -Math.PI / 2; sea.position.y = -11; scene.add(sea)
  const puffMat = new THREE.SpriteMaterial({ map: cloudTexture(512, 22), color: 0x9aabc4, transparent: true, opacity: 0.7, depthWrite: false, fog: false })
  for (let i = 0; i < 28; i++) {
    const s = new THREE.Sprite(puffMat.clone())
    const a = Math.random() * 6.28, rad = 40 + Math.random() * 80
    s.position.set(Math.cos(a) * rad, -12 + Math.random() * 8, Math.sin(a) * rad)
    const sc = 28 + Math.random() * 40; s.scale.set(sc, sc * 0.6, 1)
    s.material.opacity = 0.4 + Math.random() * 0.4; cloudGroup.add(s)
  }
}

/* ---------- materials ---------- */
const mat = (o) => new THREE.MeshStandardMaterial(o)
const M = {
  rock: mat({ color: 0x3a342e, roughness: 1 }),
  stone: mat({ color: 0x6c6358, roughness: 1 }),
  shell: mat({ color: 0xd7d0c2, roughness: 0.9 }),            // outer wall
  iWall: mat({ color: 0xc2bcaf, roughness: 0.95 }),           // interior wall
  iFloor: mat({ color: 0xa99a86, roughness: 0.9 }),           // interior floor
  roof: mat({ color: 0x34302a, roughness: 0.8 }),
  beam: mat({ color: 0x6b513a, roughness: 0.8 }),             // attic beams
  door: mat({ color: 0x6f6151, roughness: 0.7, metalness: 0.1 }),
  furn: mat({ color: 0x7c7468, roughness: 0.85 }),
  furnSoft: mat({ color: 0x9a8f7e, roughness: 1 }),
  cove: mat({ color: 0x2a2018, emissive: 0xffb060, emissiveIntensity: 0.5, roughness: 1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x10202c, roughness: 0.06, transmission: 0.5, transparent: true, opacity: 0.55, ior: 1.45 }),
  hedge: mat({ color: 0x2c5024, roughness: 1 }),
}
function box(w, h, d, m, x, y, z, p = scene) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; p.add(me); return me
}

/* ---------- floating island ---------- */
{
  const top = box(54, 1.2, 46, M.stone, 0, -0.6, -1); top.castShadow = false
  // grassy top
  box(50, 0.3, 42, M.hedge, 0, 0.05, -1)
  box(46, 5, 40, M.rock, 0, -3.5, -1)
  box(34, 6, 28, M.rock, 0, -8.5, -1)
  box(20, 5, 16, M.rock, 0, -13, -1)
}

/* =====================================================================
   HOUSE — cutaway. Footprint x[-8,8] z[-5.5,5.5]. OPEN FACE = +Z (front).
   5 stacked levels; roof on top; garage attached at EG on +X.
   ===================================================================== */
const FH = 2.4, X0 = -8, X1 = 8, ZB = -5.5, ZF = 5.5, W = X1 - X0, D = ZF - ZB
const LEVELS = [
  { id: 'KG',  name: 'Kellergeschoss', base: 0.0 },
  { id: 'EG',  name: 'Erdgeschoss',    base: 2.4 },
  { id: 'OG1', name: '1. Obergeschoss', base: 4.8 },
  { id: 'OG2', name: '2. Obergeschoss', base: 7.2 },
  { id: 'DB',  name: 'Dachboden',      base: 9.6, h: 2.0 },
]
const fy = (id, o = 1.1) => LEVELS.find(l => l.id === id).base + o   // helper: y inside a level

const house = new THREE.Group(); scene.add(house)
{
  // plinth under KG
  box(W + 1.0, 0.8, D + 1.0, M.stone, 0, -0.0, -1, house)
  LEVELS.forEach((lv) => {
    const h = lv.h || FH, cy = lv.base + h / 2
    box(W, 0.18, D, M.iFloor, 0, lv.base + 0.09, -1, house)        // floor slab
    box(W, h, 0.2, M.shell, 0, cy, ZB - 1, house)                 // back wall (-Z)
    box(0.2, h, D, M.shell, X0, cy, -1, house)                    // left wall (-X)
    box(0.2, h, D, M.shell, X1, cy, -1, house)                    // right wall (+X)
    // warm cove strip near ceiling -> lit interior glow
    box(W - 1.5, 0.12, D - 1.5, M.cove, 0, lv.base + h - 0.25, -1, house)
    // one interior partition per upper level
    if (lv.id !== 'KG') box(0.16, h - 0.3, D - 1.2, M.iWall, 1.5, cy, -1, house)
  })

  // --- furniture per level (muted blocks, read as rooms) ---
  // KG: tank + washer + shelves
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 16), M.furn)
  tank.position.set(-5.5, fy('KG', 0.9), -3); tank.castShadow = true; house.add(tank)
  box(1.3, 1.2, 1.2, M.furn, -3.4, fy('KG', 0.7), -3, house)        // washer
  box(2.4, 1.8, 0.5, M.furn, 5, fy('KG', 1.0), -4.6, house)         // shelves
  // EG: sofa + tv + kitchen
  box(3.0, 0.8, 1.3, M.furnSoft, -5, fy('EG', 0.5), 2.5, house)     // sofa
  box(2.6, 1.5, 0.12, M.furn, -5, fy('EG', 1.2), -5.0, house)       // tv on wall
  box(3.2, 1.0, 0.8, M.furn, 4.5, fy('EG', 0.6), -4.4, house)       // kitchen counter
  // OG1/OG2: beds
  ;['OG1', 'OG2'].forEach((id) => {
    box(2.2, 0.6, 1.5, M.furnSoft, -5.2, fy(id, 0.4), 2.6, house)
    box(2.2, 0.6, 1.5, M.furnSoft, -1.5, fy(id, 0.4), 2.6, house)
    box(2.0, 0.6, 1.5, M.furnSoft, 4.5, fy(id, 0.4), 2.6, house)
  })
  // DB: storage crates + visible beams
  box(1.0, 1.0, 1.0, M.furn, -4, fy('DB', 0.5), -3, house)
  box(1.0, 1.0, 1.0, M.furn, -2.6, fy('DB', 0.5), -3.4, house)

  // --- hip roof over the top ---
  const roofY = LEVELS[4].base + (LEVELS[4].h || FH)
  for (let i = 0; i < 8; i++) {  // exposed beams under roof
    box(0.16, 0.16, D, M.beam, X0 + 1 + i * 2, roofY - 0.2, -1, house)
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 3.2, 4), M.roof)
  roof.rotation.y = Math.PI / 4; roof.scale.set(1.08, 1, 0.78)
  roof.position.set(0, roofY + 1.6, -1); roof.castShadow = true; house.add(roof)
  box(W + 1.6, 0.4, D + 1.6, M.roof, 0, roofY + 0.1, -1, house)     // eave
  box(1.0, 2.4, 1.0, M.stone, 4.5, roofY + 1.0, 0.5, house)         // chimney

  // --- attached double garage at EG, +X side ---
  const gx = X1 + 4
  box(8, FH, 7, M.shell, gx, fy('EG', 0.0) + FH / 2 - 1.1 + 1.1, -1, house) // garage box (EG height)
  box(8.4, 0.45, 7.4, M.roof, gx, LEVELS[1].base + FH, -1, house)   // garage roof
  box(2.7, 2.0, 0.16, M.door, gx - 1.7, LEVELS[1].base + 1.0, ZF - 1.0, house)
  box(2.7, 2.0, 0.16, M.door, gx + 1.5, LEVELS[1].base + 1.0, ZF - 1.0, house)

  // --- balcony on 1.OG front ---
  box(6, 0.18, 1.6, M.stone, -3.5, LEVELS[2].base, ZF + 0.7, house)
  box(6.1, 0.1, 0.1, M.door, -3.5, LEVELS[2].base + 0.7, ZF + 1.4, house)
  for (let i = 0; i <= 12; i++) box(0.07, 0.6, 0.07, M.door, -6.5 + i * 0.5, LEVELS[2].base + 0.4, ZF + 1.4, house)
}

/* =====================================================================
   DEVICES — leuchtende Marker je Etage. tiers: in welchen Stufen aktiv.
   cat steuert Farbe. zone:[dir] -> Kamera/Bewegungs-Wirkkegel.
   ===================================================================== */
const CAT = {
  light:   { c: 0xffb45a, label: 'Licht' },
  climate: { c: 0x46c2e0, label: 'Klima' },
  security:{ c: 0xff5a52, label: 'Sicherheit' },
  energy:  { c: 0x49d18a, label: 'Energie' },
  media:   { c: 0xb07cff, label: 'Multimedia' },
  access:  { c: 0xffd23f, label: 'Zutritt' },
}
const ALL = ['basic', 'standard', 'premium'], SP = ['standard', 'premium'], PR = ['premium']
// y via floor id; x,z in house space. zone => cone coverage (dx,dz,reach)
const DEVICES = [
  // KG
  { n: 'Energiezähler (Shelly Pro)', cat: 'energy', f: 'KG', x: -5.5, z: -1.5, t: SP },
  { n: 'Smarte Waschmaschine', cat: 'energy', f: 'KG', x: -3.4, z: -1.8, t: ALL },
  { n: 'Rauch-/Wassermelder', cat: 'security', f: 'KG', x: 4, z: -1.5, t: ALL },
  { n: 'Smart Lock · Lager', cat: 'access', f: 'KG', x: 6, z: 3, t: SP },
  // EG
  { n: 'Licht · Wohnen', cat: 'light', f: 'EG', x: -5, z: 0, t: ALL },
  { n: 'Samsung TV', cat: 'media', f: 'EG', x: -5, z: -4.4, t: ALL },
  { n: 'Multiroom-Audio', cat: 'media', f: 'EG', x: -2.5, z: 1, t: SP },
  { n: 'Thermostat EG', cat: 'climate', f: 'EG', x: -6.5, z: 1, t: ALL },
  { n: 'Licht · Küche', cat: 'light', f: 'EG', x: 4, z: 0, t: ALL },
  { n: 'Bewegungsmelder', cat: 'security', f: 'EG', x: 0.5, z: 2, t: SP },
  { n: 'Innen-Kamera', cat: 'security', f: 'EG', x: 6.5, z: -4, t: ALL, zone: [-1, 1, 6] },
  { n: 'Rauchmelder', cat: 'security', f: 'EG', x: 2, z: -4, t: ALL },
  { n: 'Video-Türklingel', cat: 'access', f: 'EG', x: 7.2, z: 4.5, t: ALL },
  { n: 'Smart Lock · Haustür', cat: 'access', f: 'EG', x: 7.0, z: 5.0, t: SP },
  { n: 'Fingerprint-Zutritt', cat: 'access', f: 'EG', x: 6.6, z: 5.0, t: PR },
  // Garage (EG level, +X)
  { n: 'Wallbox 11 kW', cat: 'energy', f: 'EG', x: 13, z: -3.5, t: ALL },
  { n: 'Garagen-Kamera', cat: 'security', f: 'EG', x: 9.5, z: 0, t: SP, zone: [1, 0.4, 7] },
  // 1.OG
  { n: 'Licht · Schlafen', cat: 'light', f: 'OG1', x: -5.2, z: 0, t: ALL },
  { n: 'Licht · Schlafen', cat: 'light', f: 'OG1', x: -1.5, z: 0, t: ALL },
  { n: 'tado° Einzelraum', cat: 'climate', f: 'OG1', x: -6.5, z: 2, t: SP },
  { n: 'Balkon-Automatik', cat: 'light', f: 'OG1', x: -3.5, z: 4.8, t: SP },
  { n: 'Rauchmelder', cat: 'security', f: 'OG1', x: 5, z: -4, t: ALL },
  // 2.OG
  { n: 'Licht · Schlafen', cat: 'light', f: 'OG2', x: -5.2, z: 0, t: ALL },
  { n: 'tado° Einzelraum', cat: 'climate', f: 'OG2', x: 3, z: 1, t: SP },
  { n: 'Rauchmelder', cat: 'security', f: 'OG2', x: 5, z: -4, t: ALL },
  // Dachboden
  { n: 'Rauchmelder', cat: 'security', f: 'DB', x: -2, z: -2, t: ALL },
  // Perimeter (exterior, on island)
  { n: 'Garten-Kamera', cat: 'security', f: 'EG', x: -13, z: 8, t: ALL, zone: [1, -1, 12] },
  { n: 'Vorgarten-Kamera', cat: 'security', f: 'EG', x: 4, z: 13, t: ALL, zone: [0, -1, 12] },
  { n: 'Außensirene', cat: 'security', f: 'OG2', x: -7.5, z: -4, t: SP },
  { n: 'PV + Energiemgmt.', cat: 'energy', f: 'DB', x: 3, z: 3, t: PR },
]

const deviceObjs = []      // {mesh, halo, cone, data}
const pickList = []
const haloGeo = new THREE.SphereGeometry(0.5, 16, 16)
DEVICES.forEach((d) => {
  const col = new THREE.Color(CAT[d.cat].c)
  const y = fy(d.f, 1.1)
  const g = new THREE.Group(); g.position.set(d.x, y, d.z); scene.add(g)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2, roughness: 0.4 }))
  core.userData.dev = true; g.add(core); pickList.push(core)
  const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, depthWrite: false }))
  g.add(halo)
  let cone = null
  if (d.zone) {
    const [dx, dz, reach] = d.zone
    const cg = new THREE.ConeGeometry(reach * 0.42, reach, 20, 1, true)
    cone = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false, fog: false }))
    cone.position.set(d.x, y, d.z)
    const dir = new THREE.Vector3(dx, -0.2, dz).normalize()
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
    cone.translateY(-reach / 2)
    scene.add(cone)
  }
  deviceObjs.push({ core, halo, cone, data: d, col })
})

/* ---------- tiers ---------- */
let tier = 'standard'
function applyTier() {
  deviceObjs.forEach((o) => {
    const on = o.data.t.includes(tier)
    o.core.parent.visible = on
    if (o.cone) o.cone.visible = on
  })
  document.querySelectorAll('.tierbtn').forEach((b) => b.classList.toggle('on', b.dataset.t === tier))
}

/* ---------- grass ---------- */
const grassU = { uTime: { value: 0 } }
{
  const blade = new THREE.PlaneGeometry(0.07, 0.4, 1, 4); blade.translate(0, 0.2, 0)
  const colors = [], pos = blade.attributes.position
  for (let i = 0; i < pos.count; i++) { const t = pos.getY(i) / 0.4; colors.push(0.04 + t * 0.15, 0.16 + t * 0.3, 0.04 + t * 0.1) }
  blade.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  const gm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide })
  gm.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = grassU.uTime
    sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>',
      `#include <begin_vertex>
       vec3 ip=vec3(instanceMatrix[3].x,instanceMatrix[3].y,instanceMatrix[3].z);
       float b=transformed.y*transformed.y*1.8;
       transformed.x+=sin(uTime*1.5+ip.x*0.7+ip.z*0.5)*0.11*b;
       transformed.z+=cos(uTime*1.1+ip.z*0.6)*0.07*b;`)
  }
  const COUNT = 20000, inst = new THREE.InstancedMesh(blade, gm, COUNT)
  inst.receiveShadow = true
  const dummy = new THREE.Object3D()
  let placed = 0, guard = 0
  while (placed < COUNT && guard < COUNT * 4) {
    guard++
    const x = (Math.random() - 0.5) * 50, z = -1 + (Math.random() - 0.5) * 42
    if (Math.abs(x) > 25 || Math.abs(z + 1) > 21) continue
    if (x > X0 - 1 && x < 18 && z > ZB - 1 && z < ZF + 2) continue   // skip house+garage
    dummy.position.set(x, 0.1, z); dummy.rotation.y = Math.random() * 3.14
    dummy.scale.setScalar(0.7 + Math.random() * 0.7); dummy.updateMatrix()
    inst.setMatrixAt(placed++, dummy.matrix)
  }
  inst.count = placed; inst.instanceMatrix.needsUpdate = true; scene.add(inst)
}

/* ---------- controls ---------- */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true; controls.dampingFactor = 0.06; controls.enablePan = false
controls.minDistance = 20; controls.maxDistance = 95
controls.minPolarAngle = 0.5; controls.maxPolarAngle = 1.45
controls.minAzimuthAngle = -1.0; controls.maxAzimuthAngle = 1.0   // stay on the open (front) side
controls.target.set(0, 6, -1); controls.enabled = false

/* ---------- post ---------- */
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.75, 0.72))
composer.addPass(new OutputPass())

/* ---------- hover ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
let hovered = null
const tip = document.getElementById('tip')
addEventListener('pointermove', (e) => {
  ndc.x = (e.clientX / innerWidth) * 2 - 1; ndc.y = -(e.clientY / innerHeight) * 2 + 1
  tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 14 + 'px'
})
function updateHover() {
  ray.setFromCamera(ndc, camera)
  const hit = ray.intersectObjects(pickList.filter((m) => m.parent.visible), false)[0]
  const o = hit ? deviceObjs.find((d) => d.core === hit.object) : null
  if (o !== hovered) {
    hovered = o
    if (o) {
      tip.innerHTML = `<b style="color:#${o.col.getHexString()}">${o.data.n}</b><span>${CAT[o.data.cat].label}${o.data.zone ? ' · Wirkzone' : ''}</span>`
      tip.classList.add('show'); document.body.style.cursor = 'pointer'
    } else { tip.classList.remove('show'); document.body.style.cursor = 'default' }
  }
}

/* ---------- intro ---------- */
function startIntro() {
  const look = { x: 0, y: 9, z: -1 }
  gsap.to(camera.position, { x: 22, y: 9, z: 38, duration: 5.5, ease: 'power2.inOut' })
  gsap.to(look, { x: 0, y: 6, z: -1, duration: 5.5, ease: 'power2.inOut',
    onUpdate() { camera.lookAt(look.x, look.y, look.z) },
    onComplete() { controls.enabled = true } })
}

/* ---------- loop ---------- */
function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  grassU.uTime.value = t
  cloudGroup.rotation.y = t * 0.006
  deviceObjs.forEach((o, i) => {
    if (!o.core.parent.visible) return
    const hv = o === hovered
    const p = 1 + Math.sin(t * 2.5 + i) * 0.12
    o.core.material.emissiveIntensity = (hv ? 5.0 : 2.2) * p
    o.core.scale.setScalar(hv ? 1.7 : 1)
    o.halo.material.opacity = (hv ? 0.4 : 0.16) * p
    if (o.cone) o.cone.material.opacity = hv ? 0.3 : 0.1
  })
  if (controls.enabled) { controls.update(); updateHover() }
  composer.render()
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight)
})

/* ---------- tier buttons ---------- */
document.querySelectorAll('.tierbtn').forEach((b) => b.addEventListener('click', () => { tier = b.dataset.t; applyTier() }))

/* ---------- go ---------- */
applyTier(); animate()
setTimeout(() => { document.getElementById('veil')?.classList.add('hide'); startIntro() }, 600)
