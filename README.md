# BRB Prototype · Phase 2

BRB is a compact, turn-based browser strategy prototype with a pure TypeScript rules engine and a Next.js interface. The replay architecture is complete; Phase 2 balance validation is now in progress.

React displays state and sends player input. It does not own game rules, which keeps browser play, tests, and the simulator deterministic.

## Run it

```bash
npm install
npm run dev
npm test
npm run test:browser:install # first setup only; installs Chromium
npm run test:browser
npm run typecheck
npm run build
npm run simulate:baseline -- --notes "Describe what changed and what this run is testing"
```

Open `http://localhost:3000` after `npm run dev`. The production command creates a static export in `out/`, ready for later itch.io packaging. Publishing remains Phase 4 work.

`dev` and `build` both run `scripts/inject-art.ts` first, which checks the curated art manifest and reports whether licensed art or the CSS fallbacks are in use. The licensed source packs are not in this repository, so a fresh clone runs in fallback mode and that is expected — the game is fully playable either way. The art commands are:

```bash
npm run art:status          # read-only: licensed or fallback mode, and which keys resolve
npm run art:verify          # fail if any manifest asset is missing or corrupt
npm run art:curate          # re-cut curated assets from the local licensed pack
npm run art:contact-sheets  # preview sheets into the ignored scratchpad/
npm run test:browser:art    # strict browser decode check across the full manifest
```

See [BRB Art Pipeline](docs/BRB_ART_PIPELINE.md) for the curation workflow and [Third-Party Assets](docs/THIRD_PARTY_ASSETS.md) for licensing.

## Project map

- `src/game/content.ts`: advisors, archetypes, deposits, Corporation moves, endings, routes, and Situation Cards
- `src/game/engine.ts`: game state and turn resolution
- `src/game/turn-beats.ts`: derived improvement, discovery, milestone, and problem summaries for the post-commitment aftermath
- `src/game/replay.ts`: pivotal reports, replay intents, and Archive merging
- `src/game/storage.ts`: versioned browser persistence adapter
- `src/game/bots.ts`: simple automated strategies
- `src/game/simulator.ts`: multi-run reports
- `scripts/simulation-log.ts`: appends a readable summary and notes for every CLI simulation
- `src/app` and `src/components/brb`: the App Router browser interface
- `src/components/brb/control-room`: the living control room — a pure resolver maps game state to lighting, scars, and room treatments
- `src/components/brb/narrative`: the post-commitment aftermath scenes; a resolver picks the scene and the catalogs hold declarative scripts
- `src/components/brb/pixel-room` and `src/components/brb/pixel`: the orthographic room canvas and sprite primitives
- `src/game-art/manifest.ts`: the curated-art manifest that names every asset key the interface may use
- `scripts/inject-art.ts`, `scripts/curate-art.ts`, `scripts/room-recipes.ts`: the art pipeline — curate from the licensed pack, compose room bases, and inject curated art before `dev` and `build`
- `src/playtest`: the local free-play journal, run input log, markers, coverage, replay, and export helpers
- `tests/game` and `tests/components`: rules and React behavior tests
- `tests/browser`: Chromium player-flow, responsive, keyboard, reduced-motion, and axe accessibility tests
- `docs`: current design and phase documents

Start with the [documentation index](docs/README.md), [BRB Jargon Reference and FAQ](docs/BRB_JARGON_AND_FAQ.md), [BRB Core Design](docs/BRB_CORE_DESIGN.md), and [BRB Replay Engine](docs/BRB_REPLAY_ENGINE.md) before changing the rules. The TypeScript engine is the source of truth for implemented behavior; the current documents define terminology, design intent, balance targets, and delivery status. Superseded concepts are preserved in the [documentation archive](docs/archive/README.md).

Player-visible, compatibility, security, and delivery changes are tracked in the
[changelog](CHANGELOG.md). Feature and fix pull requests update its **Unreleased** section;
simulation experiments keep their detailed evidence in the simulation log.

Every campaign is recorded automatically. Press **M** during a run to drop a one-line marker, then open **Playtest Journal** to review coverage and notes; see [BRB Playtest Journal](docs/BRB_PLAYTEST_JOURNAL.md). The journal stays in browser storage, exports as JSON, and any exported run can be reproduced with `npm run replay`.

Simulation summaries are recorded in [BRB Simulation Run Log](docs/BRB_SIMULATION_LOG.md).
Use 3,000 runs for routine comparisons of common outcomes, campaign duration, and card tempo. Use 5,000 when activation or sub-percentage-point movement matters; rare Civic Legacy and individual-strategy results still need more evidence or multiple seed blocks. A 10,000-run comparison requires an explicit request. See the [sample-size convergence audit](docs/BRB_BALANCE_TARGETS.md#normal-strategy-sample-size-convergence-audit) for the evidence behind these defaults.
For example:

```bash
npm run simulate -- 3000 20260715 --label "Cadence experiment" --notes "Changed only the Corporation response interval."
```
