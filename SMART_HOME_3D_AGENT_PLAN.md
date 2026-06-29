# Smart Home 3D Interactive Showcase — Agent Coordination Plan (v2)

**Purpose:** Build an interactive 3D website that replaces a PowerPoint for the Smart Home project (HRW Bottrop, Projektmanagement SoSe 2026, Gruppe 7).

**Authoritative visual target:** The GPT-generated UI mockup (dark glass premium dashboard with a cinematic night render of the house). **The finished product must look like that mockup.** It is described in detail in section 0 because Codex cannot see the image.

**This file is the shared source of truth for Codex (Agent A) and Claude Code (Agent B).** Both must read it fully and respect file ownership. Coordination is via this file + Git + `AGENTS.md`. (Note: Codex does **not** use Claude Code "skills" — that is a Claude-only system. The shared brain is this document + Git, nothing else.)

---

## 0. VISUAL & UI TARGET — match this mockup

A single cinematic full-screen 3D scene with a **dark, glassy, premium HUD** on top. Evening/night lighting, warm windows, subtle bloom. Layout:

- **Top bar:** left = logo mark + `SMART HOME` / `INTERACTIVE PRESENTATION`. Center = scene counter `1 / 14` + scene name + ◀ ▶ arrows. Right = small ambient chips (temp `21°C`, clock `20:45`) + menu.
- **Left rail — floor/scene navigation (vertical list, glass):** `DACHBODEN · Chердak`, `DACHGESCHOSS · Mansardenetage`, `2.OG`*, `1.OG · Erste Etage`, `EG · Erdgeschoss` (active = highlighted), `KG · Keller`, `GARTEN · Garten & Grundstück`. *(See §1 floor note: there is NO separate 2.OG — order is KG → EG → 1.OG → Dachgeschoss → Dachboden. Drop the 2.OG row.)*
- **Hero (center):** the house as a cinematic night render, **floating glowing device markers** (small circular icons with halo) placed over real positions. Camera moves between scenes.
- **Right — context card (glass):** e.g. `OUTDOOR CAMERA · ONLINE`, product image, spec list (`4K Ultra HD`, `Nachtsicht`, `KI-Erkennung`, `Aufnahme auf NAS`, `Blickwinkel 120°`), buttons `LIVE VIEW` / `EINSTELLUNGEN`. This is the **DeviceInfoPanel** — appears when a device is selected.
- **Bottom — metrics dock (glass, icon + value):** `Geräte 127 aktiv`, `Kameras 12 aktiv`, `Temperatur 22.3°C`, `Feuchtigkeit 48%`, `Energie 2.4 kW`, `Sicherheit ALLE SYSTEME OK`.
- **Bottom strip — example room cards (optional intro/summary):** Eingangsbereich (Smart Lock), Wohnzimmer (smartes Licht), Küche (smarte Steckdose), Badezimmer (Feuchtigkeitssensor), Technik/Keller (Serverstack) — each a small glass card with mini-readout.

Color language: **blue glow = security**, **gold/yellow = energy**, **green/teal = comfort & online**, **red = alarm only**. Glass panels = blurred dark with thin light borders. Type = clean, mostly German.

> The mockup file (if available locally) is style reference only — do **not** reproduce pixel-perfect, but the **layout, glass HUD, marker style, metrics dock, and device card must match its quality and structure.**

---

## 1. EXISTING WORK — PORT, do not discard

There is already a **working vanilla Three.js build** with tuned, correct content. **Reuse it as the content source — do not re-derive from scratch.** Re-deriving wastes work and loses tuned positions.

Source files on the user's machine:

```text
C:\Users\Vlad\Smart Home 3D\index.html              ← current working 3D build (vanilla Three.js r128, single file)
C:\Users\Vlad\Smart Home 3D\assets\                  ← GLB models + textures (cars, trees, room sets, grass/wall/roof PBR, sky)
C:\Users\Vlad\Downloads\Smart Home Konfigurator (2).html   ← the configurator (pricing/tiers/modules data)
```

