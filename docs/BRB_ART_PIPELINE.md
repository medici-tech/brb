# BRB Art Pipeline

How purchased LimeZu pixel art flows from the source pack into the running game
**without ever committing a binary to this public repository**.

## Why this exists

- The repo is **public**. The LimeZu full-version pack is **redistribution-restricted**,
  so not a single PNG/GIF may be committed.
- The source pack (`BRB Assets/`, ~886MB, ~92k PNGs) lives **only** on the maintainer's
  machine. It is gitignored.
- The curated runtime tree (`public/assets/brb/`) is **also gitignored**. It is either
  generated locally or injected at deploy from private storage.
- The app is a static export (`output: "export"`, `images.unoptimized`). Components must
  build and run when the assets are absent — the CSS control-room placeholders and the
  `PixelSprite` fallback keep the UI intact.

## The pieces

| Piece | Path | Committed? | Role |
| --- | --- | --- | --- |
| Source pack | `BRB Assets/` | No (gitignored) | Local-only LimeZu full-version art |
| Manifest | `src/game-art/manifest.ts` | Yes | Stable semantic keys → runtime paths + frame geometry |
| Sprite primitive | `src/components/brb/pixel/PixelSprite.tsx` | Yes | Renders a sheet; animates via CSS `steps()`; falls back on 404 |
| Contact sheets | `scripts/contact-sheet.ts` | Yes (code) | Survey candidate tiles/characters locally |
| Curator | `scripts/curate-art.ts` | Yes (code) | Copy/crop selected sources → `public/assets/brb/...` |
| Injector | `scripts/inject-art.ts` | Yes (code) | `prebuild` hook; env-gated deploy injection (no-op by default) |
| Runtime art | `public/assets/brb/` | No (gitignored) | Curated sheets the browser actually loads |

The manifest is the contract. Components reference **semantic keys** (`staffAnalystIdle`,
`monitorScreens`, …), never LimeZu's source-folder names, so the pack can be reorganised
or re-curated without touching component code.

## Flow

```
BRB Assets/ (local only)
   │  scripts/contact-sheet.ts   → scratchpad/contact-sheets/*.png   (survey; gitignored)
   │  scripts/curate-art.ts      → public/assets/brb/...             (curate; gitignored)
   ▼
public/assets/brb/  ──(local dev: served directly)──────────────► browser
        ▲
        └──(deploy: scripts/inject-art.ts fetches from private storage)
```

### 1. Survey (local)

```bash
tsx scripts/contact-sheet.ts            # all candidate groups
tsx scripts/contact-sheet.ts --list     # list group names
tsx scripts/contact-sheet.ts characters-16
```

Builds labeled ImageMagick montage grids into `scratchpad/contact-sheets/` so a human can
pick the right premade characters, monitors, and tiles. Requires the pack + ImageMagick.

### 2. Curate (local)

```bash
tsx scripts/curate-art.ts               # or: npm run art:curate
tsx scripts/curate-art.ts staffAnalystIdle staffOperatorIdle
```

Copies/crops the selected sources into `public/assets/brb/...` under the manifest's stable
filenames (e.g. crops a 96×32 single-facing strip out of a wider premade sheet). It strips
metadata without resizing or recoloring pixels. The command is idempotent and
provenance-logged. The `CURATION` table in `scripts/curate-art.ts` mirrors the manifest
keys one-for-one. See `BRB_ART_INVENTORY.md` for final selections, dimensions, hashes,
screen usage, and missing states.

### 3. Deploy injection (option 2 — private storage, not committed)

For deploys, `public/assets/brb/` is **injected from private storage** rather than committed.
`scripts/inject-art.ts` runs automatically as the `prebuild` npm hook:

- **`BRB_ART_SOURCE` unset (default / public CI):** no-op. Logs and exits 0. The build
  proceeds with no assets and the CSS/`PixelSprite` fallbacks render. This is the condition
  verified in CI (`npm run build` with `public/assets/brb/` absent).
