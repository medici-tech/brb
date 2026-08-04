# BRB Balance Targets

## Purpose

Balance toward the prototype’s four questions: deposits hurt, advisors create tension, the Corporation requires adaptation, and players want another run. Do not optimize for content breadth before these are proven.

## Current Phase 2 snapshot

Phase 2 balance validation is in progress. The implemented rules currently use:

- Standard and large deposits worth 25 and 40 track points
- A seeded 55% monthly Situation Card appearance check
- Open-ended monthly campaigns with no calendar loss condition
- Base Corporation responses every 5 months while Quiet, 4 while Watched, 3 while Contested, 2 while Severe, and monthly while Critical
- Corporation Threat modifies that schedule and move severity: 0–24 at 100%, 25–49 at 110%, 50–74 at 125% and one month faster, and 75–100 at 150% and two months faster
- Separate completion-pressure surcharges shown under Difficulty curve
- Stress at 80 or more drains Trust but remains nonterminal; Panic causes State Collapse at 100 and Institutions causes it at 0
- Approved commitments apply +4 Alignment and +1 Loyalty; disapproved commitments apply -2 Alignment and -2 Loyalty. Loyalty below the advisor's threshold causes departure; high Leverage no longer does
- Advisor takeover replaces high-Leverage departure: one advisor at Leverage 85 ends the run as Advisor Coup, two or more active advisors at Leverage 50 or above end it as Advisor Cabal, and an active advisor already at or above Leverage 50 gains 1 Leverage each month
- Ordinary forecast accuracy uses Competence, Alignment, centered Loyalty at 0.4 per point, Leverage, relationship memories capped at ±12, and a possible -10 false-plan modifier
- Situation choices declare mandatory costs separately from floor-clamped resource damage; unaffordable choices cannot resolve
- Accepted delay, replacement contractors, closed oversight, false plans, parallel contractors, Capacity drift, and emergency rule have deterministic downstream mechanics
- Clearance ladder: loss +1, Necessary Regime +2, Civic Legacy +3 (Clearance remains progress to next Directive unlock)
- Necessary Regime aftermath scar: next campaign starts with Panic +6 once; Civic Legacy clears any pending scar; losses neither set nor clear it

### Victory clarity and aftermath scar — 2026-08-04

Hypothesis: compromised activation felt empty because it paid the same Clearance as Civic Legacy and left only story pain. The accepted change splits Clearance (1 / 2 / 3) and adds one Archive aftermath scar (Panic +6 on the next start after Necessary Regime). Corporation cadence, deposits, recovery, cards, and activation rules are unchanged. Default bot matrices remain no-scar; human playtests gate whether the scar restores desire to chase Civic Legacy without making loss preferable to dirty win. Do not retune Corp intervals or deposits in the same experiment.

The accepted activation-reachability cadence originally produced 8.34% activations at seed `20260715` and 8.02% at alternate seed `20260716`, using 5,000 runs per block. A later correctness audit changed affordability ordering without changing that cadence; the current 3,000-run seed-`20260715` no-Directive checkpoint is 8.50% activation, 40.30% State Collapse, 51.20% Corporation capture, and a 22-month median. This remains inside the automated reachability target; human fun, loss fairness, and replay desire remain unverified.

These results establish reachability, not final balance approval. Activation remains an achievement, Civic Legacy remains rare, and results vary by strategy. The sections below preserve the experiment history in chronological order. Statements inside explicitly historical checkpoints describe what was true at that checkpoint, not the current project status.

### Logic trustworthiness remediation checkpoint — 2026-07-19

The accepted rules now enforce card affordability, independent seeded Corporation posture jitter, Loyalty- and memory-sensitive forecasts, and downstream doctrine effects. The fixed-seed `20260715` integrated 5,000-run checkpoint produced 70 activations (1.40%), including 6 Civic Legacy endings, 2,379 State Collapses (47.58%), 2,551 Corporate Captures (51.02%), and a 20-month median. This confirms reachability; it does not approve the low activation rate.

