# BRB Project Instructions

These instructions apply to the entire repository.

## Instruction Files

**This file is the single source of truth.** Different assistants auto-load
different filenames, so the repository keeps one real document and a thin
pointer for each convention:

| File | Loaded by | Contents |
| --- | --- | --- |
| `AGENTS.md` | Codex, and Claude Code / Cursor versions that support it | Everything. Edit this one. |
| `CLAUDE.md` | Claude Code | Pointer only |
| `.cursor/rules/brb.mdc` | Cursor (`alwaysApply: true`) | Pointer only |

Never copy guidance into a pointer — duplicated instructions drift, and the copy
that drifts is the one somebody reads. Add it here instead. If you add another
assistant, add another pointer rather than another document.

## Mission

BRB is a compact, turn-based political strategy roguelite. The player permanently deposits scarce political resources into four BRB tracks while managing advisors, public pressure, institutions, and the Corporation. A run should create meaningful sacrifice, traceable consequences, and a reason to replay.

The prototype must continue to test four questions:

1. Do permanent deposits hurt?
2. Do advisors create meaningful strategic tension?
3. Does the Corporation force adaptation?
4. Does a completed run make the player want another?

Do not add features merely because they are common in roguelites. BRB does not need grid movement, combat, loot, canvas rendering, or permanent power upgrades to prove its design.

## Communicating With the Maintainer

Assume the maintainer is still learning React and Next.js. When handing off work:

- lead with the player-visible outcome;
- briefly explain which part is React, which part is Next.js, and which part is plain TypeScript when that distinction matters;
- define unfamiliar terms in one sentence;
- avoid long framework lectures and unexplained jargon.

## Start Here and Resolve Conflicts in This Order

1. `src/game` and its tests are the authority for implemented rules.
2. `docs/BRB_JARGON_AND_FAQ.md` maps player language to code IDs.
3. `docs/BRB_CORE_DESIGN.md` defines the current vision and prototype boundary.
4. `docs/BRB_REPLAY_ENGINE.md` defines deterministic cards, routes, echoes, reports, replay, and Archive behavior.
5. `docs/BRB_BALANCE_TARGETS.md` records current targets and chronological experiments.
6. `docs/BRB_PHASE_PLAN.md` identifies the current phase and next gate.
7. `docs/BRB_PLAYTEST_JOURNAL.md` defines the free-play human-playtest protocol.
8. `docs/BRB_ART_DIRECTION.md` is binding for anything visual. Read Part 0 before
   touching an asset.

`docs/BRB_CURRENT_AUDIT.md` is a dated implementation and delivery-risk snapshot. Use it to identify things to recheck, not as proof that a failure or test count is still current. `docs/BRB_ART_AUDIT_2026-08-06.md` is the equivalent snapshot for artwork, measured against the art bible; the same caveat applies.

Files under `docs/archive/` are historical evidence only. Never restore their idle timers, Vite architecture, old resource model, Doomsday systems, or “canonical” terminology without an explicit new design decision.

If current code and current documentation disagree, preserve verified code behavior, investigate the mismatch, and update the relevant current document in the same change.

## Current Product and Delivery State

- Phase 0 vision lock, Phase 1 rules, and Phase 1.5 replay architecture are complete.
- Phase 2 balance validation is in progress.
- Phase 3 will focus on validating and polishing new-player onboarding, responsive presentation, portraits, basic audio, activation presentation, and external human playtesting.
- Hosting and itch.io release remain later work.
- The latest presentation direction is the state-driven living control room. It is presentation, not a second rules engine.

During Phase 2:

- change one balance lever per experiment;
- use a fixed seed for comparisons;
- distinguish reachability from approved balance;
- do not tune during a run, and review at least three natural free-play runs before changing a lever;
- do not compensate for an indirect effect by quietly changing another value.

## Locked Game Contract

- A month contains at most one optional consultation and exactly one accepted major commitment.
- A consultation does not advance time; a normal commitment advances one month.
- Campaigns are open-ended. There is no calendar loss condition.
- The pure engine is deterministic: the same seed and decisions must reproduce the same history.
- Deposits permanently remove resources and cannot be refunded.
- All four tracks must reach 50 before activation.
- Corporation Progress and Corporation Threat are separate systems.
- Situation Cards use seeded eligibility, weighting, cooldown, and draw limits.
- Ignoring an active card requires confirmation and resolves its ignored consequence before the selected commitment. Activation expires it instead.
- Every important choice must preserve decision-to-consequence provenance.
- Route transitions must remain legal and explicit; a closed route cannot silently complete.
- The Archive carries knowledge only. It must never improve starting power or alter odds.
- Invalid or unsupported persisted data fails closed.