> If Codex runs in a cloud sandbox, the user must upload these two HTML files + the `assets/` folder as references.

**Port these out of `index.html` (they are already correct and tuned):**
- **Floor stack** KG / EG / 1.OG / Dachgeschoss / Dachboden (Dachboden is ~half height — keep it). Garage attached to the house with 3 pedestrian passages + 1 vehicle door.
- **Device list with exact positions** (`DEVICES[]`), category colors (`ICCOL`), camera vision cones, tier-gating logic (`deviceOn`).
- **Scene/camera poses** (`STOPS[]` — 13 tuned camera positions with varied angles: front/side/back/top).
- **Cost / tier / security-score logic** from the configurator (`CFG`, `basis`, `module`, `calc()`, `securityLvl()`): Basic/Standard/Premium, hardware + personnel costs, duration, energy-saving %, security score. The mockup's metrics dock is driven by this.
- **German captions** per scene.
- **GLB assets** in `assets/` (reuse where they help).

**The crooked look ("кривые границы/фасады/коробки") is an ASSET/craft problem, not a framework problem.** R3F alone will not fix it. See §4 (asset pipeline). Primitives are only the bootstrap; the hero quality in the mockup requires real GLB models.

---

## 2. Product Vision

Premium interactive 3D presentation website — Apple-style product presentation + smart-home configurator + cinematic 3D house tour. The house is the hero. Camera motion is guided and intentional. Must show: exterior, Vorgarten/gate/driveway/garage, entrance zone, EG (living/kitchen/WC/terrace), Keller (NAS/NVR/router/UPS/energy), 1.OG (bedrooms/bath/balcony), Dachgeschoss (rooms), Dachboden (storage/sensors), garden (irrigation/mower/perimeter cams), roof (PV + animated energy flow), final security/energy summary.

---

## 3. Tech Stack

```text
Vite · React · TypeScript
three · @react-three/fiber · @react-three/drei
@react-three/postprocessing   ← REQUIRED for premium look (bloom, DOF, vignette, SSAO)
gsap                          ← camera choreography
zustand                       ← state
tailwindcss                   ← glass HUD
lucide-react                  ← icons
```

Helpful additions:

```text
leva                ← debug tweaking of camera/light values
troika-three-text   ← crisp 3D labels (sharper than sprite text)
gltfjsx             ← convert GLB → React components
```

Do **not** build the final project as one huge HTML file. The old HTML is a data/content source only.

---

## 4. ASSET PIPELINE (owned by Claude Code)

To match the mockup we need real models, not just boxes. Claude Code owns asset generation/sourcing:

```text
Sources (free / available to Claude):
  - PolyHaven (CC0): HDRI, PBR textures, props        ← via Blender integration
  - Sketchfab: downloadable models                    ← via Blender integration
  - Hyper3D / Rodin: text→3D + image→3D (GLB)          ← via Blender integration
  - Tripo3D / Meshy: text/image→3D (free tiers)        ← user exports GLB → drop into public/models/

Pipeline:
  generate/source  →  Blender cleanup (scale, origin, decimate, bake)  →  export GLB (Draco/meshopt)  →  public/models/
  large GLB → optionally gltfjsx → typed React component
```

House strategy (decide early):
- **Hybrid (recommended):** procedural floor stack + cutaway we control (for transparency + exact device placement + tier switching) **+** high-quality GLB props (furniture, garage, cars, fence, trees, gate, lamps) dropped on top. Keeps interactivity, lifts quality.
- Avoid a single monolithic generated house mesh — it breaks per-floor cutaway, device hotspots, and tier switching.

Performance: prefer baked lighting / low real-time shadow count; Draco/meshopt compress; LODs for vegetation.

---

## 5. Target Project Structure

