# BRB Prototype · Phase 2

BRB is a compact, turn-based browser strategy prototype with a pure TypeScript rules engine and a Next.js interface. The replay architecture is complete; Phase 2 balance validation is now in progress.

React displays state and sends player input. It does not own game rules, which keeps browser play, tests, and the simulator deterministic.

## Run it

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run simulate:baseline -- --notes "Describe what changed and what this run is testing"
```

Open `http://localhost:3000` after `npm run dev`. The production command creates a static export in `out/`, ready for later itch.io packaging. Publishing remains Phase 4 work.

## Project map

- `src/game/content.ts`: advisors, archetypes, deposits, Corporation moves, endings, routes, and Situation Cards
- `src/game/engine.ts`: game state and turn resolution
- `src/game/replay.ts`: pivotal reports, replay intents, and Archive merging
- `src/game/storage.ts`: versioned browser persistence adapter
- `src/game/bots.ts`: simple automated strategies
- `src/game/simulator.ts`: multi-run reports
- `scripts/simulation-log.ts`: appends a readable summary and notes for every CLI simulation
- `src/app` and `src/components/brb`: the App Router browser interface
- `src/playtest`: the local solo-play journal, six-run matrix, bookmarks, recaps, and export helpers
- `tests/game` and `tests/components`: rules and React behavior tests
- `docs`: current design and phase documents

Start with the [documentation index](docs/README.md), [BRB Jargon Reference and FAQ](docs/BRB_JARGON_AND_FAQ.md), [BRB Core Design](docs/BRB_CORE_DESIGN.md), and [BRB Replay Engine](docs/BRB_REPLAY_ENGINE.md) before changing the rules. The TypeScript engine is the source of truth for implemented behavior; the current documents define terminology, design intent, balance targets, and delivery status. Superseded concepts are preserved in the [documentation archive](docs/archive/README.md).

For guided self-play, open **Playtest Journal** in the app and follow [BRB Solo Guided Playtest](docs/BRB_GUIDED_PLAYTEST.md). The journal stays in browser storage and can be exported as JSON at any time.

Simulation summaries are recorded in [BRB Simulation Run Log](docs/BRB_SIMULATION_LOG.md). For example:

```bash
npm run simulate -- 1000 20260715 --label "Cadence experiment" --notes "Changed only the Corporation response interval."
```