Whenever a rule changes, inspect its effects on the browser flow, bots, simulator, reports, replay determinism, saved state, documentation, and tests.

## Technical Architecture

The stack is Next.js App Router, React, strict TypeScript, Tailwind CSS, Radix-based UI components, and Vitest. The production build is a static export.

Think of the repository as four layers:

1. **Simulation — `src/game`**
   Pure TypeScript owns state, actions, turns, randomness, cards, routes, pressure, endings, replay reports, bots, and simulation. It must not import React, components, `window`, or browser storage.
2. **Content — `src/game/content.ts`**
   Typed definitions own advisors, archetypes, costs, Situation Cards, Corporation moves, routes, and ending copy. Do not duplicate these values in JSX.
3. **Presentation — `src/app` and `src/components/brb`**
   React renders state and sends typed actions to the engine. It may explain rules, but it does not invent or resolve them.
4. **Platform — `src/game/storage.ts`, `src/playtest`, and `BRBApp.tsx`**
   Adapters orchestrate local storage, active runs, reports, replay intent, Archive data, and the free-play playtest journal.

Important boundaries:

- `src/game/types.ts`: canonical IDs and serialized state shapes.
- `src/game/engine.ts`: action validation and turn resolution.
- `src/game/cards.ts`: draw, eligibility, resolution, ignore, expire, and echo behavior.
- `src/game/routes.ts`: route transition legality.
- `src/game/progression.ts`: Completion Pressure, Corporation Threat, cadence, and campaign time.
- `src/game/replay.ts`: pivots, reports, replay intent, and Archive merging.
- `src/game/guidance.ts`: player-safe labels, previews, recommendations, and qualitative explanations derived from rules.
- `src/game/bots.ts` and `src/game/simulator.ts`: automated strategies and aggregate evidence.
- `src/components/brb/BRBApp.tsx`: client-side screen and persistence orchestration.
- `src/components/brb/CampaignScreen.tsx`: campaign composition; keep its subpanels focused.
- `src/components/brb/control-room/presentationStateResolver.ts`: pure mapping from game state to presentation state. Presentation thresholds must not mutate gameplay.
- `src/components/brb/control-room/ControlRoomPresentation.tsx`: visual room only.
- `src/app/dev/control-room/page.tsx`: development-only presentation preview. The production build replaces its preview import with a null component through `next.config.ts`; preserve that exclusion.
- `src/components/brb/narrative/sceneResolver.ts`: maps a `DecisionRecord` to a scene key and reads canonical state. This is the only narrative file that may import from `src/game`.
- `src/components/brb/narrative/sceneRegistry.ts`: merges the catalogs into one lookup. Register a new scene here or `getNarrativeSceneScript` will not find it.
- `src/components/brb/narrative/sceneCatalog*.ts`: declarative scene scripts, not logic. `sceneCatalogActions.ts` holds action, consultation, and ending scripts. The card scripts are split across three files of five cards each purely to keep them readable — `Cards1` (budget shortfall, contractor strike, insider offer, public hearing, whistleblower), `Cards2` (coalition vote, corporate lobby, emergency powers, intelligence leak, regional blackout), `Cards3` (audit discrepancy, capacity bottleneck, national march, protest spark, silent partner). The numbers carry no meaning; grep the card ID rather than guessing the file.
- `src/components/brb/pixel-room/` and `src/components/brb/pixel/`: the orthographic room canvas and sprite primitives. Room geometry lives in `roomDefinitions.ts`.
- `src/game-art/manifest.ts`: the curated-asset manifest. `scripts/inject-art.ts` validates it before `dev` and `build`; do not add an asset key without a manifest entry.

## React and Next.js Rules

- **This is Next.js 16, which very likely differs from what you remember.** APIs, conventions, and file layout have all moved. The version's own documentation ships inside the install at `node_modules/next/dist/docs/` — read the relevant guide there before writing Next-specific code, and prefer it over recalled APIs and over any answer that "sounds like Next." Deprecation warnings in build output are real; do not silence them.
- A React component is a function that turns props and state into UI. Prefer small components with explicit typed props.
- Put `"use client"` only in components that need hooks, event handlers, browser APIs, or local storage. App Router pages and layouts should remain server components when possible.
- Keep browser-only reads inside effects or event handlers so static rendering does not access `window`.
- Derive display data from canonical state instead of copying it into a second React state variable.
- Send `MajorAction` values through `commitAction`; do not modify `GameState` directly in a click handler.
- Use `getActionPreview`, `getActionError`, and other shared guidance helpers so disabled states and explanations match the engine.
- Fonts load through `next/font/local` from `src/app/fonts`, so the build needs no network access. Do not reintroduce `next/font/google`: a downloaded font makes the build non-reproducible offline, and the current families are self-hosted under OFL 1.1 with their provenance recorded in `docs/THIRD_PARTY_ASSETS.md`.
- Preserve semantic elements, button labels, dialog focus behavior, keyboard access, and `prefers-reduced-motion`.
- Keep the political dossier/control-room visual language. Avoid generic SaaS dashboards, arbitrary gradients, default-looking cards, or constant micro-animation.
- Use existing CSS variables and theme tokens. The main campaign has legacy global styles; the living control room uses a CSS module. Follow the local convention of the component being changed.