One-rule 3,000-run ablations used the same seed and the integrated build as the comparison point (44 activations, 1.47%, 20-month median):

| Disabled rule | Activations | Median | Interpretation |
| --- | ---: | ---: | --- |
| Loyalty contribution to forecasts | 50 (1.67%) | 20 | Largest observed shift; retain as accepted advisor consequence, not tuned balance |
| Relationship-memory forecast modifiers | 49 (1.63%) | 20 | Memories now matter mechanically; aggregate change remains modest |
| False-plan forecast penalty | 45 (1.50%) | 20 | Rare doctrine has little aggregate movement |
| Accepted-delay recovery penalty | 45 (1.50%) | 21 | Small outcome shift with a readable tempo consequence |
| Replacement-contractor Capacity surcharge | 44 (1.47%) | 20 | No activation movement at this sample size |
| Parallel-contractor Capacity bonus | 45 (1.50%) | 20 | Small aggregate movement |
| Capacity drift | 44 (1.47%) | 20 | No activation movement; capture/collapse mix shifted slightly |

Each ablation changed only the named rule. No compensating value was tuned. Card affordability and independent Corporation jitter remain correctness fixes rather than optional tuning variants; the integrated checkpoint records their accepted combined baseline.

### Activation reachability cadence — 2026-07-23

The accepted experiment changes only the base Corporation response intervals from `4/3/2/1/1` to `5/4/3/2/1` across Quiet, Watched, Contested, Severe, and Critical. Corporation Threat modifiers, direct completion-pressure surcharges, deposits, recovery, starting resources, cards, activation requirements, loss thresholds, and bot decisions are unchanged.

| Seed / 5,000 runs | Activation | All tracks ready | Collapse | Capture | Median | Longest |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `20260715` | 417 (8.34%) | 1,351 | 40.38% | 51.28% | 22 | 55 |
| `20260716` | 401 (8.02%) | 1,386 | 40.76% | 51.22% | 22 | 57 |

Every normal strategy activated in both blocks. Balanced and Legitimacy-first led the two samples rather than Rush, while Fixer and Command were the weakest. No campaign exceeded five years, so the cadence did not create indefinite recovery loops. The automated 8–12% evaluation target is accepted; do not tune another lever before the six-run human matrix tests whether the added reachability feels fair and replayable.

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

All resources are capped from 0 to 100. Recovering a resource restores 30 points (28 for Capacity), raises Stress by 7, advances the Corporation by 3, and consumes the turn's major commitment. Active echoes can change this openly: accepted delay adds 2 more Corporation Progress, while parallel contractors add 8 more Capacity to Capacity recovery.

### Deposit targets

| Track | Money | Influence | Intelligence | Trust | Capacity |
| --- | ---: | ---: | ---: | ---: | ---: |
| Engineering | 10 | 0 | 3 | 0 | 7 |
| Access | 0 | 9 | 7 | 0 | 3 |
| Legitimacy | 0 | 6 | 0 | 10 | 2 |
| Stability | 6 | 0 | 0 | 6 | 6 |

A standard deposit adds 25 track points. A large deposit costs 175% of the listed values, rounded up, and adds 40. Replacement contractors add 3 Capacity to either Engineering deposit size. Deposits are permanent, a track at 100 rejects further deposits, and every track must reach 50 before activation.

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

### Advisor takeover thresholds (seed `20260715`, 5,000 runs)

Over-reliance has two dedicated loss endings driven by `ADVISOR_TAKEOVER_RULES`. An **Advisor Coup** fires when one advisor reaches Leverage **85** — high Leverage alone, no dependence gate, and no graceful high-Leverage departure (only Loyalty-based resignation remains). An **Advisor Cabal** fires when two or more active advisors each hold Leverage **50** or above. A **reliance-creep** rule makes this organic: each month, an active advisor at or above Leverage 50 gains **+1** Leverage (`relianceCreepFloor` / `relianceCreepPerMonth`), and because a player can only `manage_advisor` one advisor per month, leaning on advisors drifts them toward takeover unless disciplined. Both endings outrank the all-advisors-gone State Collapse but yield to Corporation victory and Panic/Institutions collapse in the same month.

