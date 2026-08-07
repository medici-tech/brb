# Changelog

All notable changes to BRB are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
BRB is still a prototype, so changes remain under **Unreleased** until a release is cut.

## [Unreleased]

> **Saved-data notice.** Playtest journals written by earlier builds are **discarded, not
> migrated** — they recorded a guided matrix that no longer exists. Export anything you need
> before updating. Campaign saves, reports, and Archive data are unaffected.

### Added

- Graded victory reporting: `VICTORY · CIVIC LEGACY` and `VICTORY · COMPROMISED`
  now distinguish the two successful outcomes.
- A Clearance ladder that pays by ending grade: losses earn 1, the Necessary Regime
  earns 2, and Civic Legacy earns 3.
- A persistent Necessary Regime aftermath: the next campaign opens with Panic +6;
  Civic Legacy clears a pending aftermath, while losses neither create nor clear it.
- Free-play playtesting: every campaign is recorded automatically with whatever archetype
  and Legacy Directive the player chose.
- A one-line playtest marker on the **M** key, with a visible **Drop marker (M)** control,
  that records a note and the exact board state without interrupting the run.
- A passive coverage readout across archetypes, Directives, endings, Situation files, and
  campaign length, plus a per-run log and a browsable list of marker notes.
- `npm run replay`, which reproduces any recorded run from an exported journal and
  distinguishes an engine change from an unrecorded input when one no longer reproduces.
- **Abandon the active file** on the opening screen, beside Resume.
- Deterministic downstream effects for relationship memories and system modifiers.
- Mandatory Situation choice costs with affordability checks.
- Versioned Declassified Reports with final-state snapshots and safe legacy loading.
- Runtime validation for saved campaigns, reports, replay intent, and Archive data.
- A turn-transition explanation that attributes the latest consequences to their causes.
- An ordered post-commitment aftermath that shows improvement, proven strategic connections,
  meaningful milestones, and the pressure that frames the next decision.
- Deterministic Chromium coverage for the campaign, reports, replay, Archive, keyboard use,
  narrow layouts, reduced motion, and automated accessibility scans.
- Self-hosted IBM Plex Sans, IBM Plex Mono, and Barlow Condensed fonts with OFL licenses.
- A third fixed-camera tier for the continuity facility: the room renders at 3×
  (1056×672) on viewports 1600px and wider, instead of stretching the existing
  2× camera.

### Changed

- The Playtest Journal is a passive record rather than a prescribed sequence: it reports
  what recent sessions covered instead of assigning the next required run.
- Advisor Coup and Advisor Cabal now render their own room lighting and aftermath
  instead of falling back to a shared default: the facility keeps its own phosphor
  but narrows it to the advisor holding the state while the rest of the floor
  darkens, distinct from Corporate Capture's gold or State Collapse's blackout.
- Advisor departure now follows visible Loyalty thresholds; Alignment continues to affect
  ordinary consultation accuracy.
- Campaign commitments and reports expose clearer costs, known changes, ending reasons,
  advisor thresholds, and next-run experiments.
- The production export loads its existing font families locally and no longer depends on
  Google Fonts during a build.
- The Campaign now presents the continuity facility as a live command feed with localized,
  state-driven lighting, a centered operations axis, a cleaner BRB chamber, and distinct
  calm, crisis, Corporation, activation, and ending treatments.
- Situation files now share one command rail with the room, make standby authorization and
  active-response status explicit, and keep costs and risks legible at decision size.
- The mechanics guide and internal run notebook now appear as the Field Manual and Playtest
  Journal, while first-turn guidance uses a quieter console brief instead of a second dossier.

### Removed

- The six-run guided playtest matrix, its assigned archetype and Directive loadouts, the
  required-next-step banner, the five-commitment same-seed replay checkpoint, the ten-field
  end-of-run recap form, and bookmark categories and severities. The archived protocol is
  kept in `docs/archive/BRB_GUIDED_PLAYTEST.md`.