## Determinism, Saves, and Replay Safety

- Use only `src/game/rng.ts` inside game rules. Never call `Math.random`, `Date.now`, `crypto`, or browser APIs from the simulation.
- Treat `GameState` as immutable at public engine boundaries. Clone before mutation and return a new state.
- Adding or changing serialized fields requires a version/migration decision, storage tests, and documentation updates.
- Do not rename or remove local-storage keys casually. Current code supports an active-run migration path.
- Keep Archive merging idempotent by run ID.
- A same-seed replay must use a new run ID but preserve the seed, archetype, and experiment.
- Preserve report stability: a report must be derivable entirely from final `GameState`.
- Do not expose classified route requirements or future echoes through previews.

## Balance and Simulation Discipline

Use automated simulation to form hypotheses, not to replace human play.

- Routine comparisons of common outcomes, campaign duration, and card tempo use 3,000 runs. The fixed-seed convergence audit found that these measures changed negligibly between 3,000 and 5,000 runs.
- Use 5,000 runs when activation, sub-percentage-point movement, or another uncommon outcome materially affects the decision. Even 5,000 runs is not enough for precise Civic Legacy or individual-bot claims.
- A longer deterministic prefix does not test seed-to-seed robustness. Use a documented alternate seed or multiple seed blocks when robustness across seeds is the question.
- A 10,000-run comparison requires an explicit user request.
- `npm run simulate` appends to `docs/BRB_SIMULATION_LOG.md`; it is a mutating evidence command, not a harmless smoke test.
- `npm run replay` reproduces a recorded run from an exported playtest journal. Unlike `simulate`, it is non-mutating: it reads a journal and writes no tracked file.
- Always provide a useful `--label` and `--notes` when running a balance experiment.
- Use the established seed `20260715` for comparable baselines unless the experiment requires another seed.
- Keep `long_horizon` diagnostic-only unless a deliberate design decision promotes it.
- Record the tested hypothesis, the one changed lever, the result, and whether it was accepted or rejected.
- Do not overwrite historical checkpoints to make them look current.

Example:

```bash
npm run simulate -- 3000 20260715 \
  --label "Corporation cadence experiment" \
  --notes "Changed only the Watched response interval; comparing activation and collapse rates."
```

## Testing and Verification

Match verification to the change:

- Rules, content, cards, routes, endings, or saves: targeted game tests, then the full test suite and typecheck.
- React behavior: relevant component tests plus the full test suite and typecheck.
- Layout, motion, or responsive work: browser playtest at representative desktop and mobile sizes, keyboard check, reduced-motion check, and screenshots.
- Build configuration, routing, or client/server boundaries: production build.
- Balance changes: normal verification plus a documented simulation experiment.

Standard commands:

```bash
npm test
npm run typecheck
npm run build
npm run dev
npm run replay -- <exported-journal.json> --list
```

`npm test` runs everything through `vitest.config.ts`. `vitest.game.config.ts` is a
debugging aid, not part of the gate: it runs only `tests/game/**` in a forks pool with a
single worker, which is how to isolate cross-test pollution or a suspected ordering
dependency in the engine suite. It has no npm script on purpose — run it directly with
`npx vitest run -c vitest.game.config.ts`. A green run there and a red run under `npm test`
means the problem is shared state between suites, not the rule under test.

Run `npm run build` after changing Next.js configuration, pages, imports, fonts, or client/server boundaries. Do not run a large simulation merely to validate compilation.

Tests should assert player-observable contracts and invariants, not private implementation details. For deterministic behavior, compare histories or final states. For thresholds, test the boundary and the value immediately on each side.

## Documentation Maintenance

Update documentation in the same change when behavior or terminology changes:

