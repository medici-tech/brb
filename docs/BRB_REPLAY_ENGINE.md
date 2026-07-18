# BRB Replay Engine

## Purpose

The replay engine exists to make a player finish a run thinking: “I wonder what happens if…” It is the completed Phase 1.5 replay layer and remains the design source for replay behavior during Phase 2 balance work.

The prototype does not try to expose the entire narrative graph. Every run builds a unique classified political history. Players should finish feeling they uncovered one version of the truth, not the entire game.

## Prototype contract

The completed Phase 1.5 slice keeps the itch.io prototype compact:

- 15 Situation Cards: 6 Crisis, 4 Advisor, and 5 Corporation
- 10 Common and 5 Rare cards; rarity means story frequency, not strength
- Two routes: Labor Coalition and Corporate Exposure
- Knowledge-only persistence
- Start, Campaign, Declassified Report, and Archive v0 views
- No power unlocks, route map, large codex, or report library

Opportunity, Personal, BRB, Legacy, Legendary, and Black File cards remain future hooks, not prototype content.

## Situation Card schema

`SituationCard` replaces the old `GameEvent` model. Every card defines:

- Type and rarity
- Requirements and weighted draw value
- Cooldown and maximum draws per run
- Follow-up card IDs
- Player choices and ignored outcome
- Immediate effects
- At least one delayed echo

Common cards can be drawn twice and require four months between draws. Rare cards can be drawn once. Follow-up cards begin outside the available deck and enter only through a prior echo. A card can also remove a future card, making a closed route mechanically real rather than descriptive text.

Corporation cards show a scheme or fallout the player can answer. They do not replace the automatic Corporation response after the player's major commitment.

The automatic response uses a deterministic completion-tier cadence: every 4 months while Quiet, every 3 while Watched, every 2 while Contested, and monthly while Severe or Critical. The saved `lastResponseMonth` clock carries across tier changes and save/load boundaries. The separate completion-pressure surcharges remain unchanged.

## Seeded draw order

Each month makes a seeded 55% appearance roll. An eligible card must:

1. Be present in the current deck.
2. Meet turn, resource, track, flag, and Corporation-strategy requirements.
3. Remain below its per-run draw limit.
4. Be outside its cooldown window.

The engine then performs a seeded weighted choice. An archetype multiplies the weight of its favored card type by 1.25. Identical seed and decisions therefore produce identical cards, history, and reports.

An active card must be resolved or explicitly abandoned. Choosing a non-card commitment first opens a confirmation; accepting applies the card's ignored or suppressed outcome and then performs the selected commitment in the same turn. Activation instead preserves the card's existing `expired` classification. Bots use deterministic presentation-count policies, and always resolve follow-up cards, so their card tempo remains reproducible without turn-number intervals.

## Echoes and provenance

Every choice, including ignoring a card, has an immediate effect and one or more echoes:

| Echo | Run effect |
| --- | --- |
| `card` | Add or remove a future Situation Card |
| `relationship` | Create an advisor memory or leverage-relevant history |
| `system` | Change a rule for the rest of the run |
| `ending` | Add evidence used to interpret the ending |

Each major commitment receives a deterministic decision ID. Card additions remember that ID. If a later card entered through that decision, its encounter and downstream history link back to the source decision. Corporation responses also link to the major commitment they answered. This provenance lets a changed replay diverge visibly at one choice rather than becoming unexplained randomness.

## Prototype routes

Thresholds decide whether a card can activate. Route history, advisor memories, emergency-rule flags, and ending contributors decide its narrative variation.

### Labor Coalition

`protest_spark → national_march`

Meeting organizers opens the route and adds the march. Clearing or ignoring the protest closes it. Addressing the later march may explicitly reconcile a closed coalition: the history records `closed → reopened → completed`, with the closing and reopening decisions preserved. Completion can never silently overwrite closure.

### Corporate Exposure

`audit_discrepancy → silent_partner`

Following the discrepancy opens the route and adds the ownership follow-up. Closing or ignoring the audit removes it. Resolving the silent partner records whether the Corporation was exposed, entangled with government, or allowed to ascend.

### Route integrity and provenance

Route status is explicit: `unseen`, `touched`, `open`, `closed`, `reopened`, or `completed`. Every transition records its prior and next state, effect, decision ID, turn, step, and reason. The legal paths are:

```text
unseen → touched
touched → open | closed
open → completed | closed
closed → reopened
reopened → completed | closed
```

Illegal transitions throw during resolution. A completed route is classified as normal, reconciled, or invalid; invalid completions are excluded from endings, reports, and Archive completion history.

## Archetype replay differences

### Technocrat

- Consulting the Analyst always gives the exact Corporation forecast.
- Corporation cards receive increased draw weight.
- Opaque card choices cost 3 additional Trust.
- A successful but opaque or low-Trust run may become **Perfect Machine, Empty State**.

### Populist

- Once per run, a Steward consultation can convert 6 Trust into 9 Influence.
- Crisis cards receive increased draw weight.
- A public-betrayal choice adds 5 Panic.
- Completing Labor Coalition may produce **The Crowd Presses the Button**.

### Operator

- Once per run, a Fixer consultation can suppress the next ignored-card penalty while granting 8 additional leverage.
- Advisor cards receive increased draw weight.
- Consultation retains accelerated leverage gain.
- Emergency rule or decisive Fixer leverage may produce **Government by Command**.

## Pivotal-decision report

Every ending produces one deterministic `DeclassifiedReport` with:

- Ending and optional archetype variation
- One narrative pivot
- One strategic pivot
- One final turning point from the last five months
- Echoes caused by that decision
- One completed route, if any
- One unseen-route hint
- One concrete next-run experiment