Natural-landing checkpoints:

- **12-strategy matrix (pre-profile):** 0 coups and 0 cabals in 5,000 runs, every other figure identical to the prior consult-to-counter baseline. Existing bots proactively manage advisors at Leverage 55–86 and never enter takeover territory.
- **14-strategy matrix (adds `advisor_dependent`), thresholds at 40/70:** 2 coups (0.04%), 0 cabals. The dependent profile reached Leverage 90 regularly, but the departure rule usually fired first because Institutions were still above 40 at that moment, and no single concentrating profile lifted two advisors to 70 at once.
- **Intermediate checkpoint — thresholds 55/60, coup bar still tied to departure at 90:** 10 coups (0.2%), 1 cabal (0.02%). The dependent profile reached Leverage 80–85 in every run but rarely the 90 coup/departure bar, so most caps never triggered a takeover.
- **Demonstrator checkpoint — 15-strategy matrix, coup bar 80 / Institutions gate 65, cabal 50:** 150 coups (3.0%), 334 cabals (6.68%), combined ~9.7% — but 92% of it came from the two demonstrator bots; normal play almost never took over because managed bots kept Leverage below the bars.
- **Organic checkpoint — dependence gate dropped, coup = Leverage 85 alone, Leverage-90 departure retired, monthly reliance creep (+1 at/above Leverage 50):** **424 coups (8.48%), 333 cabals (6.66%)** — a combined **15.14%**, on the ~15% target. Corporate Capture fell to 40.92% and activation held at 8.34%. The change that mattered was making takeover **organic**: with reliance compounding and only one advisor manageable per month, takeovers now reach normal profiles. Of 757 takeovers, **92 (12%) came from non-demonstrator bots** — chiefly `command` (88 coups). That figure was inflated by a bot artifact: `command`'s `leverageLimit` was 86, one point *above* the coup bar, so it only disciplined an advisor after seizure was already possible.
- **Current checkpoint — `command` `leverageLimit` lowered 86 → 80:** **383 coups (7.66%), 333 cabals (6.66%)** — a combined **14.32%**, still inside the 14–16% band. Corporate Capture 41.82%, activation 8.26%, collapse unchanged at 35.6%. Every managed profile now sits below `coupLeverageMinimum`, so no bot tolerates an advisor past the seizure point. `command` still coups **47** times (organic total 51): with creep lifting up to three advisors +1 per month and `manage_advisor` removing only 6 from one of them, reliance can genuinely outrun discipline. That residue is the intended signal — takeover survives correct play, rather than depending on a profile that deliberately waits too long.

`advisor_dependent` and `advisor_cabal` remain deliberate demonstrator profiles (like `civic_seeker` for Civic Legacy). The headline 14.32% is a matrix that intentionally seeds two over-reliant strategies, so it is not a human-play prediction — but a real share is organic, and the reliance-creep rule means players who lean on advisors and skip `manage_advisor` face the same drift. Human playtests remain the real measure.

Invariant to preserve: **every managed bot profile keeps its `leverageLimit` below `coupLeverageMinimum`**, so a takeover reflects reliance outpacing discipline rather than a bot choosing not to discipline. Tuning knobs: `coupLeverageMinimum` (85), `cabalMemberLeverageMinimum` (50), `relianceCreepFloor` (50), `relianceCreepPerMonth` (1). Raising the coup bar or lowering the creep reduces the rate; do not chase a higher number by making takeovers fire on lightly-managed normal play.

## Corporation pressure

The prototype uses four Corporation move types. The prepared posture is **hidden**; measure how often players consult to forecast it, the forecast follow-and-success rate, successful counterplay, and whether moves feel connected to player vulnerabilities. Because a counter-operation targets a *forecast* and blocks only on a correct guess, countering is a bet whose odds are the forecast accuracy.

