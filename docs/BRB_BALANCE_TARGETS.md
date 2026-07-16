# BRB Balance Targets

## Purpose

Balance toward the prototype’s four questions: deposits hurt, advisors create tension, the Corporation requires adaptation, and players want another run. Do not optimize for content breadth before these are proven.

## Run length

- Each major commitment advances the campaign by one month.
- Runs have no calendar deadline. A campaign may finish in months or continue for many in-game years.
- Difficulty: one prototype level.
- Every turn should offer one major commitment and one limited information action.
- A run should leave enough room to recover from early mistakes, but not enough to solve every pressure safely.

## Resource economy

The active resource set is Money, Influence, Intelligence, Trust, and Capacity. Phase 1 starts from this shared baseline before archetype changes:

| Money | Influence | Intelligence | Trust | Capacity |
| ---: | ---: | ---: | ---: | ---: |
| 48 | 42 | 38 | 46 | 44 |

All resources are capped from 0 to 100. Recovering a resource restores 30 points (28 for Capacity), raises Stress by 7, advances the Corporation by 3, and consumes the turn's major commitment.

### Deposit targets

| Track | Money | Influence | Intelligence | Trust | Capacity |
| --- | ---: | ---: | ---: | ---: | ---: |
| Engineering | 10 | 0 | 3 | 0 | 7 |
| Access | 0 | 9 | 7 | 0 | 3 |
| Legitimacy | 0 | 6 | 0 | 10 | 2 |
| Stability | 6 | 0 | 0 | 6 | 6 |

A standard deposit adds 25 track points. A large deposit costs 175% of the listed values, rounded up, and adds 40. Only progress changed in the controlled balance pass: costs, resource sacrifices, and side effects remain unchanged. Deposits are permanent and every track must reach 50 before activation.

Phase 2 must validate:

| Target | Why it matters |
| --- | --- |
| Starting range | Creates a legible archetype opening without deciding the run immediately |
| Income sources | Ensures recovery has meaningful opportunity cost |
| Deposit costs | Makes BRB progress a sacrifice rather than a default action |
| Crisis and counterplay costs | Forces competition with deposits |
| Caps and floors | Prevents hoarding and identifies failure states |
| Renewable status | Clarifies whether the player can recover from spending |

Stress and panic are pressure meters, not spendable resources. Track their thresholds, warnings, escalation, recovery paths, and loss conditions separately.

## Difficulty curve

- Early months teach the resource-deposit conflict with recoverable consequences.
- Middle months should make advisor leverage, Corporation adaptation, and BRB side effects collide.
- Late months should make activation tempting before it is fully safe.
- BRB progress must raise pressure: Engineering increases contractor dependence; Access increases insider threats; Legitimacy challenges secrecy; Stability costs time and speed.

Completion pressure is based on the percentage of the four 50-point readiness thresholds already filled:

| BRB completion | Pressure | Monthly escalation |
| --- | --- | --- |
| 0–24% | Quiet | None |
| 25–49% | Watched | +1 Corporation progress every 4 months |
| 50–74% | Contested | +1 Corporation progress every 3 months |
| 75–89% | Severe | +1 Corporation progress every 2 months, +1 Panic every 4 months |
| 90–100% | Critical | +1 Corporation progress every month, +1 Panic every 3 months |

This replaces an arbitrary deadline with rising opposition: taking longer is allowed, but completing the BRB makes every remaining month more dangerous.

## BRB tracks

Validate that players distinguish Engineering, Access, Legitimacy, and Stability without a manual. Track each track’s cost mix, advancement rate, gating conditions, failure risks, and effect on future Situation Cards.

The balance target is not equal cost. The target is distinct sacrifice: no track should feel like another label for the same payment.

## Advisors

The prototype has three advisors. For each, measure consultation frequency, advice-follow rate, leverage gained, loyalty loss, alignment conflict, competence impact, crisis usefulness, and breaking-point triggers.

Target behavior: an advisor is valuable enough to consider, but reliance on them creates a strategic cost. A brilliant rival and an incompetent loyalist should both create viable dilemmas.

## Corporation pressure

The prototype uses four Corporation move types. Measure which visible strategy state is inferred by players, response frequency, successful counterplay, and whether moves feel connected to player vulnerabilities.

