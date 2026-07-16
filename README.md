# BRB Prototype

BRB is a compact browser strategy prototype with a pure TypeScript rules engine and a Next.js interface. Phase 1.5 adds the replay layer: a seeded Situation Deck, traceable delayed echoes, Declassified Reports, and a knowledge-only Archive.

React displays state and sends player input. It does not own game rules, which keeps browser play, tests, and the simulator deterministic.

## Run it

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run simulate:baseline
```

Open `http://localhost:3000` after `npm run dev`. The production command creates a static export in `out/`, ready for later itch.io packaging. Publishing remains Phase 4 work.

## Project map

- `src/game/content.ts`: advisors, archetypes, deposits, Corporation moves, endings, routes, and Situation Cards
- `src/game/engine.ts`: game state and turn resolution
- `src/game/replay.ts`: pivotal reports, replay intents, and Archive merging
- `src/game/storage.ts`: versioned browser persistence adapter
- `src/game/bots.ts`: simple automated strategies
- `src/game/simulator.ts`: multi-run reports
- `src/app` and `src/components/brb`: the App Router browser interface
- `tests/game` and `tests/components`: rules and React behavior tests
- `docs`: current design and phase documents

Start with [BRB Core Design](docs/BRB_CORE_DESIGN.md) and [BRB Replay Engine](docs/BRB_REPLAY_ENGINE.md) before changing the rules.
