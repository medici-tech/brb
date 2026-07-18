# BRB Balance Targets

## Purpose

Balance toward the prototype’s four questions: deposits hurt, advisors create tension, the Corporation requires adaptation, and players want another run. Do not optimize for content breadth before these are proven.

## Current Phase 2 snapshot

Phase 2 balance validation is in progress. The implemented rules currently use:

- Standard and large deposits worth 25 and 40 track points
- A seeded 55% monthly Situation Card appearance check
- Open-ended monthly campaigns with no calendar loss condition
- Base Corporation responses every 4 months while Quiet, 3 while Watched, 2 while Contested, and monthly while Severe or Critical
- Corporation Threat modifies that schedule and move severity: 0–24 at 100%, 25–49 at 110%, 50–74 at 125% and one month faster, and 75–100 at 150% and two months faster
- Separate completion-pressure surcharges shown under Difficulty curve

The latest accepted 10,000-run cadence experiment produced 8.43% activations, 0.62% Civic Legacy endings, 45.97% state collapse, 45.60% Corporation capture, and a 24-month median. It presented 13.37 cards and actively resolved 9.85 per run, or about 73.7%. A separate 300-run long-horizon diagnostic proved that deliberate play can cross five and ten years without a hidden calendar limit.

These results establish reachability, not final balance approval. Activation remains uncommon, Civic Legacy remains rare, and results vary sharply by strategy. The sections below preserve the experiment history in chronological order. Statements inside explicitly historical checkpoints describe what was true at that checkpoint, not the current project status.

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

The Threat clarity experiment gives Corporation Watch three distinct jobs: Progress measures proximity to defeat, Posture communicates the incoming move family, and Threat communicates how frequently and severely the Corporation can respond. Threat does not multiply its own increase. Run fixed-seed comparisons before adjusting any unrelated balance value.

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

> **Historical checkpoint:** This predates the Situation Deck and replay architecture. Keep it for comparison only.

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

> **Historical checkpoint:** This records the replay architecture before the accepted Phase 2 cadence change. Its zero Civic Legacy result and card-resolution rate are not current findings.

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

At this checkpoint, Civic Legacy remained absent, only 36.1% of presented cards were actively resolved, and the terminal-loss rate was 98.37%. Those credible findings triggered the later Phase 2 balance experiments recorded below; they no longer describe the accepted cadence.

The complete machine-readable report is [BRB Replay Baseline](BRB_REPLAY_BASELINE.json).

## Controlled balance pass — 1,000-seed audit

> **Historical checkpoint:** This controlled deposit comparison predates the accepted Corporation cadence. Its proposed 30/48 deposit experiment was not adopted.

All rows below use 1,000 runs and seed `20260715`. The historical replay baseline above remains unchanged. The clean deposit comparison holds the calibrated card policy constant, so the effect of the 25/40 progress experiment is visible by itself.

| Checkpoint | Activation | Collapse | Capture | Premium | Cards presented | Cards resolved | All tracks ready |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Pre-pass source-of-truth baseline | 1.5% | 68.0% | 30.5% | 1.2% | 11.78 | 4.22 | 63 |
| 55% appearance, previous interval policy, 25/40 deposits | 6.2% | 65.4% | 28.4% | 3.0% | 10.16 | 3.62 | 241 |
| Calibrated card policy, old 20/32 deposits | 0.4% | 78.4% | 21.2% | 0.3% | 10.65 | 7.90 | 18 |
| Final: calibrated card policy, 25/40 deposits | 0.5% | 77.4% | 22.1% | 0.3% | 10.65 | 7.91 | 42 |

The final tempo is close to the 8–10 presentation target and inside the 6–8 active-resolution target. Bot samples resolve about 81% for public/institutional strategies, 73% for general strategies, and 65% for rush/command strategies; follow-up cards are always resolved. Confirmed abandonment accounts for most of the remaining unresolved cards; activation still records an unresolved active card as expired. Strategic pivots are now 50.3% deposits and 49.7% card decisions, replacing the previous 100% deposit result.

