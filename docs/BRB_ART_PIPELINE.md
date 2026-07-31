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
  build and run when the assets are absent — `PixelRoom`'s flat orthographic schematic and
  the `PixelSprite` fallback keep the UI intact.

## Art direction (locked)

BRB uses a **fully orthographic fixed camera** on a shared **16px source grid**.
Every player-facing illustrated space — the continuity facility, aftermath rooms, and
smaller office scenes — shares one source scale. Dossier text, labels, captions, meters,
and controls stay **outside** the illustrated canvas.

Approved constraints:

- Flat room-builder tiles and consistently selected black-shadow furniture singles only.
- No 3D-wall tiles, CSS furniture, perspective transforms (`perspective`, `rotateX`,
  `rotateY`), fractional scaling, or per-object color grading.
- Rooms render internally at **1× source pixels**. The complete canvas upscales to
  **2× on desktop** and **1× on narrow screens** (`max-width: 1180px`), preserving the
  same full camera — never a crop of a different composition.
- Presentation state may change lighting, occupancy, clutter, damage overlays,
  Corporation presence, and BRB machinery stages. It must not invent a second rules
  engine or mutate `GameState`.

## The pieces

| Piece | Path | Committed? | Role |
| --- | --- | --- | --- |
| Source pack | `BRB Assets/` | No (gitignored) | Local-only LimeZu full-version art |
| Manifest | `src/game-art/manifest.ts` | Yes | Stable semantic keys → runtime paths + frame geometry |
| Credits map | `src/game-art/credits.ts` | Yes | Pack credit filtering for the player Credits dialog |
| Room recipes | `scripts/room-recipes.ts` | Yes | Integer-tile composites for complete room-base PNGs |
| Room types | `src/components/brb/pixel-room/roomTypes.ts` | Yes | `GridPoint`, `RoomLayer`, `RoomActor`, `RoomDefinition` |
| Room definitions | `src/components/brb/pixel-room/roomDefinitions.ts` | Yes | Committed dimensions, base art keys, sprite anchors |
| Room renderer | `src/components/brb/pixel-room/PixelRoom.tsx` | Yes | Fixed-camera orthographic compositor |
| Sprite primitive | `src/components/brb/pixel/PixelSprite.tsx` | Yes | Sheet playback via CSS `steps()`; falls back on 404 |
| Contact sheets | `scripts/contact-sheet.ts` | Yes (code) | Survey candidate tiles/characters locally |
| Curator | `scripts/curate-art.ts` | Yes (code) | Copy/crop singles + compose room bases → `public/assets/brb/...` |
| Injector | `scripts/inject-art.ts` | Yes (code) | `prebuild` hook; env-gated deploy injection (no-op by default) |
| Runtime art | `public/assets/brb/` | No (gitignored) | Curated sheets the browser actually loads |

The manifest is the contract. Components reference **semantic keys** (`staffAnalystIdle`,
`roomFacility`, `monitorScreens`, …), never LimeZu's source-folder names, so the pack
can be reorganised or re-curated without touching component code.

## Flow

```
BRB Assets/ (local only)
   │  scripts/contact-sheet.ts   → scratchpad/contact-sheets/*.png   (survey; gitignored)
   │  scripts/curate-art.ts      → public/assets/brb/...             (curate; gitignored)
   │       └─ room recipes       → control-room/rooms/*.png          (composites)
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
tsx scripts/curate-art.ts staffAnalystIdle roomFacility
```

Copies/crops selected singles into `public/assets/brb/...` under the manifest's stable
filenames, and composes complete room-base PNGs from `ROOM_RECIPES` in
`scripts/room-recipes.ts`. Coordinates and complete furniture footprints in recipes
are integer tiles; the curator validates their full extents before multiplying by 16
exactly once. Recipes also carry the fixed camera's sprite anchors, dynamic overlay
anchors, and lighting zones. Metadata is stripped without resizing or recoloring pixels.
The command is idempotent and provenance-logged. The `CURATION` table and room recipes
mirror the manifest keys. See `BRB_ART_INVENTORY.md` for selections, dimensions, hashes,
screen usage, and missing states.