- player-facing term, ID, threshold, action, advisor, archetype, card, route, or ending → `BRB_JARGON_AND_FAQ.md`;
- game fantasy, loop, scope, or locked design → `BRB_CORE_DESIGN.md`;
- cards, echoes, route provenance, replay, report, Archive, or persistence → `BRB_REPLAY_ENGINE.md`;
- balance target or experiment → `BRB_BALANCE_TARGETS.md` and the automatic simulation log;
- phase status or delivery gate → `BRB_PHASE_PLAN.md`;
- playtest procedure, markers, coverage, or replay → `BRB_PLAYTEST_JOURNAL.md`;
- visual rule, palette, composition, or motion principle → `BRB_ART_DIRECTION.md`;
- curated asset, crop, hash, or room recipe → `BRB_ART_INVENTORY.md`;
- aftermath scene script, scene location, or narrative registry entry → `BRB_ART_PIPELINE.md`.

Two routing rules are easy to miss:

- Adding an ending, card choice, or major action means adding its narrative scene in the same change. A scene-less outcome falls back to a generic aftermath, which reads as a bug rather than an omission. `ENDING_IDS` in `src/game/types.ts` makes a missing *ending* a compile error; nothing catches a missing card or action scene, so check `sceneRegistry.ts` by hand.
- Changing anything player-visible also means a `CHANGELOG.md` **Unreleased** entry. Presentation and art work counts as player-visible; refactors and test maintenance do not. See the changelog's own policy section.

Prefer player labels in UI copy and canonical IDs in technical discussion. Name ambiguous meters fully: “Corporation Progress,” “Corporation Threat,” “BRB Stability,” or “Institutions.”

## History-Derived Guardrails

Repository history establishes these decisions:

- The former Vite idle-game implementation is superseded by the current Next.js, discrete-month architecture.
- The engine was separated from React so browser play, tests, bots, and simulation share one source of truth.
- Replay provenance and legal route history were added before balance tuning; do not bypass them for a shortcut.
- Cause-and-effect clarity is a product requirement: show exact costs before commitment and attributed results afterward.
- The campaign UI was split into focused components after becoming too large. Extend those boundaries instead of rebuilding a monolith.
- The living control room derives visual state through a pure resolver with explicit thresholds and tests. Keep presentation effects downstream of simulation state.

## Using the Game Studio Plugin on BRB

### Project classification

BRB is a **shared, DOM-first browser strategy game in React/Next.js**. Its interface is the playfield. The Game Studio plugin's default Phaser recommendation does not apply because BRB is not a sprite, tilemap, platform, or action-canvas game.

Do not introduce Phaser, Three.js, React Three Fiber, raw WebGL, or a canvas renderer unless the user explicitly changes the product direction and accepts the accessibility, text-layout, testing, and architecture costs.

### Route to the narrowest useful specialist

Use `game-studio:game-studio` when a request spans design, UI, assets, architecture, and QA. After classifying it, route immediately:

| Need | Game Studio specialist | BRB-specific use |
| --- | --- | --- |
| State ownership, save boundaries, input or asset policy | `game-studio:web-game-foundations` | Preserve pure simulation, DOM presentation, serializable saves, and explicit actions |
| Campaign UI, onboarding, HUD, menus, responsive presentation | `game-studio:game-ui-frontend` | Treat the Situation workspace as the playfield; protect decision hierarchy and thematic clarity |
| Browser smoke test, screenshots, responsive or motion review | `game-studio:game-playtest` | Test Start → Campaign → Report → Replay/Archive and the playtest journal path |
| Animated 2D character or effect strips | `game-studio:sprite-pipeline` | Only after one approved in-game seed frame; generate the whole strip, normalize, and preview |

Image generation is **step 4** of the production hierarchy in `BRB_ART_DIRECTION.md` §0.2, not the default. Curate from the licensed pack, compose through `scripts/room-recipes.ts`, and measure against the documented rules first; generate only for concept work or a genuinely missing asset class, and say why the steps above could not serve. Generated work reaches `public/assets/` only after the §34 checklist plus technical and licensing review. Note that advisor portraits are ruled out by §15 — figures in BRB are roles, not likenesses. The 3D specialists are out of scope unless the user explicitly requests a 3D direction.

### BRB UI prompt ingredients

Give Game Studio concrete BRB context instead of asking for a generic “game dashboard”:

