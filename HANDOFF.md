# Handoff

## 2026-07-02 - Claude - 0.5: exploded view, energy flow, focus staging, menu & HUD polish

What changed:
- **Exploded view** (Sicherheitsübersicht): storeys glide apart vertically (`ExplodeGroup` damping, step 1.5 m) — floors, glass bands, furniture, balcony, roof+attic and device markers all ride their storey; stairs hide (they would dangle). `useFloorOffsets`/`offsetFor` in CutawayController.
- **Energy flow** (Dach & Energie): golden particle streams along two Catmull-Rom paths PV→Keller-Energiemonitor and PV→Wallbox, with faint guide tubes (instanced dots, `scene/effects/EnergyFlow.tsx`).
- **Sprinklers animated**: three rotating water jets per sprinkler (phase-offset) + spray dome.
- **Focus staging** («лишнего не видно»): devices not on the scene's `visibleFloorIds` are hidden entirely; devices visible but not in `focusDeviceIds` shrink to 0.86×, drop accent glow to 0.55 and lose their cones. Focus devices pulse gently. Result: each stop presents ONLY its objects.
- **Smoother transitions**: camera ease `power3.inOut`, duration ×1.25, FOV now tweened (was an instant jump).
- **HUD fixes** (Vlad's list): stepper meta fixed at 210 px — arrows no longer shift with scene-name length; floor-rail sublabels shortened (texts stayed inside bounds); hamburger **menu now opens**: Projekt & Credits (Gruppe 7 / HRW / Betreuung + „Konzept · Visualisierung · Entwicklung: Vlad“), Arbeitspakete list, Steuerung; closes on outside click/Esc.
- **Arbeitspakete**: `PresentationScene.workPackage` + gold AP chip in the scene info card; every scene tagged (AP 1 Überblick · AP 3 Infrastruktur · AP 4 Sicherheit · AP 5 Komfort · AP 6 Garten · AP 7 Energie).

> ⚠️ AP-Nummern/Namen sind PLATZHALTER nach Konfigurator-Logik — Vlad liefert die echte WBS des Teams, dann in `data/scenes.ts` + `ui/TopBar.tsx` (WORK_PACKAGES) ersetzen. Credits-Zeile ebenso („Vlad“ → voller Name/Team).

How to test: scene 13 (exploded + cones), scene 12 (energy flow), scene 7 (rotating sprinklers), any interior scene (only its devices visible), menu button top-right, stepper arrows static across scenes. `npm run build` passes, console clean.

---

## 2026-07-02 - Claude - 0.4: device bodies + view cones + tooltips + HUD overhaul (SOLO MODE)

> **Process change (Vlad):** the Codex/Claude two-agent split is over — Claude owns the whole codebase now. §6 boundary rules in the plan/AGENTS.md are obsolete.

What changed:
- **Devices are real objects now** (Vlad: no more colored orbs). `types`: `DeviceInfo.kind` (21 kinds) + `coneTarget`. New `scene/devices/DeviceModel.tsx`: procedural mini-models — camera (aimed body + lens), doorbell, lock, fingerprint pad, siren dome, garage control box, wallbox (screen/cable/socket), poller, sprinkler, mower (body+wheels), pendant light, TV, speaker, thermostat dial, presence sensor, plug, server rack / NVR (LED slots), energy meter, smoke detector, mini PV. Accent part = device glow colour (emissive, state-driven intensity). Soft small aura keeps devices findable at distance.
- **Camera view zones**: aimed frustum cones from each camera to its `coneTarget` + ground footprint ring at the aim point; opacity scales none→focused→hover→selected. Camera bodies rotate toward their target.
- **Hover / click flow**: hover → 3D glass tooltip (name, category · type, „Klicken für Details“) + cursor pointer; click → detailed right panel (category icon, DE status with tone colour, description, features, benefit callout, package/cost chips, close button; Esc also closes).
- **HUD overhaul**: 14-item scene list column REMOVED (nav = top stepper + floor rail + ←/→); floor rail compact, vertically centred left; new bottom-left **SceneInfoCard** (index, title, description — the narration finally visible); metrics dock slimmed and moved bottom-right; RoomCards only on overview/summary; device panel restyled; top bar slimmed to 54 px; global compactness pass in `styles.css`.
- Deleted `src/ui/SceneNavigation.tsx` (replaced by the above).

How to test: `npm run dev` → hover any device (tooltip), click (panel + close), scene 13 Sicherheitsübersicht (all cones), scene 8 Keller (rack/NVR/meter models next to the GLB racks), scene 3 wallbox on the garage wall. `npm run build` passes, console clean.

Known issues / next:
- Marker mini-rack overlaps the GLB technik rack slightly (interactive handle vs prop) — nudge if it bothers.
- `exploded` cutaway still falls back to full house; energy-flow animation for the PV scene pending; sprinkler spray static.
- SummaryPanel.tsx is still an unused stub (display:none) — candidate for the summary scene later.

---

## 2026-07-02 - Claude - 0.2c: environment rework (Vlad's feedback + Konfigurator (2))

What changed (all Agent B files):
- **Plot relayout**: the house now sits at the FRONT of the plot; big garden behind. `Ground.tsx`: `PLOT = {x:22, zFront:12.5, zBack:-34}`, street strip in front (grass verge → sidewalk → asphalt road with centre markings), driveway/footpath reach the sidewalk, stepping-stone S-path from the terrace into the garden, natural grass tint `#3f9a2e` (repeat 16, stronger normals), front beds relocated, garden tone patches, labels (GARTEN moved deep into the garden, STRASSE added).
- **Garden** (`Garden.tsx`): new low modern fence (dark posts + 3 wooden slats) with gates at footpath/driveway; 3 benches; 6 warm bollard lamps (2 with real point lights, rest emissive-only for perf); 4 pop-up sprinklers with translucent spray domes; 4 flower beds (improved `FlowerBed`: stems + varied blossom sizes, exported from Ground); 10 trees; 700 instanced grass tufts (single draw call, seeded, keeps the path corridor clear).
- **Background** (`Skyline.tsx`): tower ring replaced by a suburb — gable-roof house silhouettes (cluster across the street + ring at r 62–117) with occasional warm windows, tree blobs, subtle hills at r ~170 (inside the 180 far plane).
- Devices: garden cameras → back fence corners, irrigation → on a sprinkler, mower/poller repositioned. Scenes: overview/garden/terrace/security/summary reframed for the new layout.
- Konfigurator (2).html checked: `data-tier="standard"` (die Professorin wählte Standard) — app default already Standard, no data change needed. Note: the new konfigurator labels the top living floor "2.OG"; our `dachgeschoss` is the same storey (4 Geschosse + Dachboden unchanged).

How to test: `npm run dev` → scenes 1 (overview), 2 (street/entrance), 6 (terrace + path), 7 (garden: benches/lamps/sprinklers/beds). `npm run build` passes; console clean.

Known issues: benches/lamps are subtle at dusk from wide shots (by design — house stays the hero); sprinkler spray is a static cone (animate in 0.4+ if wanted).

---

## 2026-07-02 - Claude - Milestone 0.2b: real house + environment + cutaway

What changed:
- Replaced `PlaceholderHouse` with the real build in `src/scene/` (ported tuned legacy geometry: W18 × D11, FH 3.1, front/street = **+Z**, ground y = 0, KG below ground):
  - `house/`: `HouseShell` (plinth ring, corner posts, entrance, per-storey warm lights), `FloorStack` (4 Geschosse: slabs, glass bands, partitions, labels), `Roof` (gable + PBR tiles + PV array + Dachboden attic interior), `Garage` (attached, 2 sectional doors, 3 passages, 2 GLB cars), `Balcony` (recessed loggia), `Terrace` (deck + patio GLB), `Stairs`, `CutawayController`.
  - `environment/`: `Ground` (PBR lawn as a FRAME around house footprint + Lichthof trench exposing the KG, driveway, path, flower beds, fog-catcher plane with a hole over the house), `Garden` (fence, camera poles, GLB trees), `Skyline` (fog city ring), `Environment` (drei Sky dusk + sun + offline IBL via Lightformers — no CDN downloads).
  - `interiors/Furniture` (GLB room sets per floor, rotated 180° for the +Z front), `SmartHomeWorld` (root), `CanvasLabel` (offline sprite labels), `constants.ts`, `materials.ts`.
- **Cutaway works** (`useCutaway`): `floor-focus` hides storeys above the focused one + roof + attic (dollhouse — the Keller is finally readable, server room visible), `roof-off` lifts only the roof for the Dachboden scene. `exploded` falls back to full house for now.
- Re-tuned all 14 scene cameras (`data/scenes.ts`) + all device positions (`data/devices.ts`) to the real geometry.
- `FloorSelector` wired to `data/floors.ts`; clicking a floor jumps to its scene.
- Assets copied to `public/models` + `public/textures` (Vite static serving).

Small touches to Agent A files (documented per §6 boundary rule):
- `core/Experience.tsx`: renders `SmartHomeWorld` instead of placeholder lights/grid/house.
- `core/PostFX.tsx`: bloom `luminanceThreshold 0.22→0.55`, `intensity 0.55`, vignette `0.72→0.55` — only emissives bloom now; low threshold made the whole frame milky (and SSAO-like heavy post was explicitly rejected by Vlad earlier).
- `store/usePresentationStore.ts`: dev-only `window.__smartHomeStore` handle (drive scenes from eval/console for screenshot-based debugging). `SmartHomeWorld` likewise exposes `window.__scene`/`__camera` in dev.
- Deleted `src/scene/PlaceholderHouse.tsx` (replaced by this milestone; it was explicitly bootstrap-only).

How to test:
- `npm run dev` → walk all 14 scenes with →; check Keller (dollhouse + Lichthof), Dachgeschoss (attic hides), Dachboden (roof lifts), floor rail clicks.
- `npm run build` → passes (tsc + vite).

Known issues / notes:
- Device camera cones point +Z globally (DeviceMarker draws them at a fixed local rotation) — needs per-device aim in 0.4.
- `exploded` cutaway (security scene) not implemented — full house shown.
- Furniture sets rotated wholesale by 180°; individual room orientation needs a taste pass on a real screen.
- Sprite labels render through geometry (depthWrite off) — readable but can overlap; revisit with troika/local font if needed.
- Bundle warning >500 kB (three) — code-splitting is an Agent A call.

Next (Claude): device 3D models + glow per category (0.4), garden polish (varied grass, more props), energy-flow effect for PV scene.
Next (Codex): InteractionLayer hover panel positioning, keyboard nav for floors, deploy pipeline; consider gsap-driven cone aiming contract in types if desired.

---

> ⚠️ CORRECTION (2026-06-29, from Vlad) — FLOOR STRUCTURE. Earlier "5 floors / Dachboden as a (half) floor" is **WRONG**.
> Correct model: **4 Geschosse + Dachraum.** `keller`=Keller (BASEMENT, below ground) · `eg` · `og1` · `dachgeschoss` (TOP **living** floor, no living space above) · `dachboden` = the unfinished attic void **INSIDE the roof** (Speicher, unbeheizt), **NOT a stacked storey**. There is NO 2.OG.
> Codex: in the 3D house, do NOT stack a Dachboden box — Dachboden is the roof interior. `src/data/floors.ts` + `AGENTS.md` updated.

## 2026-06-29 - Claude - Milestone 0.2a: real data ported

What changed:
- Created `src/data/{packages,pricing,devices,scenes,floors,projectData}.ts` with the tuned content ported from `_legacy_vanilla_index.html` + `_source_konfigurator.html`.
- Real tiers (Standard total **15.414 €**), 17 modules, `calcCost()` / `securityScore()`, 26 curated devices (German labels/descriptions/features/benefit/glow), 14 scenes (German), floor meta, live metrics (securityScore computed from pricing logic).
- Rewired `src/core/bootstrapData.ts` to re-export `SCENES`/`DEVICES`/`METRICS` from `src/data` (export names unchanged → store/consumers untouched).

Files touched:
- `src/data/*` (new)
- `src/core/bootstrapData.ts` (rewire only — sanctioned by previous handoff)

How to test:
- `npm run build` → passes (tsc + vite).
- `npm run dev` → live view (Vite, http://localhost:5173).

Known issues / notes:
- Scene cameras + device positions are aligned to the **foundation/placeholder house**; both get re-tuned when the real house geometry (`src/scene`) lands.
- Device ids changed vs Codex placeholders: `smart-plug`→`kitchen-plug`, `garden-sensor`→`irrigation`/`garden-camera-*`. If any component hardcodes old ids, switch to store lookups.
- The local preview tool only runs a static server (no Vite transform), so the React app is blank under it — use `npm run dev` for live view.

Next (Claude):
- Build the real house in `src/scene` (HouseShell / FloorStack / Garage / Cutaway) matching the §0 mockup, then re-tune scene cameras + device positions, and wire `FloorSelector` to `src/data/floors`.

---

## 2026-06-29 - Codex - Milestone 0.1 foundation

What changed:
- Created the Vite + React + TypeScript foundation for the showcase.
- Added shared TypeScript contracts from the plan.
- Added Zustand presentation store with 14 bootstrap scenes, placeholder devices, and metrics.
- Added React Three Fiber canvas, placeholder house, interactive markers, GSAP camera transitions, keyboard navigation, and Bloom/Vignette PostFX.
- Added glass HUD shell: top bar, scene navigation, floor selector, right device panel, metrics dock, room cards, start overlay.
- Preserved the old single-file Three.js build as `_legacy_vanilla_index.html` before replacing root `index.html`.

Files touched:
- `index.html`, `package.json`, `package-lock.json`, `.gitignore`, `vite.config.ts`, `tsconfig.json`, `src/app/*`, `src/core/*`, `src/store/*`, `src/types/*`, `src/scene/PlaceholderHouse.tsx`, `src/scene/devices/DeviceMarker.tsx`, `src/ui/*`, `src/utils/*`, `src/tests/smoke.test.ts`, `AGENTS.md`

How to test:
- `npm install`, `npm run dev`, `npm run build`

Known issues:
- `src/core/bootstrapData.ts` intentionally contains placeholder scene cameras/devices. Agent B should port real tuned `STOPS`, `DEVICES`, package/pricing, and German copy.
- `src/scene` and `src/ui` are minimal placeholders for integration. Agent B owns final visual craft and assets.
- Floor selector is display-only in this foundation pass.
- Existing `src/main.js` was left untouched and is no longer referenced by the root `index.html`.
- Browser screenshot QA was blocked by local sandbox/browser access, but `npm run build` passes.

Next suggested task:
- Agent B ports `src/data/{scenes,devices,packages,pricing,floors,projectData}.ts` and updates placeholder UI/scene against the visual mockup.