- **Clear active run** from the Playtest Journal; abandoning the file now happens on the
  opening screen.

### Fixed

- The facility's records annex no longer piles three objects into one footprint. A baked
  copier sat under both the Corporation terminal and the institutional-damage mark, so with
  the Corporation embedded and institutions breached a server rack and a safe were drawn on
  top of it and none of the three read.
- The infrastructure workroom's worksite sign no longer has its post painted over by the
  timber stack beside it.
- The records office's second evidence drop no longer lands on the desk it was meant to
  stand beside.
- Situation choices cannot resolve when their mandatory resource costs are unaffordable.
- Corporation strategy tie-breaking consumes independent seeded random values.
- Invalid nested persisted data fails closed instead of being trusted after a shallow cast.
- Low-contrast text and keyboard access for horizontally scrollable mobile status strips.
- Commitment confirmation dialogs now close before the next React state renders, preventing
  a stale confirmation from covering the aftermath.
- Long aftermath headings and milestone text remain contained in narrow layouts.
- Control-room sprite sheets animate again, while reduced-motion users retain deliberate
  still poses and the full room camera now fills its stage at every supported scale.
- Phone campaigns lead with the living control room and Situation file, and show all four
  pressure meters in a contained two-column grid.
- Rooms read as architecture: every far edge now carries a complete wall segment with a
  crown and baseboard instead of a single flat interior tile, and each floor is paired to
  its wall style by measured luminance so the shell is never the same value as the floor.
- Room furniture no longer uses fragments of larger assemblies. Conference-table end caps
  were being butted together into a lumpy blob and angled table corner leaves were placed
  as free-standing props; the worksite and civic perimeter were furnished from the
  interiors pack's "Basement" sorter, which is a rec room of pool tables and dart boards.
- Wall-mounted props (maps, boards, notice cabinets, extinguishers) hang on a wall instead
  of standing in the middle of open floor, and the nine fixed cameras no longer share one
  interchangeable grey layout.
- The Archive's records shelves now read as a progression: the three tiers were three
  equally crammed shelves, so accumulated knowledge was invisible.
- Room canvases snap any upscale to a whole number, so a container that is not an exact
  multiple of the source width letterboxes a few pixels instead of resampling every sprite.
- The corridor courier walks instead of teleporting: its travel is re-timed to one 4px step
  per walk-cycle frame, replacing a 16px hop every 282ms against an unrelated 8fps stride.
- Animated sprites are seeded into their own loop phase from their tile position, so a room
  of independent machines stops blinking in unison.
- `curate-art.ts` verifies each furniture placement's committed tile size against the real
  PNG while compositing, so the hand-maintained size table cannot silently drift.

### Security

- Persisted browser data receives strict runtime validation before it can affect a run.
- Build-toolchain dependencies advance to Next.js 16.3.0, PostCSS 8.5.23, and sharp 0.35.3,
  clearing three high-severity advisory chains. Most of the Next.js advisories cover server
  features a static export never deploys, so this hardens the development server and build
  rather than the published game. No application code changed.

### Internal

- Playwright and axe-core are development-only dependencies and do not ship in the game bundle.
- Development and visual-QA commands now report licensed-art versus fallback mode,
  reject partial or structurally corrupt local art, and offer a strict browser decode
  check for the full art manifest. The status command remains read-only.
- Simulation experiment results remain in `docs/BRB_SIMULATION_LOG.md`; routine refactors and
  test-only work belong here only when they affect players, compatibility, or delivery safety.

## Changelog policy

- Every feature or fix pull request updates **Unreleased** when it changes player-visible
  behavior, saved-data compatibility, security, or release/build requirements.
- Refactors, file moves, formatting, and test maintenance are omitted unless they change one
  of those contracts.
- Balance experiments keep their detailed hypothesis and results in the simulation log and
  balance targets. The changelog records only an accepted player-visible rule change.
- When a release is cut, move the relevant entries into a dated version section and start a
  fresh **Unreleased** section.
