# BRB Replay Engine

## Purpose

The replay engine exists to make a player finish a run thinking: “I wonder what happens if…” It is the source of truth for Phase 1.5 and sits between the completed logic prototype and Phase 2 balance work.

The prototype does not try to expose the entire narrative graph. Every run builds a unique classified political history. Players should finish feeling they uncovered one version of the truth, not the entire game.

## Prototype contract

Phase 1.5 keeps the itch.io slice compact:

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

Common cards can be drawn twice and require four turns between draws. Rare cards can be drawn once. Follow-up cards begin outside the available deck and enter only through a prior echo. A card can also remove a future card, making a closed route mechanically real rather than descriptive text.

Corporation cards show a scheme or fallout the player can answer. They do not replace the automatic Corporation response after the player's major commitment.

## Seeded draw order

Each turn makes a seeded 65% appearance roll. An eligible card must:

1. Be present in the current deck.
2. Meet turn, resource, track, flag, and Corporation-strategy requirements.
3. Remain below its per-run draw limit.
4. Be outside its cooldown window.

The engine then performs a seeded weighted choice. An archetype multiplies the weight of its favored card type by 1.25. Identical seed and decisions therefore produce identical cards, history, and reports.

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

Meeting organizers opens the route and adds the march. Clearing or ignoring the protest closes it. The second card can complete or close the route and adds public-history evidence to the ending.

### Corporate Exposure

`audit_discrepancy → silent_partner`

Following the discrepancy opens the route and adds the ownership follow-up. Closing or ignoring the audit removes it. Resolving the silent partner records whether the Corporation was exposed, entangled with government, or allowed to ascend.

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
- One pivotal decision
- Echoes caused by that decision
- One completed route, if any
- One unseen-route hint
- One concrete next-run experiment

The score is additive:

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

Ties favor the earlier turn, then the earlier deterministic decision ID. The report is derived entirely from final `GameState`, so regenerating it is stable.

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
| `brb.active-run.v2` | Current deterministic `GameState` |
| `brb.archive.v0` | Knowledge archive |
| `brb.latest-report.v1` | Latest Declassified Report only |
| `brb.replay-intent.v1` | Seed, archetype, and suggested experiment |

Invalid or old values fail closed and return `null`; they do not get merged into a new run and cannot alter base stats. There are no accounts, cloud saves, analytics, or backend APIs.

## Architecture boundary

All decisions, weighted draws, echoes, routes, endings, reports, and archive merges remain pure TypeScript under `src/game`. React owns display, browser input, and local-storage orchestration. This makes the simulator use the same rules as the browser and keeps later packaging from changing game logic.

The Next.js App Router build uses static export. Hosting and itch.io publishing remain Phase 4 work.

## Simulator contract

Post-replay reports add:

- Card draws by type and rarity
- Echo counts by category
- Routes touched and deliberately opened
- Chains started and completed
- Routes closed
- Pivotal-decision categories
- Ending-contributor counts
- Archetype ending variations

The prior 10,000-run report remains labeled **pre-replay architecture**. The new 10,000-run report must be recorded separately before Phase 2 changes any balance values.

## Acceptance checklist

- Exactly 15 cards, three types, two rarities, and two chains
- Seeded weighted draws, requirements, cooldowns, limits, additions, and removals
- Identical choices reproduce history; one changed choice creates traceable divergence
- Every card outcome records immediate effects, an echo, and provenance
- Advisor memories, archetype abilities, liabilities, routes, and ending variations operate in the engine
- Every ending creates a stable pivotal decision, hint, and experiment
- Archive merging is idempotent, reveals only knowledge, and grants no power
- Browser tests cover card choices, immediate consequences, hidden echo details, silhouettes, report rendering, and both replay buttons
- TypeScript, unit/component tests, static build, and the 10,000-run simulator pass before Phase 2 tuning
