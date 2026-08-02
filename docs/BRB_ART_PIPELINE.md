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

`BRB_ART_DIRECTION.md` is the art bible: what the work must look like, the
palette and contrast law, composition and motion rules, the review checklist,
and the asset-authoring workflow. This document covers how the pipeline is
wired and run.

Approved constraints:

- Flat room-builder tiles and consistently selected black-shadow furniture singles only.
- No 3D-wall tiles, CSS furniture, perspective transforms (`perspective`, `rotateX`,
  `rotateY`), fractional scaling, or per-object color grading.
- Rooms render internally at **1× source pixels**. The complete canvas upscales to
  **2× on desktop** and **1× on narrow screens** (`max-width: 1180px`), preserving the
  same full camera — never a crop of a different composition.
- **Any upscale is a whole number.** `PixelRoom` measures the container fit and
  snaps it down with `round()`, so a host that is not an exact multiple of the
  source width letterboxes by a few pixels instead of resampling every sprite.
  Shrinking below 1× stays continuous on purpose: the next integer step down is
  0.5×, which would halve the room on a phone to buy crispness it cannot show.
- Presentation state may change localized lighting, occupancy, clutter, damage overlays,
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
| Injector / verifier | `scripts/inject-art.ts` | Yes (code) | `predev` / `prebuild` hook; injection plus complete-manifest validation |
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

A room shell is composed back to front: floor, flat wall faces, far-edge wall
bands, then furniture. Each recipe names its own `floorArtKey`, `wallFaceArtKey`
and `wallCrownArtKey`, so the nine fixed cameras do not all resolve to the same
grey box. Two rules make the shell legible:

- **Far edges get the whole wall segment.** The source sheet stores each wall
  variant as a 32px band (outline, 4px crown, outline, 23px face, outline,
  baseboard, outline); a room's far edge paints that entire band across two tiles.
  Cutting only the face — which is what a single 16×16 wall tile is — leaves a
  room with no crown and no baseboard, and it reads as a gap in the carpet
  rather than as architecture.
- **Floor and wall are paired by luminance, not by taste.** Anything closer than
  roughly 20 relative-luminance points disappears into the floor. Measured wall
  faces are slate 94, pale 204, warm 191; the committed floors clear a 60-point
  gap against the wall they are used with.

Placement follows the same split: wall-mounted objects (maps, boards, screens,
consoles, notice cabinets, extinguishers) anchor at y=0 or y=1 so they sit inside
the far-edge band; free-standing furniture starts at y=2 or below.

Two pack-shape traps are worth knowing before adding furniture. Many
conference-hall singles are **fragments of a larger assembly** — 1 and 6 are the
end caps of a table run and 14–17 are angled corner leaves, so used as
free-standing props they render as lumpy blobs and floating slivers. And the
interiors pack has **no utility theme**: its "Basement" sorter is a rec room of
pool tables, cushions and dart boards. Worksite and perimeter stock comes from
Modern Exteriors' `8_Worksite_Singles_16x16` instead.

Because `FURNITURE_TILE_SIZE` is hand-maintained so recipes can be validated
without the pack, `curate-art.ts` re-checks every placement's committed size
against the real PNG at compose time and fails loudly on a mismatch. That is the
only point in the pipeline holding both numbers.

Static room composites declare their **complete source dimensions as a single frame**
in the manifest (`frameCount: 1`, `expectedWidth` × `expectedHeight` equal to the PNG).

### 3. Deploy injection (option 2 — private storage, not committed)

For deploys, `public/assets/brb/` is **injected from private storage** rather than committed.
`scripts/inject-art.ts` runs automatically before both `npm run dev` and `npm run build`:

- **`BRB_ART_SOURCE` unset and runtime art absent (default / public CI):** prints a
  prominent **FALLBACK ART MODE** warning and exits 0. The app proceeds with the
  schematic/`PixelSprite` fallbacks. This keeps public assetless builds supported while
  making it clear that the session is not valid for artwork or animation review.