Target behavior: the Corporation changes plans in ways a player can read and adapt to. It should not feel like a random progress bar or unavoidable punishment.

## Situation Deck

The prototype has 15 interactive Situation Cards and two connected chains. A seeded appearance roll succeeds 55% of the time. Track draw frequency by type and rarity, choice distribution, follow-ups, resource swings, echo category, route state, pivotal-decision category, and ending contributors.

Target behavior: variation comes from requirements, weights, prior choices, cooldowns, and deck changes—not blind randomness. Common cards may appear twice after a four-turn cooldown; Rare cards appear once. Rarity measures narrative frequency rather than power.

## Roguelite progression

Prototype runs use seeded randomness and three archetypes. Persistent progress should be limited to knowledge and options; do not introduce power upgrades in the prototype.

For the full game, evaluate horizontal unlocks such as archetypes, cards, scenarios, advisors, and mutators separately from baseline balance.

## Endings

The prototype targets 3–4 endings. Track occurrence rate, activation rate, track quality at resolution, panic, stability, advisor relationships, Corporation status, and major decision flags.

Target behavior: different strategies can produce different endings, and a loss or compromised ending teaches something useful for the next run.

## Playtest metrics

For every human or simulated run, record:

- Seed, archetype, duration, and ending
- Major actions and deposit timing
- Resource shortages and pressure-meter thresholds
- Advisor consultations, reliance, leverage, and breaking points
- Corporation moves, counter-actions, and unresolved threats
- Situation Card frequency by type and rarity, echo categories, route closures, and chain completion
- Pivotal-decision categories, ending contributors, and archetype ending variations
- BRB track progress and activation timing
- Player confusion, perceived fairness, completion, and replay intent

Use basic simulation tools and seeded runs to reproduce surprising results before changing numbers.

## Phase 1 simulation baseline — pre-replay architecture

The initial automated baseline is a smoke test, not a balance approval. Phase 2 owns final tuning.

Verified with `npm run simulate -- 10000 20260715`:

| Metric | Result |
| --- | ---: |
| Runs | 10,000 |
| Average months | 18.66 |
| Compromised activations | 552 (5.52%) |
| Corporation captures | 3,642 (36.42%) |
| State collapses | 5,806 (58.06%) |
| Civic legacy endings | 0 |
| Advisor consultations | 46,069 |
| Advisor departures | 87 |

The three basic bots all reached an activation, proving that the core route is reachable. The Rush bot performed best and the Defensive bot worst. The Technocrat won far more often than the Populist or Operator. No bot reached the Civic Legacy ending or chose faction, advisor-management, or institution actions.

Those gaps are Phase 2 inputs, not accepted balance. Phase 2 should first improve archetype parity, make defensive actions situationally worthwhile, and verify that Civic Legacy is reachable through normal play.

## Phase 1.5 simulation baseline — post-replay architecture

This baseline is generated separately with `npm run simulate:baseline` before any Phase 2 value changes. It adds Situation Deck, echo, route, pivotal-decision, ending-contributor, and archetype-variation fields. Results below describe the replay architecture as implemented; they do not approve its balance.

Verified with `npm run simulate:baseline` using seed `20260715`:

| Metric | Result |
| --- | ---: |
| Runs | 10,000 |
| Average months | 18.75 |
| Compromised activations | 163 (1.63%) |
| Corporation captures | 3,215 (32.15%) |
| State collapses | 6,622 (66.22%) |
| Civic legacy endings | 0 |
| Situation Cards presented | 118,242 |
| Resolved / ignored / suppressed / expired | 42,688 / 73,565 / 1,881 / 108 |
| Common / Rare draws | 96,466 / 21,776 |
| Labor normal / reconciled / invalid completions | 1,519 / 2,794 / 0 |
| Corporate Exposure opened / completed / invalid | 2,048 / 1,358 / 0 |
| Corporate seize / deal selections | 1,358 / 493 |
| Advisor consultations | 47,913 |
| Advisor departures | 371 |
| Government by Command | 2 |

The corrected architecture is trustworthy enough to diagnose balance: route totals reconcile exactly, invalid completions are zero, every two-choice card received both selections, every major action family was exercised, all advisors received meaningful use, and Government by Command became reachable. Narrative pivots remain story-focused while strategic pivots identify irreversible deposits and final turning points include deposits, cards, counters, and recovery.

