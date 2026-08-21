# Smart Home 3D

**An interactive 3D walkthrough of a smart-home installation, built as a client-facing
sales presentation.**

### ▶ [Live demo](https://godlanm228.github.io/smart-home-3d/)

![react](https://img.shields.io/badge/React-19-61dafb)
![r3f](https://img.shields.io/badge/React_Three_Fiber-9-black)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6)
![license](https://img.shields.io/badge/license-MIT-green)

Sixteen guided scenes walk a prospective customer through a whole house — entrance, garage,
living room, kitchen, terrace, garden, basement tech room, upper floors, attic, roof with PV
— showing which devices go where, what the package costs and where the savings come from.
The presentation content is in German.

## What it does

- **Sixteen scripted scenes** with camera choreography between them — the visitor moves
  through the house, not around a model viewer.
- **Annotated devices**: callouts point at real positions in the 3D scene, with
  screen-space anti-overlap placement so labels never collide.
- **Pricing and savings**: package tiers, module pricing and a "where does the saving come
  from?" breakdown (lighting, heating, standby load) computed from the project data.
- **Mobile mode**: the presentation is meant to be opened from a QR code on a phone —
  edge-navigation arrows, portrait FOV fitting, reduced post-processing and a compacted
  layout below 560 px.

## Stack

React 19 · React Three Fiber 9 · drei · postprocessing · GSAP · TypeScript · Vite

~5,700 lines of TypeScript across scene, UI, data and state layers.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run typecheck    # tsc --noEmit
npm run build        # typecheck + vite build
npm run preview
```

## Deployment

Pushing to `master` triggers the GitHub Actions workflow, which builds with the
`/smart-home-3d/` base path and publishes to GitHub Pages.

## Project layout

```
src/
├── app/      shell, styles
├── core/     camera rig, scene transitions
├── data/     scenes, devices, floors, packages, pricing
├── scene/    3D content
├── store/    state
├── ui/       HUD, callouts, stepper, navigation
└── utils/
```

`_legacy_vanilla_index.html` is the preserved single-file Three.js build that preceded this
version, and `_source_konfigurator.html` is the original configurator — both are kept as the
reference for camera poses, device positions and pricing logic.

## License

MIT — see [LICENSE](LICENSE).