Target behavior: the Corporation changes plans in ways a player can read *through the forecast* and adapt to. It should not feel like a random progress bar or unavoidable punishment, and the paid forecast must stay worth its cost.

The Threat clarity experiment gives Corporation Watch three distinct jobs: Progress measures proximity to defeat, Posture is the concealed incoming move family surfaced only by an advisor forecast (the panel shows the last observed move as a tell), and Threat communicates how frequently and severely the Corporation can respond. Threat does not multiply its own increase. Run fixed-seed comparisons before adjusting any unrelated balance value.

### Hidden-posture baseline (seed `20260715`, 5,000 runs)

Concealing the posture and making the counter a forecast-gated bet restores the forecast subsystem's purpose (the technocrat/analyst precise forecast is now a real advantage) without meaningfully handing the game to the Corporation. Two checkpoints matter:

- **First re-baseline — bot-fidelity artifact.** With bots that still consulted on a fixed schedule rather than in order to counter, the result was 507 activations (10.14%), 1,316 State Collapses (26.32%), 3,177 Corporate Captures (63.54%). The apparent capture spike was misleading: 11 of 12 strategies could only counter on a coincidental consult-turn, so they under-countered and the Corporation ran unchecked.
- **Corrected re-baseline — consult-to-counter bots (current checkpoint).** After making bots consult *in order to* counter (preferring the Analyst's more accurate forecast), the no-Directive checkpoint is **408 activations (8.16%: 37 Civic Legacy 0.74%, 371 Compromised 7.42%), 1,929 State Collapses (38.58%), 2,663 Corporate Captures (53.26%), 22-month median.** This is close to the prior visible-posture baseline (8.56% / 40.78% / 50.66%): capture is only ~2.6 points higher, activations ~0.4 lower, collapse ~2.2 lower.

Read together: the hidden-posture change is roughly outcome-neutral versus visible posture once counterplay is exercised competently; the residual +2.6-point capture is the honest cost of countering now being a forecast bet (accuracy < 100% means some counters miss) rather than a free, guaranteed hit. The 63.54% figure was measurement error, not a balance regression. Countering more also trades deposit tempo for Corporation suppression, which is why collapse rises a little relative to the artifact run. This supersedes earlier counter-related checkpoints; treat prior "successful counterplay" figures as measured under visible-posture rules.

- **Current checkpoint — 14-strategy matrix (adds `advisor_dependent` and `civic_seeker`):** 482 activations (9.64%: 68 Civic Legacy 1.36%, 414 Compromised 8.28%), 1,995 State Collapses (39.9%), 2,521 Corporate Captures (50.42%), 2 Advisor Coups, 0 Cabals, 22-month median. Per-strategy runs drop to ~357, so this matrix is not directly comparable to 12-strategy blocks. The standout is the civic seeker: 111 of its 357 runs activate (~31%), and in isolated 200-run probes the profile reaches **~7.5% Civic Legacy and ~24.5% Compromised** — evidence that the aspirational win bands (Civic 7–10%, Compromised 14–17%) are already *reachable by intent under current rules*; the aggregate sits lower only because most strategies do not play toward the civic conditions. Prefer interpreting win-band aspirations against civic-intent profiles (and eventually human playtests) rather than forcing the full-matrix aggregate up with rule easing.

## Situation Deck

The prototype has 15 interactive Situation Cards and two connected chains. A seeded appearance roll succeeds 55% of the time. Track draw frequency by type and rarity, choice distribution, follow-ups, resource swings, echo category, route state, pivotal-decision category, and ending contributors.

Target behavior: variation comes from requirements, weights, prior choices, cooldowns, and deck changes—not blind randomness. Common cards may appear twice after a four-turn cooldown; Rare cards appear once. Rarity measures narrative frequency rather than power.

## Roguelite progression

Prototype runs use seeded randomness, three archetypes, and Archive v1 Legacy Directives. Completed runs earn 1 Clearance, victories earn 3, and 3 Clearance creates a deterministic draft. An unlocked Directive is permanent, but only one may be equipped and used once per campaign.

The no-Directive run remains the balance baseline. Evaluate each Directive as the only changed lever in a 5,000-run fixed-seed comparison beginning with `20260715`; reject or retune any card that moves overall activation outside the 8–12% evaluation band or creates clear archetype dominance. Directive rarity controls reward frequency and specialization, not an approved power tier. Levels remain out of scope.

For the full game, continue evaluating horizontal unlocks such as archetypes, cards, scenarios, advisors, and mutators separately from baseline balance.

### Initial Legacy Directive fixed-seed checkpoint — 2026-07-23

The first isolated 5,000-run block used seed `20260715` and the same bot/archetype rotation for every comparison. Bots attach Common Directives to their first non-activation commitment. They hold Continuity Freeze Order until a Corporation response is actually due, because spending it earlier pays the drawback without exercising its stated benefit.

| Loadout | Activations | Rate | Decision |
| --- | ---: | ---: | --- |
| No Directive | 453 | 9.06% | Baseline |
| Emergency Appropriation (+12 Money, +4 Stress) | 569 | 11.38% | Retain for human playtest |
| Coalition Whip (+10 Influence, +5 Panic) | 606 | 12.12% | Rejected; above ceiling |
| Coalition Whip (+8 Influence, +5 Panic) | 586 | 11.72% | Accepted retune |
| Protected Channel (+10 Intelligence, +5 Threat) | 494 | 9.88% | Retain for human playtest |
| Public Confidence Reserve (+10 Trust, +4 Progress) | 450 | 9.00% | Retain for human playtest |
| Industrial Surge (+10 Capacity, −5 Institutions) | 604 | 12.08% | Rejected; above ceiling |
| Industrial Surge (+8 Capacity, −5 Institutions) | 590 | 11.80% | Accepted retune |
| Continuity Freeze Order, spent immediately | 389 | 7.78% | Invalid usage policy; benefit often did not fire |
| Continuity Freeze Order, held until response due | 489 | 9.78% | Accepted usage policy |

Every retained version stayed inside the 8–12% overall evaluation band under the initial bot policy. These comparisons predate both the sequential-affordability correction and Directive-aware bot candidate validation described below. The authored retunes remain in place, but their balance status is provisional until each current Directive receives a fresh isolated 5,000-run comparison against the corrected no-Directive baseline. The initial comparisons also do not prove human timing, perceived fairness, rarity value, or archetype parity.

### Rules and simulation-bot audit checkpoint — 2026-07-23

The rules audit found that a confirmed ignored Situation resolved before the selected commitment, but affordability had been checked against the pre-ignore resources. This could accept a commitment whose cost became unaffordable after the ignored penalty. The correction validates the exact resolution order: ignored or suppressed outcome, optional Legacy Directive, then commitment. No authored costs, effects, starting resources, card odds, deposit values, or Corporation rules changed.

The first 3,000-run no-Directive block used seed `20260715`. The subsequent bot audit found that bots selected from a no-Directive candidate list and only attached a resource Directive afterward, preventing them from considering commitments the card made affordable. Candidate validation now includes an intended equipped Directive while keeping activation available without spending it. A second no-Directive block with the same seed reproduced every reported value exactly, confirming that the bot correction is isolated from the baseline.

| Metric | Prior accepted seed block | Post-rules audit | Post-bot audit |
| --- | ---: | ---: | ---: |
| Activations | 266 (8.87%) | 255 (8.50%) | 255 (8.50%) |
| Civic Legacy | 26 | 25 | 25 |
| State Collapse | 1,211 (40.37%) | 1,209 (40.30%) | 1,209 (40.30%) |
| Corporate Capture | 1,523 (50.77%) | 1,536 (51.20%) | 1,536 (51.20%) |
| Average / median months | 22.67 / 22 | 22.87 / 22 | 22.87 / 22 |
| Cards presented / actively resolved per run | 12.51 / 8.58 | 12.61 / 8.85 | 12.61 / 8.85 |
| All tracks ready | 860 | 795 | 795 |

The sequential-affordability correction moves activation down 0.37 percentage points but remains inside the 8–12% evaluation band. It also increases active card resolution, which is consistent with bots no longer abandoning a file for a commitment they cannot afford after the ignored penalty. Treat the new 255-activation block as the current seed-`20260715` no-Directive checkpoint. Do not compensate with another balance lever before human playtests establish whether the change improves cost comprehension.

### Corrected Legacy Directive revalidation — 2026-07-23

The required fresh 5,000-run seed-`20260715` baseline uses sequential ignored-Situation
affordability and Directive-aware bot candidate validation. Emergency Appropriation is
the first completed isolated comparison:

| Loadout | Activations | Rate | State Collapse | Corporate Capture | Median months | Cards presented / resolved | All tracks ready |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| No Directive | 428 | 8.56% | 2,039 (40.78%) | 2,533 (50.66%) | 22 | 12.52 / 8.77 | 1,368 |
| Emergency Appropriation | 524 | 10.48% | 1,971 (39.42%) | 2,505 (50.10%) | 22 | 12.45 / 8.74 | 1,531 |

Emergency Appropriation remains inside the 8–12% automated evaluation band. The other
five corrected Directive blocks are still required before any cross-Directive decision.
The environment stopped the batch after these two blocks when its command-approval
service reached its usage limit; this is an incomplete evidence checkpoint, not approval
of the remaining cards. Each 417/416-run strategy slice is diagnostic only and does not
prove archetype or strategy dominance. If parity becomes the next decision, use multiple
documented seed blocks.

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

This historical baseline was generated separately before any Phase 2 value changes. It adds Situation Deck, echo, route, pivotal-decision, ending-contributor, and archetype-variation fields. Results below describe the replay architecture as implemented; they do not approve its balance. The current `simulate:baseline` script is capped at 5,000 runs for routine checks.

Verified with an explicitly authorized 10,000-run simulation using seed `20260715`:

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

At this checkpoint, full Vitest, TypeScript, and Next build processes had stalled in the workspace. That tooling issue was then resolved: the suite at this historical checkpoint contained 55 passing tests, TypeScript validation passed, and the static Next.js production build completed. Current gate status belongs in [BRB Current-State Audit](BRB_CURRENT_AUDIT.md).

## Isolated Corporation cadence experiment

> **Superseded historical checkpoint:** This schedule was later replaced by the accepted `5/4/3/2/1` activation-reachability cadence.

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

## Normal-strategy sample-size convergence audit

> **Diagnostic only:** This audit changes no balance lever. It asks how many normal-strategy simulator runs are useful for routine comparisons under the current rules.

The simulator was run at 1,000, 3,000, and 5,000 campaigns with seed `20260715`. Because the engine is deterministic and each larger run contains the earlier fixed-seed sequence, these are nested convergence checkpoints rather than three independent experiments. The comparison can show when the reported rates settle down; it cannot measure seed-to-seed sensitivity or substitute for human playtesting.

| Metric | 1,000 runs | 3,000 runs | 5,000 runs | 1k → 3k change | 3k → 5k change |
| --- | ---: | ---: | ---: | ---: | ---: |
| Activations | 18 (1.80%) | 41 (1.37%) | 74 (1.48%) | -0.43 pp | +0.11 pp |
| Civic Legacy | 2 (0.20%) | 4 (0.13%) | 6 (0.12%) | -0.07 pp | -0.01 pp |
| State collapse | 468 (46.80%) | 1,402 (46.73%) | 2,338 (46.76%) | -0.07 pp | +0.03 pp |
| Corporation capture | 514 (51.40%) | 1,557 (51.90%) | 2,588 (51.76%) | +0.50 pp | -0.14 pp |
| Premium endings | 10 (1.00%) | 24 (0.80%) | 43 (0.86%) | -0.20 pp | +0.06 pp |
| Average months | 21.48 | 21.64 | 21.61 | +0.16 | -0.03 |
| Median months | 21 | 21 | 21 | 0 | 0 |
| Cards presented / resolved | 11.83 / 8.78 | 11.91 / 8.84 | 11.86 / 8.80 | +0.08 / +0.06 | -0.05 / -0.04 |

The high-frequency outcomes have effectively converged by 3,000 runs for routine design decisions. From 3,000 to 5,000, collapse moved only 0.03 percentage points, capture 0.14 points, average duration 0.03 months, and card tempo at most 0.05 cards per run. Their 5,000-run 95% Wilson intervals are 45.38–48.14% for collapse and 50.37–53.14% for capture; a 5,000-run sample still has about a ±1.38-point uncertainty margin for a result near 50%, even though the observed fixed-seed checkpoints moved much less.

Rare outcomes have not reached the same precision. Activation's 95% Wilson interval narrows from 1.14–2.83% at 1,000 runs, to 1.01–1.85% at 3,000, and 1.18–1.85% at 5,000. The intervals overlap substantially, so the apparent 1.80% → 1.37% → 1.48% movement is sampling noise rather than evidence of a changed result. Civic Legacy is rarer still: only six examples appear in 5,000 runs, which is enough to establish reachability but not enough to estimate its rate or strategy distribution confidently.

Campaign shape also settles by 3,000 runs: the median remains 21 months at every checkpoint, while P75/P90/P95 move from 23/26/28 at 1,000 to 24/27/29 at 3,000 and remain there at 5,000. The observed maximum rises from 40 to 59 months by 3,000 and then stays at 59, and no normal-strategy run exceeds five years. This reinforces the existing finding that long campaigns are reachable only through the separate diagnostic strategy, not present in the normal bot rotation.

The practical cutoff is therefore **3,000 runs for routine comparisons of common outcomes, duration, and card tempo**. Moving to 5,000 makes the uncertainty bounds narrower but does not materially change this report's central numbers. Use 5,000 when the decision depends on sub-percentage-point movement or when activation is important. Even 5,000 is too small for strong claims about Civic Legacy or individual bot performance: each normal bot receives only about 416 campaigns, and Civic Legacy has only six total observations. A different base seed or multiple seed blocks would be the appropriate next check for robustness; simply extending this same deterministic prefix has diminishing value.

## Stress collapse threshold — rejected

> **Rejected experiment:** This tested State Collapse at Stress 100 after human-playtest feedback. No compensating Stress gain, relief, resource, card, or bot value changed.

The comparison uses the immediately preceding fixed-seed 3,000-run convergence checkpoint as its baseline. Both use seed `20260715` and the normal strategy rotation.

| Metric | Before terminal Stress | Stress 100 ends campaign |
| --- | ---: | ---: |
| Activations | 41 (1.37%) | 2 (0.07%) |
| Civic Legacy | 4 (0.13%) | 1 (0.03%) |
| State Collapse | 1,402 (46.73%) | 2,992 (99.73%) |
| Corporation capture | 1,557 (51.90%) | 6 (0.20%) |
| Average / median months | 21.64 / 21 | 14.30 / 14 |
| Longest campaign | 59 months | 26 months |
| Cards presented / resolved per run | 11.91 / 8.84 | 7.90 / 6.00 |

The experiment made Stress legible as a true loss meter, but the existing economy drove nearly every automated strategy into that loss before meaningful BRB completion. The maintainer clarified that the intended current rule is unchanged: Stress drains Trust at 80 or more but is not itself terminal. The 99.73% collapse result is retained as evidence for rejecting the experiment; no compensating balance value was changed.

## Loyalty-based advisor departure — accepted for human validation

> **Accepted isolated rule experiment:** This makes the existing Loyalty meter determine advisor departure without changing any starting value, threshold, action cost, card weight, pressure value, or Corporation value.

Approved commitments still add 4 Alignment and 1 Loyalty. The experiment adds a 2-point Loyalty loss to disapproved commitments, moves the existing advisor thresholds from Alignment to Loyalty, and leaves Leverage departure at 90. Alignment remains the input to consultation quality. Manage Advisor remains a direct +10 Loyalty and -6 Leverage effect before the normal advisor reaction.

The current implementation and an otherwise identical temporary control snapshot both ran 3,000 normal-strategy campaigns with seed `20260715`. The control retained the prior Alignment departure and did not remove Loyalty on disapproval.

| Metric | Prior Alignment control | Loyalty departure |
| --- | ---: | ---: |
| Activations | 46 (1.53%) | 44 (1.47%) |
| Civic Legacy | 3 (0.10%) | 3 (0.10%) |
| State collapse | 1,421 (47.37%) | 1,425 (47.50%) |
| Corporation capture | 1,533 (51.10%) | 1,531 (51.03%) |
| Average / median months | 21.07 / 20 | 21.03 / 20 |
| Longest campaign | 56 months | 56 months |
| Cards presented / resolved per run | 11.59 / 7.99 | 11.59 / 7.98 |

The automated distribution changes negligibly: State Collapse rises by 0.13 percentage points and activation falls by 0.06 points. This is acceptable evidence that the Loyalty rule does not mathematically destabilize the current bots, but it does not prove that players understand or value Loyalty. Keep the model for the next human playtest and evaluate whether disapproval feels attributable and whether Manage Advisor becomes a meaningful sacrifice. No compensating balance value was changed.

## Fixer consultation policy diagnostic — accepted

> **Accepted bot-policy correction:** This changes only when the Fixer simulation strategy consults. No advisor effect, action cost, threshold, card, pressure, or Corporation value changed.

The previous Fixer strategy consulted every second month. On the Operator archetype, those consultations created twice the normal Leverage while the strategy also raised Leverage through Access deposits. It then spent repeated major commitments managing the Fixer, creating a simulator artifact rather than evidence that the player-facing Fixer needed a buff.

The corrected strategy consults when containment will suppress a Situation Card it is about to ignore, or when an affordable counter-operation needs a forecast at 70 or more Corporation Progress and Fixer Leverage is no higher than 45.

| Metric | Routine consultation | Immediate-value consultation |
| --- | ---: | ---: |
| Isolated Operator/Fixer activation | 78 / 3,000 (2.60%) | 351 / 3,000 (11.70%) |
| Isolated Corporate Capture | 90.53% | 81.40% |
| Fixer consultations per isolated run | 6.65 | 1.05 |
| Advisor-management commitments per isolated run | 2.70 | 0.14 |
| Mixed-strategy Fixer activations | 4 / 250 | 21 / 250 |
| Overall mixed-strategy activation | 249 / 3,000 (8.30%) | 266 / 3,000 (8.87%) |

The isolated and mixed fixed-seed results both support accepting the policy correction. Fixer no longer appears uniquely nonviable, while the overall activation rate remains inside the 8–12% evaluation band. This corrects automated strategy evidence only; it does not establish player balance or replace human validation.

### Five-seed robustness confirmation

Five distinct 3,000-run blocks used seeds `20260715` through `20260719`. Across 15,000 campaigns, activation was 1,423 (9.49%), State Collapse was 6,075 (40.50%), and Corporate Capture was 7,502 (50.01%). Every block kept activation inside the 8–12% evaluation band, the median at 22 months, and both loss modes credible.

Fixer activated in 155 of 1,250 runs (12.40%), compared with Balanced at 159 (12.72%) and Legitimacy-first at 201 (16.08%). Its individual 250-run blocks ranged from 21 to 41 activations, but the combined result confirms that the corrected policy is viable without owning the distribution. No gameplay or bot value changed during the five-seed audit.