```text
smart-home-3d-showcase/
  public/
    models/  textures/  hdri/  icons/      (+ README.md each)
  src/
    app/        App.tsx  main.tsx  styles.css
    core/       SceneCanvas.tsx  Experience.tsx  CameraRig.tsx  SceneController.tsx  InteractionLayer.tsx  PostFX.tsx
    data/       projectData.ts  scenes.ts  devices.ts  packages.ts  floors.ts  pricing.ts
    types/      index.ts
    store/      usePresentationStore.ts
    scene/
      environment/  Environment.tsx Lighting.tsx Ground.tsx Garden.tsx Skyline.tsx
      house/        HouseShell.tsx FloorStack.tsx Roof.tsx Garage.tsx Terrace.tsx Balcony.tsx Stairs.tsx CutawayController.tsx
      interiors/    LivingRoom.tsx Kitchen.tsx Bedroom.tsx Bathroom.tsx BasementTechRoom.tsx
      devices/      DeviceMarker.tsx CameraDevice.tsx LightDevice.tsx ThermostatDevice.tsx SmartLockDevice.tsx WallboxDevice.tsx PVSystem.tsx IrrigationDevice.tsx ServerRack.tsx
      effects/      GlowRing.tsx CameraCone.tsx EnergyFlow.tsx ScanPulse.tsx
    ui/           Layout.tsx TopBar.tsx SceneNavigation.tsx SceneStepper.tsx DeviceInfoPanel.tsx MetricsDock.tsx FloorSelector.tsx StartOverlay.tsx SummaryPanel.tsx RoomCards.tsx
    utils/        animation.ts cameraPaths.ts format.ts constants.ts
    tests/        smoke.test.ts
  index.html  package.json  vite.config.ts  tsconfig.json  AGENTS.md  README.md
```

(Added vs v1: `PostFX.tsx`, `data/pricing.ts`, `scene/environment/Skyline.tsx`, `scene/house/Stairs.tsx`, `ui/RoomCards.tsx`.)

---

## 6. Agent Roles

### AGENT A — Codex (technical foundation)
Owns: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/app/`, `src/core/`, `src/store/`, `src/types/`, `src/utils/`, `src/tests/`, `README.md`, `AGENTS.md`.
Tasks: project bootstrap; strict TS types (below); Zustand store; GSAP camera rig (no jumps, stable target, OrbitControls only in debug); SceneController (scene → visible floors / cutaway / focused devices / UI text); InteractionLayer (hover/click devices without breaking camera); PostFX wiring (bloom/DOF/vignette via `@react-three/postprocessing`); build + Cloudflare Pages/Vercel deploy.

### AGENT B — Claude Code (visual + assets + content)
Owns: `src/data/`, `src/scene/`, `src/ui/`, `src/app/styles.css`, `public/models/`, `public/textures/`, `public/hdri/`, `public/icons/`, **asset pipeline (§4)**.
Tasks: port data/content from existing build (§1); house shell + 5-floor stack + Dachboden half-height + attached garage + stairs + cutaway; interiors; device markers + effects (glow, cones, energy flow); the **glass HUD that matches the mockup (§0)**; source/generate GLB assets; German text.

Boundary rule: if Claude needs a missing type/store action, add a small compatible extension with a comment and note it in HANDOFF — do not rewrite Codex architecture.

---

## 7. Shared TypeScript Contracts (Codex creates `src/types/index.ts`)

```ts
export type FloorId =
  | 'outdoor' | 'keller' | 'eg' | 'og1' | 'dachgeschoss' | 'dachboden' | 'roof' | 'garage';
// NOTE: there is NO '2.OG'. Order: keller → eg → og1 → dachgeschoss → dachboden.

export type DeviceCategory =
  | 'security' | 'energy' | 'comfort' | 'climate' | 'media' | 'infrastructure' | 'garden';

export interface CameraPose { position:[number,number,number]; target:[number,number,number]; fov?:number; duration?:number; }

export interface PresentationScene {
  id:string; index:number; title:string; subtitle:string; floor?:FloorId;
  camera:CameraPose; description:string;
  focusDeviceIds?:string[]; visibleFloorIds?:FloorId[];
  cutawayMode?:'none'|'roof-off'|'floor-focus'|'exploded';
}