The staged Civic Legacy funnel is monotonic: 1,000 runs entered, 42 reached all-track readiness, 5 attempted activation, and 1 cleared Legitimacy 75 before failing Stability 75. No Civic Legacy completed. The closest institutionalist run was simulation index 388, seed `1803620704`: it met 8 of 9 Civic observations with tracks 50/65/85/80, Corporation 71, Institutions 72, completed Labor Coalition, and highest leverage 24, but Panic reached 100.

The deposit experiment helped all-track readiness by 24 runs, reduced collapse by 1.0 percentage point, and increased activation by 0.1 point, but it did not reach the target bands. At this checkpoint, the proposed next comparison was standard 30 and large 48. That recommendation was superseded: deposits remain 25/40, and the next accepted isolated change adjusted Corporation response cadence instead.

## Open-ended monthly model — follow-up audit

> **Historical checkpoint:** The open-ended model remains current, but these outcome numbers and the workspace-gate note predate the accepted Corporation cadence and current verification.

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

At this checkpoint, full Vitest, TypeScript, and Next build processes stalled in the workspace. That tooling issue is resolved: the current full suite contains 55 passing tests, TypeScript validation passes, and the static Next.js production build completes.

## Isolated Corporation cadence experiment

> **Accepted Phase 2 checkpoint:** This is the current base Corporation response schedule and the latest normal-strategy 10,000-run comparison.

This experiment changes only the base Corporation response schedule. Quiet responds every 4 months, Watched every 3, Contested every 2, and Severe/Critical every month. The clock records the last response month in the saved game, so loading a run cannot reset or reroll the schedule. Deposit rules, card rules, Panic values, completion-pressure surcharges, activation requirements, and bot decisions are unchanged.

The comparison uses the open-ended 1,000-run result above as the pre-change baseline and a fixed 10,000-run experiment with seed `20260715`. A paired post-change 1,000-run check with the same seed produced 8.6% activations, 46.2% collapse, 45.2% capture, and a 24-month median, consistent with the larger sample.

| Metric | Pre-change 1,000 | Cadence experiment 10,000 |
| --- | ---: | ---: |
| Activations | 0.6% | 8.43% |
| Civic Legacy | 0% | 0.62% |
| State collapse | 54.1% | 45.97% |
| Corporation capture | 45.3% | 45.60% |
| Premium endings | 0.4% | 5.27% |
| Average months | 20.65 | 24.39 |
| P25 / median / P75 | 18 / 20 / 23 | 21 / 24 / 27 |
| P90 / P95 / maximum | 26 / 28 / 45 | 30 / 33 / 58 |
| Campaigns over 5 / 10 years | 0 / 0 | 0 / 0 |

The experiment creates meaningful early-game breathing room relative to the prior rules: the median gains four months, activations are about fourteen times as frequent, and collapse falls 8.13 percentage points. It does not create genuinely long campaigns; none of 10,000 runs exceeded five years, and 70.42% of runs still ended before all tracks became ready.

Late-game acceleration remains strong. Severe responses occurred in all 66,027 Severe months. Critical responses occurred in 83,017 of 83,860 months; the 843 exceptions are terminal activation months, when the ending resolves before a Corporation response. Gross Corporation/Panic gain per month climbs through the tiers as 0.73/0.38 Quiet, 2.52/0.93 Watched, 3.62/1.74 Contested, 5.21/3.70 Severe, and 5.11/5.24 Critical. Corporation net gain is slightly lower in Critical than Severe because near-terminal meter caps and player reductions suppress the net figure even though responses remain monthly.

Panic attribution across all experiment months was 74,151 net from actions/cards, 417,112 from Corporation responses, 214,140 from unchanged base pressure, and 42,954 from unchanged completion pressure. Campaign time was 12.22% Quiet, 14.30% Watched, 12.03% Contested, 27.07% Severe, and 34.38% Critical.

