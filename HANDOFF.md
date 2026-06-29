# Handoff

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