- **`BRB_ART_SOURCE` unset and local runtime art present:** validates every manifest
  asset before development or build. A partial or invalid local curation fails instead
  of quietly mixing licensed sprites with fallbacks.
- **`BRB_ART_SOURCE` set to a local directory:** the directory must contain the curated
  `control-room/...` tree. Relative paths resolve from the project root; absolute paths are
  also accepted.
- **`BRB_ART_SOURCE` set to an HTTPS base URL:** each manifest-relative path is fetched
  below that URL. Plain HTTP is rejected.
- **`BRB_ART_TOKEN` set:** the optional secret is sent as an HTTPS bearer token. Keep it
  build-only and never expose it through a `NEXT_PUBLIC_` variable.

Configured injection fails closed: every manifest file must exist, be a PNG, have the
declared dimensions, contain a complete CRC-valid IHDR/IDAT/IEND chunk structure, and
have a distinct SHA-256 payload. Files are staged and validated before replacing
`public/assets/brb/`, so an incomplete or structurally corrupt private source cannot
silently ship the fallback presentation. Chromium remains the final decode check.

### Development and visual-QA status

`npm run dev` remains usable without licensed art, but its `predev` check always names
the active presentation mode in the terminal:

- **LICENSED ART READY** means all manifest files passed geometry and duplicate checks.
- **FALLBACK ART MODE** means no private runtime directory exists. Use this mode for
  public compatibility checks, not for judging artwork or animation.
- A present but incomplete/invalid directory is an error and prevents startup.

Use the strict commands before reviewing art:

```bash
npm run art:status          # read-only report; assetless fallback is allowed
npm run art:verify          # require and validate all licensed runtime art
npm run test:browser:art    # verify, then decode every manifest asset in Chromium
```

The regular `npm run test:browser` remains assetless-compatible for public CI and
mechanical UI checks. `npm run test:browser:art` is the artwork/animation QA gate; its
browser assertion also checks each decoded image's natural dimensions against the
manifest. It prepares a configured private source once, then the browser server validates
the installed tree without downloading it again. `art:status` never downloads or replaces
files, even when `BRB_ART_SOURCE` is configured.

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
  while the Situation dossier is open; commitment responses play after the aftermath
  closes; corridor staff
  appear only on deterministic standby turns; `data-tempo="still"` parks every sheet on
  its frozen pose; reduced motion removes room animation and transitions.
- **Campaign layout:** desktop places the **704×448** facility (22×14 tiles at 2×) beside
  the Situation dossier. Tablet widths use the complete **352×224** facility. Below
  760px, the complete **352×224** facility leads into the dossier and the whole
  Situation workspace moves immediately below the masthead, ahead of onboarding,
  pressure, and consultation. Never overlap or crop the dossier into the room.
- **Accessibility:** in-room labels are removed. State is exposed through the room
  `aria-label` and the existing external meters, dossier copy, and controls.

## Continuity facility

The main Campaign and Ending surface is one fixed **22×14-tile** facility
(`roomFacility` → 352×224 source px):

| Area | Role |
| --- | --- |
| Central command floor | Centered animated monitor bank, conference table, chairs, three workstations |
| Secured BRB chamber | Empty baked vault filled only by non-overlapping state-driven machinery stages |
| Records / analysis annex | Shelves, terminals, document storage, clutter anchors |
| Service corridor | Two-tile-tall strip for deterministic staff travel without camera change |

State-driven overlays only: localized lighting, occupied/empty staff, LimeZu clutter,
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
singles and evidence props appear cumulatively from recovered run knowledge. Those
three shelves are chosen for **visible empty space**, not just for being shelves —
sparse (56) has bare sections, full (57) is stocked on every level, overflow (74)
is crammed past capacity. Picking three equally full shelves, as the first pass
did, makes the Archive's accumulation invisible even though the layer logic works.
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
# 4. require the complete licensed set before visual review:
npm run art:verify
# 5. run the app; predev reports LICENSED ART READY.
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
npm run test:browser:art              # required for artwork / animation QA
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