export interface DeviceInfo {
  id:string; label:string; shortLabel:string; category:DeviceCategory; floor:FloorId;
  position:[number,number,number]; status:'online'|'offline'|'planned'|'included';
  packageLevel?:'basic'|'standard'|'premium'|'module';
  description:string; features:string[]; benefit:string; cost?:number;
  showCone?:boolean; glowColor?:string;
}

export interface PackageTier { id:'basic'|'standard'|'premium'; label:string; hardware:number; personnel:number; durationWeeks:number; energySaving:number; }
export interface Metrics { devicesActive:number; camerasActive:number; tempC:number; humidity:number; energyKw:number; securityScore:number; tier:PackageTier['id']; }
```

---

## 8. Data: port from existing build

Claude Code creates `src/data/{scenes,devices,packages,floors,pricing,projectData}.ts`.

- **scenes.ts** — port the 13 tuned `STOPS` from `index.html` and extend to the **14 scenes** below; convert each to `PresentationScene` (varied camera angles already exist — reuse them).
- **devices.ts** — port `DEVICES[]` positions + `ICCOL` colors + cone flags; enrich with `features/benefit/description` (German). Target **≥20 devices**.
- **packages.ts / pricing.ts** — port `CFG.basis` (Basic/Standard/Premium: hardware, persFix, dauerWo, save) + `module` costs + `calc()` + `securityLvl()`. Drives the metrics dock.
- **floors.ts** — KG/EG/1.OG/Dachgeschoss/Dachboden + Garten/Garage/Roof, with rooms.
- Metrics for the dock: Wohnfläche 180 m², Garten 400 m², 6 SZ, 2 Bäder, 3 WC, Garage 3 Zugänge, Energieeinsparung Basic 10 % / Standard 18 % / Premium 28 %, Sicherheits-Score from `securityLvl()`.

**14 scenes:** 01 Hausübersicht · 02 Eingang & Vorgarten · 03 Garage & Zufahrt · 04 EG Wohnzimmer · 05 EG Küche · 06 Terrasse · 07 Garten & Perimeter · 08 Keller Technik · 09 1.OG Schlafräume & Balkon · 10 Dachgeschoss · 11 Dachboden · 12 Dach & Energie (PV) · 13 Sicherheitsübersicht · 14 Zusammenfassung.

(Detailed example scene + device objects — see the v1 plan's §5/§6 as a format template; **use the real positions from `index.html`**, not invented ones.)

---

## 9. Visual Style Guide
Realistic-credible yet lightweight/readable. Dark premium glass UI. Evening/night, warm windows, subtle bloom. Glow: blue=security, gold=energy, green/teal=comfort/online, red=alarm only. Avoid neon sci-fi, tiny labels, heavy models, huge text blocks, random futuristic props. **Benchmark every screen against the §0 mockup.**

## 10. Interaction Rules
→ next, ← prev, click scene/floor → go, hover device → preview panel + glow ring + scale, click device → persistent DeviceInfoPanel (matches §0 right card), Esc → close. Device states: normal marker / hover glow / selected stronger glow / scene-focused subtle pulse / planned lower opacity.

## 11. Performance Budget
Smooth on student laptops, Chrome/Edge, static hosting, no backend. Primitives first → GLB later. Limit real-time shadows; Draco/meshopt; few simultaneous transparents. Fallback order if slow: reduce postprocessing → device animations → vegetation/interiors.

## 12. Milestones
- **0.1 Skeleton** (Codex): Vite/React/TS, canvas, store, scene data, keyboard nav, GSAP camera, PostFX shell, basic glass UI. Done: moves between ≥3 scenes smoothly.
- **0.2 Assets + Exterior** (Claude): asset pipeline online; house exterior, garage (attached, looks like a garage), driveway, Vorgarten, garden, terrace, balcony, roof/PV, fences, camera poles, varied grass. Done: recognizable & presentation-ready from overview.
- **0.3 Full scene flow** (both): 14 scenes, camera path each, nav UI, floor selector, descriptions.
- **0.4 Devices + panels** (Claude visuals / Codex interaction): markers, hover glow, selected panel (mockup card), cones, energy flow, server LEDs. Done: ≥20 interactive devices, German panels.
- **0.5 Cutaway + floors** (both): floor focus KG/EG/1.OG/DG/Dachboden, roof-off, exploded if feasible.
- **0.6 Interiors + polish** (Claude): readable interiors, materials, lighting, subtle animation, final glass UI, responsive. Done: looks like the mockup, not a prototype.
- **1.0 Final build** (Codex integrate + Claude QA): `npm run build` passes, deployable, full German, no console errors, all 14 scenes.

## 13. Branch / Merge Protocol & Rules
Branches: `main`, `codex/foundation`, `codex/camera-navigation`, `codex/state-integration`, `claude/visual-scene`, `claude/assets`, `claude/ui-polish`, `claude/devices-content`, `integration/presentation-v1`.

Rules:
1. Both read this plan + `AGENTS.md` before coding.
2. Codex builds repo structure + data contracts (types/store) first; Claude starts visual work after they exist.
3. **PORT existing content (§1); do not re-derive from scratch.**
4. No full-structure rewrite after 0.1.
5. Run `npm run build` before every handoff; fix failures first.
6. No duplicated data arrays in components; no hardcoded device text in 3D components.
7. Use real machine paths (§1), **not** `/mnt/data/...`.
8. Small commits, clear names. Touch the other agent's files minimally.
9. Codex does not rely on Claude "skills" (different system); shared brain = this file + Git + `AGENTS.md`.

## 14. Handoff
Keep `HANDOFF.md` (newest on top): What changed · Files touched · How to test (`npm install` / `dev` / `build`) · Known issues · Next suggested task.

## 15. Definition of Done
Premium intro screen; arrow + UI nav across **14 scenes**; recognizable KG/EG/1.OG/Dachgeschoss/Dachboden; balcony/terrace/garden/driveway/garage visible; ≥20 devices in meaningful spots; hover glow + click panel; camera cones; animated PV energy flow; Keller tech core; security overview; mostly-German UI; **UI/quality matches the §0 mockup**; `npm run build` passes; no console errors; README with run/deploy.

## 16. First Prompt for Codex
```text
Read SMART_HOME_3D_AGENT_PLAN.md fully (and AGENTS.md if present). You are Agent A / Codex.
Implement Milestone 0.1 ONLY: Vite+React+TS bootstrap; TS types from §7; Zustand store; React Three Fiber canvas;
GSAP camera rig with smooth transitions; PostFX shell (@react-three/postprocessing: bloom+vignette); keyboard scene nav;
minimal glass UI shell laid out like §0 (top bar, left rail, bottom metrics dock — placeholders ok).
Create placeholder components only in src/scene and src/ui. Respect file ownership (§6). Use real paths, never /mnt/data.
Do NOT discard or invent content — it will be ported from the existing build by Agent B.
Run `npm run build`, then write HANDOFF.md.
```

## 17. First Prompt for Claude Code
```text
Read SMART_HOME_3D_AGENT_PLAN.md and HANDOFF.md fully. You are Agent B / Claude Code.
Port content from C:\Users\Vlad\Smart Home 3D\index.html and the configurator into src/data (scenes, devices, packages, pricing, floors) — reuse the tuned positions/poses, do not re-derive.
Then Milestone 0.2: asset pipeline + stylized exterior (5-floor stack, Dachboden half-height, attached garage, driveway, Vorgarten, garden, terrace, balcony, roof/PV, fences, camera poles, varied grass) and the glass HUD matching §0.
Use the existing Codex types/store; extend minimally with comments if needed. Preserve `npm run build`. Add a HANDOFF.md note.
```

## 18. Final Notes
Prioritize a working, **visually-on-target** interactive presentation. It must look like the §0 mockup AND clearly explain: Security · Energy · Comfort · Privacy · Modularity · Project planning. Feel like a professional smart-home demo site, not a converted PowerPoint.