- **`BRB_ART_SOURCE` set to a local directory:** the directory must contain the curated
  `control-room/...` tree. Relative paths resolve from the project root; absolute paths are
  also accepted.
- **`BRB_ART_SOURCE` set to an HTTPS base URL:** each manifest-relative path is fetched
  below that URL. Plain HTTP is rejected.
- **`BRB_ART_TOKEN` set:** the optional secret is sent as an HTTPS bearer token. Keep it
  build-only and never expose it through a `NEXT_PUBLIC_` variable.

Configured injection fails closed: every manifest file must exist, be a PNG, have the
declared dimensions, and have a distinct SHA-256 payload. Files are staged and validated
before replacing `public/assets/brb/`, so an incomplete private source cannot silently
ship the fallback presentation.

## Fallback guarantee

`PixelSprite` mounts an offscreen probe `<img>` for each sheet. If the sheet 404s (assets
absent), it renders the provided `fallback` instead of a broken sprite; the existing CSS
control-room placeholders remain the fallbacks. Animation freezes under
`data-motion="reduced"` or `prefers-reduced-motion`. Net effect: **the app always builds and
runs, with or without the curated art.**

## Approved presentation contract

- **Typography:** Barlow Condensed owns display headings and large state numerals;
  IBM Plex Sans owns prose and controls; IBM Plex Mono owns telemetry, case numbers,
  stamps, and short labels.
- **Pixel scales:** large desktop uses 4× for the monitor wall and 3× for staff and
  props. Tablet and narrow layouts use 2× for every visible sprite. Foreground
  silhouettes may use the approved 6× scale because their alpha is intentionally
  painted black.
- **Composition:** the room is a 16:10 desktop stage with background, midground,
  additive light, foreground occlusion, and UI layers. No perspective or fractional
  transform may wrap a sprite.
- **Shots:** operations, Situation, consultation, commitment, milestone, and ending
  are resolver outputs. CSS consumes those values through `data-*` attributes and
  presentation tokens; the resolver never changes gameplay state.
- **Motion:** ambient loops slow while reading, commitment and milestone responses
  are brief, crossing staff appear only on deterministic standby turns, ending
  tableaux are still, and reduced motion removes all room animation and transitions.
- **Narrow layout:** an active Situation receives a 120px monitor header. Standby
  keeps a 232px two-staff diorama. Peripheral props never displace decision text.

## Narrative scene architecture

After every major commitment, React presents a player-stepped three-beat scene:
**Setup → Action → Consequence**. The scene is presentation-only. Plain TypeScript
derives its script from the existing decision history and final game state; it does
not add fields to `GameState`, consume RNG, or change a rule.

Six reusable locations provide the top-down RPG vocabulary:

| Location | Typical commitments |
| --- | --- |
| Continuity Floor | advisors, consultation, institutional protection, activation |
| Oversight Chamber | public accountability, legitimacy, faction work |
| Secure Briefing | intelligence, covert pressure, classified fallout |
| Infrastructure Site | engineering, capacity, construction consequences |
| Corporate Suite | Corporation counters, money, private influence |
| Civic Gate | public disorder, trust, access, emergency consequences |

`sceneTypes.ts` is the renderer-neutral contract. The resolver maps structured
`DecisionRecord.subject` facts (with legacy `cardId`/`choiceId` fallback) to a
semantic script key — never by parsing summary prose. `sceneRegistry.ts` owns the
complete catalog, and `NarrativeAftermath.tsx` owns only the current visual step.
All 30 card choices, all 15 ignored outcomes, and every other supported major
commitment subtype have deterministic scripts. If art is absent, the same actors,
props, and locations remain visible as CSS shapes.

The continuity floor also receives persistent visual marks derived from canonical
state: pressure, institutional damage, Corporation presence, BRB construction,
departed advisors, and completed routes. These marks are recalculated on render and
are never saved separately.