**Phase 1.5 is not approved yet.** Civic Legacy remains absent. Only 36.1% of presented cards were actively resolved, and the 98.37% terminal-loss rate is far outside the prototype target. Those are now credible economy, timing, and difficulty findings rather than provenance or bot-coverage artifacts.

The complete machine-readable report is [BRB Replay Baseline](BRB_REPLAY_BASELINE.json).

## Controlled balance pass — 1,000-seed audit

All rows below use 1,000 runs and seed `20260715`. The historical replay baseline above remains unchanged. The clean deposit comparison holds the calibrated card policy constant, so the effect of the 25/40 progress experiment is visible by itself.

| Checkpoint | Activation | Collapse | Capture | Premium | Cards presented | Cards resolved | All tracks ready |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pre-pass source-of-truth baseline | 1.5% | 68.0% | 30.5% | 1.2% | 11.78 | 4.22 | 63 |
| 55% appearance, previous interval policy, 25/40 deposits | 6.2% | 65.4% | 28.4% | 3.0% | 10.16 | 3.62 | 241 |
| Calibrated card policy, old 20/32 deposits | 0.4% | 78.4% | 21.2% | 0.3% | 10.65 | 7.90 | 18 |
| Final: calibrated card policy, 25/40 deposits | 0.5% | 77.4% | 22.1% | 0.3% | 10.65 | 7.91 | 42 |

The final tempo is close to the 8–10 presentation target and inside the 6–8 active-resolution target. Bot samples resolve about 81% for public/institutional strategies, 73% for general strategies, and 65% for rush/command strategies; follow-up cards are always resolved. Confirmed abandonment accounts for most of the remaining unresolved cards; activation still records an unresolved active card as expired. Strategic pivots are now 50.3% deposits and 49.7% card decisions, replacing the previous 100% deposit result.

The staged Civic Legacy funnel is monotonic: 1,000 runs entered, 42 reached all-track readiness, 5 attempted activation, and 1 cleared Legitimacy 75 before failing Stability 75. No Civic Legacy completed. The closest institutionalist run was simulation index 388, seed `1803620704`: it met 8 of 9 Civic observations with tracks 50/65/85/80, Corporation 71, Institutions 72, completed Labor Coalition, and highest leverage 24, but Panic reached 100.

The deposit experiment helped all-track readiness by 24 runs, reduced collapse by 1.0 percentage point, and increased activation by 0.1 point, but it did not reach the target bands. Corporation pressure and card penalties were intentionally unchanged. The next single-lever experiment should increase deposit progress again while holding every other rule fixed, because 958 of 1,000 runs still drop at the first substantive Civic stage. A useful next comparison is standard 30 and large 48; it is a recommendation, not part of this pass.

## Open-ended monthly model — follow-up audit

The campaign no longer ends because a fixed number of months elapsed. The same 1,000 seeds now average 20.65 months, but that is observed bot behavior rather than a rule: the engine accepts commitments in Month 120 and beyond. The simulator alone has a 1,200-month non-termination guard, which throws an error instead of creating an ending.

| Metric | Open-ended result |
| --- | ---: |
| Activations | 6 (0.6%) |
| State collapse | 541 (54.1%) |
| Corporation capture | 453 (45.3%) |
| Premium endings | 4 (0.4%) |
| Cards presented / resolved per run | 11.31 / 8.40 |
| All tracks ready | 32 |
| Strategic pivots: deposit / card | 49.7% / 50.3% |

The first, stronger completion surcharge was rejected after it produced zero activations and 64% Corporation capture. The accepted interval-based rule preserves some activations while making escalation progressively more frequent near readiness. These results are a new balance input, not an approved difficulty result; the next tuning pass should change only the completion-pressure cadence if human playtests find the late game too abrupt.

Full Vitest, TypeScript, and Next build processes still stall before producing diagnostics or collecting tests in this workspace. Changed TypeScript files transpile successfully, a narrowed semantic compiler check passes all game modules, direct engine assertions pass, and the deterministic simulator completes, but the hanging full gates must be cleared before release approval.