Static room composites declare their **complete source dimensions as a single frame**
in the manifest (`frameCount: 1`, `expectedWidth` × `expectedHeight` equal to the PNG).

### 3. Deploy injection (option 2 — private storage, not committed)

For deploys, `public/assets/brb/` is **injected from private storage** rather than committed.
`scripts/inject-art.ts` runs automatically as the `prebuild` npm hook:

- **`BRB_ART_SOURCE` unset (default / public CI):** no-op. Logs and exits 0. The build
  proceeds with no assets and the schematic/`PixelSprite` fallbacks render. This is the
  condition verified in CI (`npm run build` with `public/assets/brb/` absent).
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
absent), it renders the provided `fallback` instead of a broken sprite. `PixelRoom`
shows a flat orthographic grid schematic when the room-base PNG is missing. Animation
freezes under `data-motion="reduced"` or `prefers-reduced-motion`. Net effect: **the app
always builds and runs, with or without the curated art.**

## Approved presentation contract

- **Typography:** Barlow Condensed owns display headings and large state numerals;
  IBM Plex Sans owns prose and controls; IBM Plex Mono owns telemetry, case numbers,
  stamps, and short labels.
- **Pixel scales:** every room canvas is authored at 1× source pixels. Desktop prefers
  the complete canvas at 2×; narrow layouts (`max-width: 1180px`) prefer 1×. Hosts may
  fit-scale the **whole canvas** via container query (`100cqi / sourceWidth`) so a
  narrower phone never crops the fixed camera. Do not apply per-sprite scale overrides
  inside a room.
- **Composition:** illustrated spaces use `PixelRoom` with integer tile anchors. No
  perspective transform may wrap a sprite. Whole-canvas scale is the only allowed scale
  step; sprites stay at source 1× relative to the canvas.
- **Shots:** `PresentationModel.shot` still drives tempo and sequencing labels
  (operations, Situation, consultation, commitment, milestone, ending). It must **not**
  crop the camera, hide room layers, or change which facility areas are visible.
- **Motion:** `data-tempo="reading"` sets `--room-tempo` so ambient sheet loops slow
  while the Situation dossier is open; commitment responses are brief; corridor staff
  appear only on deterministic standby turns; `data-tempo="still"` parks every sheet on
  its frozen pose; reduced motion removes room animation and transitions.
- **Campaign layout:** desktop places the **704×448** facility (22×14 tiles at 2×) beside
  the Situation dossier. Narrow widths stack the dossier first and the complete
  **352×224** facility second (fit-scaled if the host is narrower). Never overlap or
  crop the dossier into the room.
- **Accessibility:** in-room labels are removed. State is exposed through the room
  `aria-label` and the existing external meters, dossier copy, and controls.

## Continuity facility

The main Campaign and Ending surface is one fixed **22×14-tile** facility
(`roomFacility` → 352×224 source px):

| Area | Role |
| --- | --- |
| Central command floor | Animated monitor bank, conference table, chairs, three workstations |
| Secured BRB chamber | Server/machinery props and construction-stage overlays |
| Records / analysis annex | Shelves, terminals, document storage, clutter anchors |
| Service corridor | Two-tile-tall strip for deterministic staff travel without camera change |

State-driven overlays only: whole-room lighting, occupied/empty staff, LimeZu clutter,
debris/damage, Corporation presence, and BRB machinery stages. Visible in-room captions,
operations tables built in CSS, oversized silhouettes, and monitor text plates are out of
scope.

`/dev/control-room` previews the facility across presentation states. The route remains
excluded from production builds.

## Narrative scene architecture

After every major commitment, React presents a player-stepped three-beat scene:
**Setup → Action → Consequence**. The scene is presentation-only. Plain TypeScript
derives its script from the existing decision history and final game state; it does
not add fields to `GameState`, consume RNG, or change a rule.

Six reusable locations provide the orthographic aftermath vocabulary. Each has a
committed room recipe and `RoomDefinition` (14×10 tiles → 224×160 source px):