- **Fantasy:** a classified federal continuity control room building a dangerous national machine;
- **Viewpoint:** a fixed, text-heavy political command interface; no avatar or camera;
- **Player verbs:** Assess → Investigate/Consult → Commit → Read consequences → Adapt;
- **Primary playfield:** the active Situation file and its choices;
- **Persistent HUD:** resources, state pressure, BRB readiness, advisors, and Corporation Watch;
- **Secondary surfaces:** Field Manual, Archive, Playtest Journal, reports, and long explanations behind dialogs or dedicated views;
- **Material language:** charcoal console, aged dossier paper, amber/red signals, restrained institutional typography;
- **Motion:** ambient and restrained; strong motion only for danger, commitment, activation, and onboarding; respect reduced motion;
- **Platforms:** desktop-first responsive browser UI with a viable narrow layout;
- **Avoid:** SaaS dashboard styling, equal-weight panels, hidden costs, decorative motion competing with choices, or classified spoilers.

Reusable prompt:

```text
Use Game Studio for BRB. Classify it as a shared, DOM-first Next.js strategy game;
do not add Phaser, canvas, or 3D. Preserve the pure TypeScript simulation and static
export. The player verbs are Assess, Investigate/Consult, Commit, read consequences,
and Adapt. Treat the Situation file as the primary playfield. Keep costs, risks,
Corporation pressure, advisor leverage, and attributed aftermath readable. Match the
classified political control-room/dossier art direction, support keyboard and reduced
motion, and verify desktop plus narrow layouts. Close with a browser playtest.
```

### Game Studio workflow for a BRB feature

1. Restate which prototype question the feature supports.
2. Classify the work and choose the narrowest specialist.
3. Identify the owning layer before editing.
4. Preserve the simulation/presentation boundary.
5. Define the UI hierarchy and what remains collapsed or classified.
6. If adding assets, approve one visual source and establish stable asset keys before wiring components.
7. Add tests for state transitions or UI behavior.
8. Run a browser playtest through the affected player journey.
9. Capture representative screenshots for visual changes.
10. Report findings by severity and likely owner: simulation, presentation, platform, or asset pipeline.

### Game Studio definition of done

A browser-game change is not complete merely because the component renders. Confirm that:

- the first actionable state is obvious;
- costs, disabled reasons, risks, and consequences agree with the engine;
- the main verbs work with pointer and keyboard;
- dialogs and overlays do not lose focus or hide the current decision;
- desktop and narrow layouts remain usable;
- reduced motion removes nonessential animation;
- save/resume and replay still synchronize with the UI when affected;
- screenshots still read as a political game, not an admin dashboard;
- no visual resolver or asset has become a second source of gameplay truth.

## Before Finishing

- Inspect `git diff` and preserve unrelated user changes.
- Never include more than 12 files in one commit. Split larger changes into coherent, independently reviewable commits.
- Confirm the change stayed within the current phase and prototype scope.
- Run the proportionate tests and report exactly what ran.
- Mention any simulation log or documentation change explicitly.
- Summarize the player-facing result and the architecture impact in plain language.
- For any change that touches artwork, a room recipe, sprite geometry, or motion,
  cite the `BRB_ART_DIRECTION.md` rule numbers applied, report the completed §34
  checklist, name the visual anchor, and give measured values — not "it looks
  consistent" — for anything Parts III or IX specify as a number.

## Cursor Cloud specific instructions

The environment already runs `npm install` on startup, so dependencies are present. Standard commands are documented in `README.md` and `package.json` scripts (`dev`, `build`, `test`, `typecheck`, `simulate`); do not duplicate them here.

Non-obvious caveats for this VM:

- This is a single Next.js App Router app (no backend service or database). `npm run dev` serves it at `http://localhost:3000`. Both `dev` and `build` use the `--webpack` flag intentionally; do not switch to Turbopack.
- Fonts load via `next/font/local`, so `npm run build` does not need network access for fonts.
- Running `next dev` or `next build` regenerates `.next/dev/types` and rewrites `tsconfig.json` and `next-env.d.ts` in place (adding `.next/dev/...` include paths and repointing the routes import). This working-tree churn is expected tooling output — do not commit it.
- Next.js 16.3+ would otherwise rewrite this file whenever `next dev` detects a coding agent, appending its own managed rules block delimited by `nextjs-agent-rules` HTML comments. `agentRules: false` in `next.config.ts` turns that off, and a control run confirmed the flag is what stops it. If that block ever appears here again, the setting was lost — it is not something new to accept. Its actual advice is kept, in the maintainer's own words, under React and Next.js Rules. Do not write the literal begin/end markers into this file: Next matches on those strings, and a quoted copy makes it treat this file as already hosting the block.
- Chromium browser tests (`npm run test:browser`) require a one-time `npm run test:browser:install`; Chromium is not part of the default dependency install.
- `npm run simulate` appends to `docs/BRB_SIMULATION_LOG.md` — it mutates a tracked file and is not a harmless smoke test (see the Balance and Simulation Discipline section).
