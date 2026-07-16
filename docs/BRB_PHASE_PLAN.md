# BRB Phase Plan

## Phase 0: Vision lock — Complete

Finalize the four vision answers: system, experience, player system goal, and player experiential goal. Lock the core loop, player fantasy, prototype exclusions, resources, BRB tracks, advisor model, Corporation model, and ending philosophy.

**Exit criterion:** No feature is proposed without directly supporting the prototype’s four validation goals.

**Delivered:** The four vision answers, core loop, resources, tracks, three advisor models, four Corporation moves, four ending families, prototype scope, and exclusions are locked in [BRB Core Design](BRB_CORE_DESIGN.md).

## Phase 1: Logic prototype — Complete

Build the revised turn loop, consultation phase, consequence phase, interactive situations, seeded randomness, headless game engine, tests, basic bots, and simulator.

**Goal:** Confirm that the system produces meaningful tradeoffs.

**Exit criterion:** A simulated run can resolve valid actions, Corporation responses, advisor effects, and ending conditions without React or browser APIs.

**Delivered:**

- Pure TypeScript state transitions with no React or browser imports
- Briefing, one optional consultation, one major commitment, consequence resolution, and next-turn setup
- Permanent deposits, 15 situations, two connected chains, advisor reactions, adaptive Corporation moves, pressure, and endings
- Serializable seeded runs suitable for local saves
- Three basic strategy bots and a command-line simulator
- Deterministic behavior tests and TypeScript checks

The engine entry point is [`src/game/index.ts`](../src/game/index.ts). Run `npm test`, `npm run typecheck`, or `npm run simulate -- 1000 20260715` from the project root.

## Phase 1.5: Counterfactual replay slice — Complete

Add the replay engine before changing balance values. Replace Events with the 15-card Situation Deck, make delayed consequences traceable to their originating decisions, and ensure every ending leaves one unfinished question.

**Goal:** Make a completed run provoke: “I wonder what happens if…”

**Exit criterion:** Identical seeds and choices produce identical histories and reports; changing one choice creates a traceable divergence; every completed run creates one pivotal decision, one valid hint, and one suggested experiment; Archive v0 stores knowledge without changing starting power.

**Delivered:**

- 15 typed Situation Cards: 6 Crisis, 4 Advisor, and 5 Corporation; 10 Common and 5 Rare
- Requirements, weighted seeded draws, Common cooldowns, Rare limits, and card additions/removals
- Four echo types with decision provenance: card, relationship, system, and ending
- Labor Coalition and Corporate Exposure routes
- Archetype-specific card weights, consultation abilities, liabilities, and ending variations
- Deterministic Declassified Report, two replay actions, and knowledge-only Archive v0
- Versioned local storage with safe fallback for active run, Archive, latest report, and replay intent
- Static Next.js App Router browser application with Start, Campaign, Report, and Archive views
- Replay-aware simulator fields and a separate post-replay baseline

The replay rules are locked in [BRB Replay Engine](BRB_REPLAY_ENGINE.md).

## Phase 2: Balance prototype

Use simulation to produce 10,000-run reports. Compare archetypes and strategies; measure endings, actions, cards, echoes, routes, and unreachable states; then revise the model.

**Goal:** Confirm that multiple strategies are viable and the game is not mathematically broken.

**Exit criterion:** No dominant strategy, impossible required state, or unexplained ending-frequency outlier remains in the chosen targets.

## Phase 3: Human playtest build

Add the opening-turn tutorial, polish the responsive interface and consequence feedback, add basic portraits, audio, activation presentation, and a feedback link.

**Goal:** A new player can understand and finish a run without assistance.

**Exit criterion:** Playtesters can explain the deposit tradeoff, advisor tension, Corporation threat, and why they would replay.

## Phase 4: itch.io prototype

Publish the browser build with a store page, screenshots, GIF, cover image, credits and asset licenses, AI disclosure, bug-report process, and version history.

**Goal:** Measure completion, replay, and interest.

**Exit criterion:** The release has a stable public build, basic telemetry or feedback collection, and a process for triaging reported bugs.

## Phase 5: Paid desktop edition

Expand to 30–50 Situation Cards, five archetypes, more chains and endings, meta-progression, a downloadable wrapper, Windows and macOS builds, stronger art and audio, and a Steam page with demo.

**Goal:** Earn the first $500.

## Phase 6: Add-ons and IAP

Add horizontal content such as scenarios, advisor sets, Corporation personalities, alternate BRB projects, crisis packs, mutators, endings, and archetypes. Do not sell resource boosts, easier starts, permanent power, single choices, or consumable currency.