The narrative score is additive:

| Evidence | Score |
| --- | ---: |
| Route opened or closed | +40 |
| Chain advanced or completed | +30 |
| Card added or removed | +20 each |
| Ending contributor | +20 |
| Persistent system echo | +15 |
| Advisor memory | +10 |
| Later linked consequence | +5 each |
| Immediate state change | Up to +15 |

The strategic score caps immediate and persistent impact at 20 each; scores route changes at 20, ending contributors at 15, and deck changes at 10; caps Corporation impact at 20; adds at most 12 for irreversibility; and scores advisor memories at 8 and system modifiers at 15. Deposit cost and progress are therefore represented without being counted repeatedly. The final-turn score uses the same evidence but only considers the final five months. Narrative and strategic ties favor the earlier month; final-turn ties favor the later month. The report is derived entirely from final `GameState`, so regenerating it is stable.

Hint selection first chooses a route closed by the pivotal choice, then an incomplete route. When neither route was touched, it shows a classified silhouette without exposing requirements. The suggested experiment converts the hint into a direct, non-mechanical objective.

## Replay actions

- **Test This Theory:** same archetype and seed, new run ID, suggested experiment carried as an objective.
- **Open a New File:** same archetype, different seed, new run ID, same suggested experiment.

The objective has no effect on starting resources, draw weights, or valid actions.

## Archive v0

Archive v0 stores only discovered knowledge:

- Aggregate card encounters
- Choices witnessed and outcomes seen
- Ending counts
- Partial or completed progress for the two routes
- Processed run IDs for idempotent merging

Only the latest Declassified Report is stored. Undiscovered cards, endings, and routes render as classified silhouettes. Merging the same run ID twice does nothing. The Archive never changes game creation or starting power.

## Browser persistence

The browser adapter uses versioned local-storage keys:

| Key | Content |
| --- | --- |
| `brb.active-run.v3` | Current deterministic `GameState` |
| `brb.archive.v0` | Knowledge archive |
| `brb.latest-report.v2` | Latest Declassified Report only |
| `brb.replay-intent.v1` | Seed, archetype, and suggested experiment |

Invalid or old values fail closed and return `null`; they do not get merged into a new run and cannot alter base stats. There are no accounts, cloud saves, analytics, or backend APIs.

## Architecture boundary

All decisions, weighted draws, echoes, routes, endings, reports, and archive merges remain pure TypeScript under `src/game`. React owns display, browser input, and local-storage orchestration. This makes the simulator use the same rules as the browser and keeps later packaging from changing game logic.

The Next.js App Router build uses static export. Hosting and itch.io publishing remain Phase 4 work.

## Simulator contract

Post-replay reports add:

- Card draws by type and rarity
- Cards presented, resolved, ignored, expired, auto-resolved, and suppressed
- Choice selections per card
- Echo counts by category
- Routes touched, opened, reopened, unfinished, and permanently closed
- Normal, reconciled, and invalid completions
- Narrative, strategic, and final-turn pivot categories
- Ordered ending funnels with entered, passed, and dropped counts
- A deterministic closest-attempt trace for the institutional bot's Civic Legacy candidate
- Results by basic, political, command, Fixer, institutional, and deposit-specialist bots
- Ending-contributor counts
- Archetype ending variations
- Campaign-length percentiles, five/ten-year counts, and ending buckets by duration
- Outcomes by bot strategy and activation failure reason
- Months, Corporation responses, Corporation/Panic gain, and net gain per month by pressure tier
- Panic gains and reductions attributed to actions/cards, Corporation responses, base pressure, or completion pressure
- A deterministic longest-campaign trace with its seed, strategy, ending, final pressure state, and every monthly decision

The `long_horizon` bot is diagnostic-only and is not part of the default simulation rotation. It exists to test whether deliberate survival and slow deposits can cross five- and ten-year thresholds without changing game rules or contaminating the normal outcome distribution.

The pre-replay and post-replay 10,000-run baselines remain preserved as historical checkpoints. Phase 2 cadence and long-horizon results are recorded separately in [BRB Balance Targets](BRB_BALANCE_TARGETS.md), so their rule changes and strategy-only diagnostics remain attributable.

## Phase 1.5 acceptance record

All replay-layer acceptance checks pass:

- Exactly 15 cards, three types, two rarities, and two chains
- Seeded weighted draws, requirements, cooldowns, limits, additions, and removals
- Identical choices reproduce history; one changed choice creates traceable divergence
- Every card outcome records immediate effects, an echo, and provenance
- Closed routes cannot complete without an explicit reopen; invalid completions remain zero
- Presented cards receive an explicit final classification
- Important card choices are exercised by at least one strategy
- Advisor memories, archetype abilities, liabilities, routes, and ending variations operate in the engine
- Every ending creates a stable pivotal decision, hint, and experiment
- Archive merging is idempotent, reveals only knowledge, and grants no power
- Browser tests cover card choices, immediate consequences, hidden echo details, silhouettes, report rendering, and both replay buttons
- TypeScript, unit/component tests, the static build, and the 10,000-run simulator passed before Phase 2 tuning

The corrected architecture report passes provenance and coverage checks, and the full test, TypeScript, and static-build gates pass. Phase 1.5 is complete. Its historical zero-Civic-Legacy and 36.1% card-resolution findings became Phase 2 inputs; the accepted cadence now reaches Civic Legacy in 0.62% of normal automated runs and actively resolves about 73.7% of presented cards. Those values still require balance and human-playtest validation.
