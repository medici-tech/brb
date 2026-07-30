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

The engine entry point is [`src/game/index.ts`](../src/game/index.ts). Run `npm test`, `npm run typecheck`, or `npm run simulate -- 3000 20260715` from the project root.

## Phase 1.5: Counterfactual replay slice — Complete

Add the replay engine before changing balance values. Replace Events with the 15-card Situation Deck, make delayed consequences traceable to their originating decisions, and ensure every ending leaves one unfinished question.

**Goal:** Make a completed run provoke: “I wonder what happens if…”

**Exit criterion:** Identical seeds, loadouts, and choices produce identical histories and reports; changing one choice creates a traceable divergence; all route completions have legal provenance; important card choices receive strategy-dependent use; every ending creates narrative, strategic, and final-turn pivots; Archive v1 stores knowledge plus bounded Directive progression.

**Delivered:**

- 15 typed Situation Cards: 6 Crisis, 4 Advisor, and 5 Corporation; 10 Common and 5 Rare
- Requirements, weighted seeded draws, Common cooldowns, Rare limits, and card additions/removals
- Four echo types with decision provenance: card, relationship, system, and ending
- Labor Coalition and Corporate Exposure routes
- Archetype-specific card weights, consultation abilities, liabilities, and ending variations
- Deterministic Declassified Report, two replay actions, and Archive v1 with Clearance and six one-use Legacy Directives
- Versioned local storage with safe fallback for active run, Archive, latest report, and replay intent
- Static Next.js App Router browser application with Start, Campaign, Report, and Archive views
- Replay-aware simulator fields and a separate post-replay baseline
- Explicit route transition history with open, close, reopen, and completion provenance
- Targeted simulator strategies, ending funnels, card-outcome classifications, and three pivot categories

The replay rules are documented in [BRB Replay Engine](BRB_REPLAY_ENGINE.md). Determinism, route integrity, decision provenance, card coverage, stable reports, versioned persistence, browser tests, and the static build now pass. A July 23 rules audit corrected affordability after ignored Situation penalties, and an identical 3,000-run rerun confirmed that Directive-aware bot candidate validation does not alter the no-Directive baseline. Legacy Directive balance remains a separate Phase 2 question.

## Phase 2: Balance prototype — In progress

Use 3,000-run simulations for routine comparisons of common outcomes, duration, and card tempo; the current fixed-seed convergence audit found negligible movement from 3,000 to 5,000 on those measures. Use 5,000 when activation or sub-percentage-point movement matters, but do not treat that sample as precise evidence for Civic Legacy or individual strategies. Use alternate seeds or multiple seed blocks when testing seed-to-seed robustness. Compare archetypes and strategies; measure endings, actions, cards, echoes, routes, and unreachable states; then revise the model. Run a 10,000-run comparison only when explicitly requested.

**Goal:** Confirm that multiple strategies are viable and the game is not mathematically broken.

**Exit criterion:** No dominant strategy, impossible required state, or unexplained ending-frequency outlier remains in the chosen targets.

**Current findings:** The accepted `5/4/3/2/1` Corporation cadence reached 8.34% activation at seed `20260715` and 8.02% at alternate seed `20260716`, with 5,000 runs per block. All-track readiness remained more common than activation, both terminal loss modes remained common, every normal strategy activated, and the median was 22 months. Automated reachability now meets its evaluation target; human fairness and replay desire remain unverified.

**Current comprehension checkpoint:** The browser now leads with the objective and loss
conditions, places consultation and Situation choices ahead of supporting systems, repeats
exact routine effects in confirmation, preserves qualitative/classified Situation
disclosure, and shows activation and advisor thresholds. After each commitment, a
player-stepped orthographic aftermath scene shows Setup → Action → Consequence while the
linked written record preserves exact provenance. Six reusable political locations and
canonical-state-derived facility scars make major outcomes visible without adding
movement or another rules engine. The Campaign and Ending surfaces share one fixed
continuity-facility camera on the 16px LimeZu grid. The complete attributed audit remains available on
demand, and reports retain a versioned final-state snapshot. This prepares rather than
replaces the Phase 3 external onboarding gate.

**Current delivery checkpoint:** The existing IBM Plex and Barlow fonts are self-hosted under OFL 1.1, and the static production export succeeds with network access denied. Chromium Playwright coverage now exercises Start, Campaign, consultation, commitment, ordered aftermath, expandable exact audit, save/resume, Report, same-seed replay, Archive, keyboard navigation, narrow layout, reduced motion, and automated axe scans. These checks protect the current design; they do not approve balance or human comprehension.

### Phase 2 exit checklist

| Evidence | Status | What remains |
| --- | --- | --- |
| Deterministic rules, replay, storage, and route provenance | Complete | Preserve the green gate while tuning. |
| Current fixed-seed automated baseline | Complete for reachability | The current 3,000/5,000 checkpoints are not precise enough to approve rare endings. |
| Loyalty departure experiment | Automated safety accepted | Validate whether players understand disapproval, Loyalty loss, departure risk, and Manage Advisor. |
| Six-run guided matrix and three five-commitment replays | Unverified | The matrix now assigns one Legacy Directive to each primary run, preserves it for required same-seed replays, and records timing, drawback meaning, and ignored-file ordering clarity. No completed journal export or cross-run synthesis is stored in the repository. Finish the first three without tuning, then complete the three targeted strategy runs. |
| Archetype and normal-strategy parity | Automated comparison complete | Both seed blocks include every archetype and normal strategy; validate the weaker Fixer and Command results through guided play. |
| Activation, premium-ending, and late-game targets | Automated target accepted | The isolated cadence produced 8.02–8.34% activation; validate near-wins, loss fairness, and activation payoff with humans. |
| Card tempo and defensive-style discoverability | Incomplete | Confirm through guided play whether players notice and enjoy the slower survival path. |
| Final Phase 2 recommendation | Incomplete | Accept or reject the tested lever, rerun the proportionate baseline, and record the decision without rewriting historical checkpoints. |

**Remaining work:** Finish the six-run guided evidence without tuning between the first three natural runs. Use the final three for defensive, aggressive, and institution-focused play, asking what the player was building, why the run ended, what they would change, and whether they want another run. Remain in Phase 2 until those human results explicitly accept or reject the cadence.

## Phase 3: Human playtest build

Validate and polish the existing first-three-month onboarding and How to Play guide, improve the responsive interface and consequence feedback, and add basic portraits, audio, activation presentation, and a feedback link.

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