The ending split also remains strategy-dependent. Institutionalists produced 53 of 62 Civic Legacy endings but collapsed in 736 of 833 runs. Fixer, Command, and Access-first strategies were captured in 745/834, 713/833, and 757/833 runs respectively; Coalition and Legitimacy-first strategies collapsed in 712/833 and 645/833. Of the 10,000 campaigns, 5,701 ended in year two and 4,297 in years three through five; the latter group ended in 2,820 collapses, 1,343 captures, 133 compromised activations, and one Civic Legacy.

This cadence is therefore a successful isolated breathing-room experiment, but not a complete duration or activation solution. The next experiment should remain a single lever; no additional value is changed here. The longer runs also raised observed card tempo to 13.37 presentations and 9.85 active resolutions per run even though card code was untouched, which should be treated as an indirect pacing consequence rather than silently compensated inside this experiment.

### Long-campaign design note

Campaigns longer than five years should be obtainable through deliberate play, but uncommon. Ten-year campaigns may occur as exceptional outcomes. A useful provisional target is 1–5% of competent runs exceeding five years, with only a very small share exceeding ten years; most runs should still resolve within two to five years.

The cadence experiment produced no campaigns longer than five years and a maximum of 58 months. This does not prove that the open-ended engine has a calendar limit—it has none—but it indicates a likely mechanical survival cliff. The current content scope may make a long campaign repetitive, yet adding cards or routes alone will not establish survivability and could add more penalties.

Before changing another balance value, add a diagnostic long-horizon strategy that prioritizes survival, pressure management, and controlled BRB progress. Use it to distinguish two possibilities:

1. Deliberate play can exceed five years, but the current general-purpose bots do not attempt it.
2. Even deliberate play cannot offset Severe/Critical pressure, so long campaigns are effectively unreachable.

If the second result holds, test one defensive-economy lever in isolation. Prefer strengthening a costly, month-consuming way to reduce Panic over weakening Severe/Critical acceleration. This would let a player buy time through an explicit political sacrifice while keeping near-completion danger intact.

### Long-horizon reachability audit

> **Current diagnostic:** This changes bot strategy only, not game rules, and establishes mechanical reachability rather than a target outcome distribution.

The diagnostic long-horizon strategy is excluded from normal simulation rotation. It resolves active cards, counters Corporation progress early, protects institutions and reduces Panic, restores the resources needed for those defenses, and attempts one standard deposit roughly every 12 months. It does not activate before Month 97. These are strategy choices only; no deposits, cards, pressure values, endings, or player actions changed.

A 300-run diagnostic used seed `20260715` and the Technocrat archetype:

| Metric | Result |
| --- | ---: |
| Average campaign | 103.72 months |
| P25 / median / P75 | 97 / 98 / 100 months |
| P90 / P95 / maximum | 129 / 138 / 162 months |
| Over five years | 300 (100%) |
| Over ten years | 42 (14%) |
| Compromised activations | 220 (73.33%) |
| Corporation captures | 28 (9.33%) |
| State collapses | 52 (17.33%) |

The longest campaign was seed `2295661248`, simulation index 228. It survived 162 months and collapsed at Panic 100 with Corporation progress 62, Institutions 100, and tracks 50/50/25/25. Its complete monthly trace is retained in the simulator report.

This proves that five- and ten-year campaigns are mechanically reachable under the current rules. The zero long campaigns in the normal 10,000-run audit are a strategy-distribution result, not a hidden calendar limit or an absolute survival wall. Therefore the conditional defensive-economy experiment is not warranted yet, and no balance lever was changed. Human playtesting should determine whether normal players discover and enjoy this slower defensive style before it is promoted into the standard bot mix.

Card verification now measures the unchanged monthly presentation rate and active-resolution share instead of absolute cards per run. Absolute counts naturally rise in longer campaigns even when the 55% appearance rule is unchanged.