| Location | Typical commitments |
| --- | --- |
| Continuity Floor | advisors, consultation, institutional protection, activation |
| Oversight Chamber | public accountability, legitimacy, faction work |
| Secure Briefing | intelligence, covert pressure, classified fallout |
| Infrastructure Site | engineering, capacity, construction consequences |
| Corporate Suite | Corporation counters, money, private influence |
| Civic Gate | public disorder, trust, access, emergency consequences |

`sceneTypes.ts` is the renderer-neutral contract. `ScenePosition` values are integer
**tile coordinates** on the shared 16px grid (not CSS percentages). The resolver maps
structured `DecisionRecord.subject` facts (with legacy `cardId`/`choiceId` fallback) to a
semantic script key — never by parsing summary prose. `sceneRegistry.ts` owns the
complete catalog, and `NarrativeAftermath.tsx` owns only the current visual step.
All 30 card choices, all 15 ignored outcomes, and every other supported major
commitment subtype have deterministic, grid-valid scripts. `NarrativeScene` renders those
actors and props through `PixelRoom`; beat text and controls remain below the canvas.

Smaller shared rooms (`roomIntake`, `roomRecords`) support Start, Report, and Archive.
The records base intentionally contains no bookcases; three curated black-shadow shelf
singles and evidence props appear cumulatively from recovered run knowledge.
Doctrine/Directive cards and Archive mechanics remain text- and rules-first; artwork does
not alter Archive odds.

The continuity facility also receives persistent visual marks derived from canonical
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
renderer-neutral. Production illustrated rooms use `PixelRoom`; do not introduce Phaser,
canvas, or 3D for environment art.

## How a dev refreshes local art

```bash
# 1. Ensure the LimeZu pack is at ./BRB Assets/ (never committed) and ImageMagick is installed.
# 2. (optional) survey candidates:
npm run art:contact-sheets
# 3. curate into public/assets/brb/ (gitignored):
npm run art:curate            # tsx scripts/curate-art.ts
# 4. run the app; PixelRoom / PixelSprite load the real sheets; fallbacks disappear.
npm run dev
```

Use `/dev/control-room` in development to review every presentation state, tempo,
BRB stage, structural condition, Corporation-presence tier, occupancy mode, departed
advisor combination, ending, active-Situation framing, and reduced-motion mode.

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

## CSS ownership

Player-facing illustrated spaces no longer use layered perspective room CSS modules.
Ownership is:

| Module | Owns |
| --- | --- |
| `pixel-room/PixelRoom.module.css` | Fixed camera canvas, integer upscale, schematic fallback, lighting wash, reduced-motion |
| `control-room/ControlRoomPresentation.module.css` | Thin facility chrome / `data-*` passthrough around `PixelRoom` |
| `control-room/SituationWorkspace.module.css` | Campaign stage sizes (704×448 / 352×224) and dossier column layout |
| Narrative CSS modules | Aftermath beat chrome and grid-based actor cues **outside/around** the `PixelRoom` canvas |

Deleted modules (`roomState`, `roomLighting`, `roomProps`, `Ambient*`) must not return.
Tests in `tests/components/control-room-css-ownership.test.ts` lock the orthographic CSS
contract.

## Frame-geometry note for curators

Character sprite geometry in the manifest uses **16w × 32h px, 6 frames per direction**
(a single-direction idle/walk strip is 96×32). Confirm this — and the seated/walk row offsets
used by the crops in `scripts/curate-art.ts` — against
`moderninteriors-win/2_Characters/Character_Generator/Spritesheet_animations_GUIDE.png`
when changing character sources.

Crossing travel uses distinct **walk-right** (`y=128`) and **walk-left** (`y=160`) strips
with a one-way corridor path; do not reverse a front-facing strip to fake direction.

The security camera uses a deterministic `frameSequence` that repeats the first and
middle frames to reproduce the source GIF's two 0.5-second holds
(`[0×5,1,2,3,4,5×5,6,7,8,9]` → 18×16×16 at 10 fps). Prefer `frameSequence` over
hand-edited strips whenever curated playback must preserve source timing.

Screens remain 11×64×48 and server racks 3×16×48. Room bases are single-frame static
composites at their full pixel size (facility 352×224; standard rooms 224×160).