## Renderer gate result

The reference scene was implemented in both React/DOM and Phaser in the ignored
`output/renderer-bakeoff/` workspace. Both prototypes used the same visual markers.
Headless Chrome measured a stable ~16.7 ms median DOM frame and found no horizontal
overflow.

| Gate signal | React/DOM | Phaser |
| --- | ---: | ---: |
| Compressed prototype/runtime JavaScript | 1,823 bytes | 318,115 bytes |
| Semantic scene layers | 5 | Canvas-only |
| Accessible controls remain native React controls | Yes | Required a parallel DOM layer |
| Assetless and static-export compatibility | Yes | Qualifies, with extra runtime |

React/DOM won the weighted scorecard and the Phaser prototype and dependency were
removed from the shipping implementation. Scene scripts therefore remain
renderer-neutral, while `NarrativeScene.tsx` is the only production renderer.

## How a dev refreshes local art

```bash
# 1. Ensure the LimeZu pack is at ./BRB Assets/ (never committed) and ImageMagick is installed.
# 2. (optional) survey candidates:
npm run art:contact-sheets
# 3. curate into public/assets/brb/ (gitignored):
npm run art:curate            # tsx scripts/curate-art.ts
# 4. run the app; PixelSprite now loads the real sheets, fallbacks disappear.
npm run dev
```

Use `/dev/control-room` in development to review every presentation state, shot,
tempo, lit station, paper-load tier, BRB stage, ending, active-Situation framing,
and reduced-motion mode. The route remains excluded from production builds.

Final verification:

```bash
npm run typecheck
npm test
npx playwright test
npm run build                         # assetless fallback build
BRB_ART_SOURCE=./private-art npm run build
```

The configured build must fail if `./private-art` is incomplete or invalid. Do not
replace that failure with a fallback: setting `BRB_ART_SOURCE` is an explicit promise
that the private source is complete.

## Player-visible credits

Start, Campaign, Ending, Report, Archive, and the internal Playtest Journal expose a
keyboard-accessible **Credits** dialog. The listed LimeZu packs come from
`src/game-art/credits.ts`, which filters the owned pack catalog to packs that currently
supply at least one `ART` manifest key. Do not credit unused owned packs from the dialog.

## Control-room CSS ownership

The living control room splits presentation CSS by responsibility:

| Module | Owns |
| --- | --- |
| `ControlRoomPresentation.module.css` | Base geometry, ambient loops, reduced-motion kill switch |
| `roomState.module.css` | `data-*` tokens and presentation-state / shot / focus chrome |
| `roomLighting.module.css` | Light pools, alert wash, scrim, vignette |
| `roomProps.module.css` | Depth layers, desk edge, foreground silhouettes |

Cross-module targeting uses `data-room-part` (and monitor `data-monitor-variant`),
not hashed local class names. Do not duplicate `data-presentation-state` selectors
back into the base presentation module.

## Frame-geometry note for curators

Character sprite geometry in the manifest uses **16w × 32h px, 6 frames per direction**
(a single-direction idle/walk strip is 96×32). Confirm this — and the seated/walk row offsets
used by the crops in `scripts/curate-art.ts` — against
`moderninteriors-win/2_Characters/Character_Generator/Spritesheet_animations_GUIDE.png`
when changing character sources.

Crossing travel uses distinct **walk-right** (`y=128`) and **walk-left** (`y=160`) strips
with a one-way CSS exit; do not reverse a front-facing strip to fake direction.

The security camera uses a deterministic `frameSequence` that repeats the first and
middle frames to reproduce the source GIF's two 0.5-second holds
(`[0×5,1,2,3,4,5×5,6,7,8,9]` → 18×16×16 at 10 fps). Prefer `frameSequence` over
hand-edited strips whenever curated playback must preserve source timing.

Screens remain 11×64×48 and server racks 3×16×48.
