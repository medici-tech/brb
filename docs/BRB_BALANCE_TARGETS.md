# BRB Balance Targets

## Purpose

Balance toward the prototype’s four questions: deposits hurt, advisors create tension, the Corporation requires adaptation, and players want another run. Do not optimize for content breadth before these are proven.

## Run length

- Standard run: up to 20 turns, with a target average of 15–20.
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

A standard deposit adds 20 track points. A large deposit costs 175% of the listed values, rounded up, and adds 32. Deposits are permanent and every track must reach 50 before activation.

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

- Early turns teach the resource-deposit conflict with recoverable consequences.
- Middle turns should make advisor leverage, Corporation adaptation, and BRB side effects collide.
- Late turns should make activation tempting before it is fully safe.
- BRB progress must raise pressure: Engineering increases contractor dependence; Access increases insider threats; Legitimacy challenges secrecy; Stability costs time and speed.

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

The prototype has 15 interactive Situation Cards and two connected chains. A seeded appearance roll succeeds 65% of the time. Track draw frequency by type and rarity, choice distribution, follow-ups, resource swings, echo category, route state, pivotal-decision category, and ending contributors.

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
| Average turns | 18.66 |
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
| Average turns | 18.97 |
| Compromised activations | 620 (6.20%) |
| Corporation captures | 3,455 (34.55%) |
| State collapses | 5,925 (59.25%) |
| Civic legacy endings | 0 |
| Situation Cards drawn | 120,325 |
| Common / Rare draws | 98,246 / 22,079 |
| Labor Coalition touched / opened / completed | 7,085 / 1,990 / 5,605 |
| Corporate Exposure touched / opened / completed | 8,087 / 1,034 / 868 |
| Advisor consultations | 45,554 |
| Advisor departures | 432 |

The replay layer is active: all four echo categories appeared, both routes were entered and completed, every run produced one pivotal decision, and two archetype-specific ending variations appeared. Corporate Exposure now completes in 868 runs (8.68%) after the simulator policy learned to value route openings, future cards, advisor consequences, and archetype liabilities—not only immediate resources. Phase 2 still needs to address Operator runs never reaching Government by Command, Civic Legacy remaining unreachable to bots, and pivotal selection overwhelmingly favoring card choices.

The complete machine-readable report is [BRB Replay Baseline](BRB_REPLAY_BASELINE.json).
