# BRB Jargon Reference and FAQ

## Purpose

This is the canonical plain-language reference for BRB gameplay terms. It is written for players, developers, and coding agents.

Use this document to answer:

- What does a term mean?
- Which code ID represents it?
- Which similarly named systems are different?
- Which rule should Codex preserve when changing the game?

The implemented TypeScript engine remains the final authority. If this document and the code disagree, follow the code and update this document.

## Scope and naming rules

- **BRB** is the dangerous national project the player is building. The abbreviation is intentionally not expanded in the current prototype.
- Capitalized words such as **Panic**, **Access**, and **The Fixer** name specific game systems or characters.
- Backticked words such as `corporation.progress` are code-facing state fields or IDs.
- A **file** is usually thematic UI language for a run, card, or saved record. Use the more precise system term in code and technical documentation.
- Archived documents under `docs/archive/` are design history, not current terminology.

## The game in one minute

A **run** is one attempt to build and activate the BRB. Each **month**, the player may make one optional **consultation**, then must make one **major commitment**. The commitment advances time unless it activates the BRB and ends the run immediately.

The player spends five renewable **resources** and permanently deposits some of them into four **BRB tracks**. All four tracks must reach 50 before activation. Meanwhile, the player manages **Panic**, **Stress**, **Institutions**, advisor relationships, and two different Corporation meters.

A **Situation Card** may appear each month. Resolving it uses the month's commitment. Ignoring it applies its ignored consequence before the chosen commitment.

The run ends through activation, Corporation capture, state collapse, or the loss of every advisor. A completed run produces a **Declassified Report**, adds discovered knowledge to the **Intelligence Archive**, and earns **Clearance** toward a **Legacy Directive** reward.

## Thematic UI language

| UI phrase | System meaning |
| --- | --- |
| Active file | The current saved run |
| Open a new file | Start a fresh run with a fresh seed |
| Resume file | Continue the saved active run |
| Operating doctrine / Doctrine | The selected archetype |
| Situation file | A Situation Card |
| Legacy Directive | A permanently unlocked reward card equipped for one use in a campaign |
| Clearance | Archive progress; 3 points creates a seeded Directive draft |
| Commitment | The one turn-advancing player action for the month |
| Corporation posture | The Corporation's current strategy |
| Counterfactual objective / Next-run theory | The suggested experiment attached to a replay |
| Test This Theory | Replay with the same seed and archetype |
| Open a New File | Start with a fresh seed |
| Classified | Not yet discovered by the player |
| Declassified | Revealed because the player encountered or completed it |

## Core time and run terms

| Term | Code representation | Meaning |
| --- | --- | --- |
| Run | `GameState`, `runId` | One complete or incomplete campaign attempt |
| Month | `turn` | The game's turn unit; one normal commitment advances the month by one |
| Briefing | `phase: "briefing"` | The start-of-month state before consulting or committing |
| Consulted | `phase: "consulted"` | The player used the month's optional consultation and must now commit |
| Ended | `phase: "ended"` | The run is terminal and accepts no more actions |
| Seed | `seed`, `rngState` | The number that makes random results reproducible |
| Same-seed replay | `mode: "same_seed"` | Repeats the same starting randomness so changed choices can be compared |
| Fresh-seed run | `mode: "fresh_seed"` | Starts a different random sequence |
| Deterministic | Seed plus decisions produce the same result | No unseeded randomness is allowed in the rules engine |
| Open-ended campaign | No maximum turn | The run has no calendar deadline, though other loss conditions still apply |

## Resources

Resources range from 0 to 100. They are available political tools. A resource spent on an ordinary action can be recovered later; a resource placed into a deposit is also recorded in `deposited` and is permanently committed for that run.

| Player label | Code ID | Meaning | Common uses |
| --- | --- | --- | --- |
| Money | `money` | Funding and material support | Engineering, institutional protection, crisis response |
| Influence | `influence` | Political capital and access | Access, coalitions, advisor management, counterplay |
| Intel / Intelligence | `intelligence` | Information and covert capability | Consultations, Access, Corporation counters |
| Trust | `trust` | Public and institutional confidence | Legitimacy, Stability, public choices |
| Capacity | `capacity` | Ability to execute work | Engineering and crisis response |
| Deposited resources | `deposited` | Running total permanently spent on BRB deposits | Audit and replay evidence; not a spendable pool |
| Depleted resource | Resource value at or below 15 | A low resource that adds monthly Stress | Each depleted resource adds 3 Stress |
| Recover | `recover_resource` | Refill one resource by spending the month's commitment | +30 to most resources or +28 Capacity, +7 Stress, +3 Corporation Progress |

## Pressure and state meters

All meters below range from 0 to 100 unless noted otherwise.

| Term | Code field | Meaning | Important threshold |
| --- | --- | --- | --- |
| Stress | `pressures.stress` | Administrative strain caused by shortages and hard choices | At 80 or more, monthly pressure removes 4 Trust; reaching 100 does not directly end the run |
| Panic | `pressures.panic` | Public crisis and loss of political control | At 100, the run ends in State Collapse |
| Institutions | `institutions` | Remaining strength of lawful government and public systems | At 0, the run ends in State Collapse |
| Corporation Progress | `corporation.progress` | How close the rival is to completing or capturing its objective | At 100, the run ends in Corporate Capture; at 80 or more, activation is unsafe |
| Corporation Threat | `corporation.threat` | How aggressive and damaging Corporation responses are | Selects a Threat tier; it is not the Corporation's win meter |
| Completion | Derived by `getBrbCompletionPercent()` | Readiness across the first 50 points of all four tracks | Selects a Completion Pressure tier |

### Do not confuse the Corporation meters

- **Corporation Progress** is the rival's victory/capture meter.
- **Corporation Threat** changes response speed and severity.
- Reducing Threat does not directly reduce Progress.
- Both values can be called “Corporation pressure” in ordinary prose, so code and balance notes should name the exact meter.

### Completion Pressure tiers

Completion counts at most 50 points from each track. Total readiness is therefore 200 points.

| Tier / code ID | BRB completion | Base Corporation response | Extra automatic pressure |
| --- | ---: | ---: | --- |
| Quiet / `quiet` | 0–24% | Every 5 months | None |
| Watched / `watched` | 25–49% | Every 4 months | +1 Corporation Progress every 4 months |
| Contested / `contested` | 50–74% | Every 3 months | +1 Corporation Progress every 3 months |
| Severe / `severe` | 75–89% | Every 2 months | +1 Corporation Progress every 2 months; +1 Panic every 4 months |
| Critical / `critical` | 90–100% | Every month | +1 Corporation Progress every month; +1 Panic every 3 months |

### Corporation Threat tiers

Threat modifies the response cadence above and scales harmful effects. The response interval can never be less than one month.

| Tier / code ID | Threat | Interval change | Harm multiplier |
| --- | ---: | ---: | ---: |
| Monitored / `monitored` | 0–24 | None | 1.0× |
| Mobilized / `mobilized` | 25–49 | None | 1.1× |
| Aggressive / `aggressive` | 50–74 | 1 month faster | 1.25× |
| Critical / `critical` | 75–100 | 2 months faster | 1.5× |

**Important:** Completion Pressure has a `critical` tier and Corporation Threat has a separate `critical` tier. They share a label but are not the same state.

## BRB tracks and deposits

| Track | Code ID | Question it answers | Deposit side effect |
| --- | --- | --- | --- |
| Engineering | `engineering` | Can the BRB function? | Raises Corporation Threat |
| Access | `access` | Can the player control the activation infrastructure and authority? | Raises Fixer Leverage |
| Legitimacy | `legitimacy` | Will institutions and the public tolerate activation? | Raises Corporation Threat and Stress |
| Stability | `stability` | Can the state survive the project and its aftermath? | Lowers Stress but raises Corporation Progress |

### Deposit

A **deposit** permanently spends resources and advances one BRB track.

| Size | Progress | Cost rule |
| --- | ---: | --- |
| Standard / `standard` | +25 track points | Uses the listed base cost |
| Large / `large` | +40 track points | Costs 175% of every listed amount, rounded up |

| Track | Standard deposit cost |
| --- | --- |
| Engineering | 10 Money, 3 Intelligence, 7 Capacity |
| Access | 9 Influence, 7 Intelligence, 3 Capacity |
| Legitimacy | 6 Influence, 10 Trust, 2 Capacity |
| Stability | 6 Money, 6 Trust, 6 Capacity |

Deposits cannot be refunded. Track points can exceed the 50 needed for ordinary activation and may reach 100. A track already at 100 rejects another deposit, while a deposit below 100 still pays its full cost even when some progress is capped. Extra Legitimacy and Stability matter for the Civic Legacy ending. Some card outcomes can later reduce a track even though the deposited resources remain unavailable.

## Advisors and relationship stats

| Advisor | Code ID | Specialty | Agenda categories |
| --- | --- | --- | --- |
| The Analyst | `analyst` | Forecasts and Corporation intelligence | Counter, deposit |
| The Fixer | `fixer` | Crisis control and political deals | Advisor, faction, counter |
| The Steward | `steward` | Public trust and institutional stability | Card, institutions, deposit |

| Stat | Meaning |
| --- | --- |
| Loyalty | Willingness to remain with the player |
| Alignment | Agreement with the player's recent policy direction |
| Leverage | Power the advisor has accumulated over the player |
| Competence | Accuracy and effectiveness, including forecast quality |
| Loyalty ceiling | Maximum sustainable Loyalty for that advisor |
| Loyalty breaking point | Visible Loyalty threshold below which the advisor resigns: Analyst 24, Fixer 20, Steward 30 |
| Active | Whether the advisor is still available |
| Agenda | Commitment categories the advisor approves: +4 Alignment and +1 Loyalty; disapproved commitments apply -2 Alignment and -2 Loyalty |
| Advisor memory | A persistent record that a card choice created in the current run |

An advisor leaves when Loyalty falls below their breaking point or Leverage reaches 90. Alignment still changes consultation quality but does not directly cause departure. The run collapses if every advisor becomes inactive.

### Consultation

A consultation is the optional information action before the month's commitment.

- It costs 2 Intelligence.
- Only one consultation is allowed per month.
- It predicts the Corporation's current strategy with low, medium, or high confidence.
- Forecast accuracy combines Competence, Alignment, Loyalty, Leverage, advisor memories, and false-plan doctrine. Ten Loyalty points change ordinary accuracy by four percentage points.
- It normally adds 2 Leverage. Operator consultations add 4.
- The Technocrat consulting the Analyst receives a precise forecast.
- A consultation does not advance the month.

## Archetypes / operating doctrines

An **archetype** changes starting state, favored card weighting, one liability, one consultation interaction, and one possible ending variation.

| Archetype | Code ID | Favored card type | Defining rule |
| --- | --- | --- | --- |
| Technocrat | `technocrat` | Corporation | Opaque choices cost 3 extra Trust; Analyst forecasts are precise |
| Populist | `populist` | Crisis | Public betrayal choices add 5 Panic; one Steward consultation can convert 6 Trust into 9 Influence |
| Operator | `operator` | Advisor | Consultations add double Leverage; one Fixer consultation can suppress the next ignored-card penalty for 8 extra Leverage |

A favored card type receives 1.25× draw weight. It is more likely, not guaranteed.

## Corporation terms

The **Corporation** is the rival power. Its current **strategy** is shown in the UI as its **posture**.

| Posture | Code ID | Main effect |
| --- | --- | --- |
| Expanding | `expanding` | Advances Corporation Progress |
| Infiltrating | `infiltrating` | Damages Capacity and Intelligence |
| Discrediting | `discrediting` | Damages Trust and raises Panic |
| Buying Influence | `buying_influence` | Damages Influence and raises Fixer Leverage |

| Term | Meaning |
| --- | --- |
| Corporation response | The automatic rival move when its current cadence says a response is due |
| Counter | A commitment that predicts and attempts to block the current strategy |
| Successful counter | The prediction matches; the response is blocked, Progress falls by 8, and Threat falls by 6 |
| Failed counter | The prediction is wrong; Threat rises by 5 |
| Response cadence | Number of months between Corporation responses after Completion and Threat modifiers |
| Severity multiplier | Threat-tier multiplier applied to harmful response effects |

A Corporation-type Situation Card does not replace the automatic Corporation response. Both can affect the same month.

## Commitments and action names

| Player action | Code type / category | Meaning |
| --- | --- | --- |
| Deposit / Large | `deposit` | Permanently spend resources for track progress |
| Resolve Situation Card | `resolve_card` / `card` | Choose one displayed card outcome |
| Counter Corporation | `counter_corporation` / `counter` | Predict and block the current Corporation strategy |
| Strengthen coalition | `strengthen_faction` / `faction` | Spend 8 Influence for +6 Trust and +5 Institutions |
| Manage advisor | `manage_advisor` / `advisor` | Spend 4 Influence for +10 Loyalty and -6 Leverage |
| Recover resource | `recover_resource` / `recover` | Refill one resource while Stress and Corporation Progress rise |
| Protect institutions | `protect_institutions` / `institutions` | Spend 6 Money and 4 Trust for +11 Institutions, -4 Stress, and -2 Panic |
| Activate BRB | `activate_brb` / `activate` | End the run and evaluate the activation ending |

The current campaign UI exposes **Manage Advisor** for each active advisor.

**Coalition naming:** Strengthen coalition refers to the abstract governing coalition and uses the internal `faction` category. **Labor Coalition** is a separate named card route. The prototype does not track a general faction roster.

## Situation Deck terms

| Term | Meaning |
| --- | --- |
| Situation Deck | The pool of cards that may appear during a run |
| Situation Card | One interactive political event with two choices and an ignored outcome |
| Active card | The card currently awaiting a choice |
| Crisis card / `crisis` | A public emergency or operational problem |
| Advisor card / `advisor` | A conflict or opportunity centered on an advisor |
| Corporation card / `corporation` | A visible Corporation scheme or consequence |
| Common / `common` | May appear twice per run with a four-month cooldown |
| Rare / `rare` | May appear once per run |
| Weight | Relative likelihood among currently eligible cards |
| Requirement | Turn, resource, track, flag, or Corporation-state gate for card eligibility |
| Cooldown | Required number of months between appearances |
| Follow-up | A card added to the deck by an earlier choice |
| Chain | Two connected Situation Cards |
| Route | The tracked political path created by decisions in a chain |
| Immediate consequence | State change applied as soon as the choice resolves |
| Mandatory card cost | Resource payment the player must be able to afford before a choice can resolve |
| Card damage | Negative effect that applies after resolution and floors at zero instead of blocking the choice |
| Delayed echo | A hinted persistent consequence whose full importance may appear later |
| Ignored outcome | Consequence applied when the player confirms another commitment instead |
| Expired | Unresolved active card removed because activation ended the run |
| Suppressed | Ignored card whose normal penalty was replaced by the Operator/Fixer ability |
| Provenance | The decision-to-consequence link explaining why a later card or effect occurred |
| Flag | Internal state marker used to unlock, exclude, or remember content |
| System modifier | Persistent rule change created during the run, such as `emergency_rule` |
| Ending contributor | Persistent narrative evidence used by reports or ending evaluation |
| Story-defining choice | Player-facing report label for the highest-scoring narrative pivot |
| Most consequential commitment | Player-facing report label for the highest-scoring strategic pivot |
| Final-stretch turning point | Player-facing report label for the strongest decision in the final five months |

Each month has a seeded 55% card-appearance check. Passing the check does not guarantee a specific card; the engine then filters for eligibility and makes a weighted seeded draw.

### Active system modifiers

| Modifier | Downstream rule |
| --- | --- |
| `accepted_delay` | Recovery adds 2 extra Corporation Progress |
| `replacement_contractors` | Engineering deposits permanently require 3 extra Capacity |
| `closed_oversight` | Future opaque choices require 2 extra Trust |
| `false_plan_in_circulation` | Ordinary advisor forecasts lose 10 percentage points of accuracy |
| `parallel_contractors` | Capacity recovery gains 8 extra Capacity |
| `capacity_drift` | Beginning the next month, monthly pressure removes 1 Engineering |
| `emergency_rule` | Existing emergency costs, monthly Institutions loss, Civic failure, and ending effects remain active |

### Card encounter statuses

| Code status | Meaning |
| --- | --- |
| `presented` | The card appeared but has not reached a final classification |
| `resolved` | The player selected one of its choices |
| `ignored` | Its ignored outcome applied before another commitment |
| `expired` | Activation ended the run while it was unresolved |
| `suppressed` | The Fixer replaced its normal ignored outcome |
| `auto_resolved` | Reserved status for automatic resolution; not used by the current player flow |

### Current card index

| Player title | Code ID | Type | Rarity | Special gate or role |
| --- | --- | --- | --- | --- |
| The Missing Appropriation | `budget_shortfall` | Crisis | Common | Base deck |
| The Steward's Red Folder | `whistleblower` | Advisor | Common | Base deck |
| Contractors Walk Out | `contractor_strike` | Crisis | Common | Engineering 18+ |
| The Corporation Forces a Hearing | `public_hearing` | Corporation | Common | Month 3+ |
| The Analyst's Defector | `insider_offer` | Advisor | Rare | Month 4+ |
| The Briefing Was Forwarded | `intelligence_leak` | Corporation | Rare | Access 18+ |
| A Regional Blackout | `regional_blackout` | Crisis | Common | Month 5+ |
| The Steward Demands a Vote | `coalition_vote` | Advisor | Common | Legitimacy 18+ |
| The Corporation Hosts Dinner | `corporate_lobby` | Corporation | Common | Month 4+ |
| The Fixer's Emergency Bill | `emergency_powers` | Advisor | Rare | Month 8+ |
| Only One Team Can Move | `capacity_bottleneck` | Crisis | Common | Capacity 30 or less |
| The Audit Does Not Balance | `audit_discrepancy` | Corporation | Common | Starts Corporate Exposure |
| The Silent Partner | `silent_partner` | Corporation | Rare follow-up | Corporate Exposure finale |
| A Protest at Gate Seven | `protest_spark` | Crisis | Common | Legitimacy 12+; starts Labor Coalition |
| The National March | `national_march` | Crisis | Rare follow-up | Labor Coalition finale; Month 5+ |

## Aftermath terms

| Player term / code ID | Meaning |
| --- | --- |
| Aftermath beat / `TurnBeat` | Derived presentation summary shown after a commitment; it is not saved and does not change rules |
| Improvement beat / `improvement` | Positive immediate meter movement caused by the commitment |
| Strategic connection / `discovery` | A route, doctrine, advisor memory, or archetype interaction already proven by recorded history |
| Milestone beat / `milestone` | First permanent deposit, track readiness, route opening/completion, or activation readiness |
| New problem beat / `problem` | Recorded adverse movement or a newly crossed Completion Pressure tier that frames the next decision |

Aftermath beats are computed by `deriveTurnBeats` from the final `GameState`,
`TurnResolution`, decision provenance, and route history. They never add bonuses,
change odds, reveal classified future Echo content, or create a second rules engine.
The expandable exact audit remains the authoritative source-by-source account of the month.

## Routes and chains

| Route | Code ID | Card chain | Meaning |
| --- | --- | --- | --- |
| Labor Coalition | `labor_coalition` | `protest_spark` → `national_march` | A possible labor-backed civic path |
| Corporate Exposure | `corporate_exposure` | `audit_discrepancy` → `silent_partner` | A path exposing Corporation ownership and control |

| Route status | Meaning |
| --- | --- |
| `unseen` | No choice has touched the route |
| `touched` | The first relevant decision was recorded |
| `open` | The route can legally advance or complete |
| `closed` | A choice blocked the route |
| `reopened` | A later reconciliation restored a closed route |
| `completed` | The final route step resolved from an open or reopened state |
| Normal completion | Completed directly from `open` |
| Reconciled completion | Completed from `reopened` |
| Invalid completion | A corrupted or illegal completion with no valid transition history |

“Route” and “chain” are related but not interchangeable. The **chain** is the sequence of cards; the **route** is the stateful political path created by choices on those cards.

## Endings and activation

### Activation readiness

The Activate BRB action becomes valid when Engineering, Access, Legitimacy, and Stability are each at least 50. Readiness does not guarantee a good ending.

### Activation outcomes

| Ending | Code ID | Result | Rule |
| --- | --- | --- | --- |
| A Republic Still Standing | `civic_legacy` | Victory | Every Civic Legacy requirement passes |
| The Necessary Regime | `compromised_activation` | Victory with permanent compromise | Activation is safe from capture but at least one Civic Legacy requirement fails |
| Terms and Conditions | `corporate_capture` | Loss | Corporation reaches 100, or activation occurs with Corporation Progress 80+ / unsafe Access |
| The Project Outlived the State | `state_collapse` | Loss | Panic reaches 100, Institutions reach 0, or all advisors leave |

### Civic Legacy requirements

All of these must be true at activation:

1. All four BRB tracks are at least 50.
2. Corporation Progress is below 80 and Access is at least 50.
3. Legitimacy is at least 75.
4. Stability is at least 75.
5. Institutions are at least 55.
6. Panic is below 60.
7. Every advisor's Leverage is below 65.
8. `emergency_rule` is absent.
9. The run completed or reconciled the Labor Coalition route, or preserved the `public_testimony` ending contributor.

### Ending variations

An **ending variation** changes the title and interpretation of a victory. It is not a separate base ending.

| Variation | Code ID | Trigger |
| --- | --- | --- |
| Perfect Machine, Empty State | `perfect_machine_empty_state` | Technocrat victory with technocratic opacity or Trust below 30 |
| The Crowd Presses the Button | `crowd_presses_button` | Populist victory with a valid Labor Coalition completion |
| Government by Command | `government_by_command` | Operator victory with `emergency_rule` or Fixer Leverage at least 60 |

## Replay, report, and Archive terms

| Term | Meaning |
| --- | --- |
| Declassified Report | End-of-run explanation generated entirely from final `GameState` |
| Report rules version | Identifies the rules build that created a report; older reports remain readable but replay under current rules |
| Final-state snapshot | Report copy of final resources, tracks, pressure, Institutions, Corporation meters, and advisor positions |
| Narrative Pivot | Decision with the strongest story-route, echo, memory, and consequence evidence |
| Strategic Pivot | Decision with the strongest immediate, persistent, Corporation, route, and irreversible impact |
| Final Turning Point | Highest-scoring decision from the final five months, favoring the later decision on ties |
| Pivotal Decision | Legacy field that currently mirrors Narrative Pivot |
| Narrative / Strategic / Final weight | Internal comparison score used to select report pivots; not a player score or currency |
| Unseen Route | Classified or partial clue about a route the player did not complete |
| Suggested experiment | Concrete next-run choice proposed by the report |
| Intelligence Archive | Local knowledge record of encountered cards, witnessed choice labels, encounter counts, endings, and route progress |
| Bounded power persistence | The Archive carries knowledge plus permanently unlocked Legacy Directive options; it does not raise base stats or stack upgrades |
| Encounter | One appearance of a card in a run |
| Choice witnessed | A card choice recorded in the Archive |
| Replay divergence | The first decision where a same-seed replay differs from its source run |

The Archive does not unlock resources, improve starting values, or change card odds. Its only current power reward is the optional, one-use Legacy Directive equipped before a campaign.

## FAQ

### What is the player's goal?

Raise all four BRB tracks to at least 50 and activate before Corporation capture or state collapse. A safer, more demanding goal is to meet every Civic Legacy requirement.

### Is there a time limit?

No. A run has no maximum month or year. Escalating pressure makes long survival difficult, but the engine has no hidden calendar ending.

### Does consulting use the month's commitment?

No. A consultation is optional and happens before the one major commitment. It costs Intelligence and adds advisor Leverage.

### Does resolving a Situation Card consume the commitment?

Yes. A card choice is the month's major commitment.

### Can I ignore a Situation Card?

Yes, but only with confirmation. Its ignored outcome resolves first, then the selected non-card commitment resolves in the same month. The engine checks that you can still afford the commitment after that ignored outcome; a Legacy Directive, when selected, applies between those two steps. Activation expires the card instead.

### Are Rare cards stronger than Common cards?

Not necessarily. Rarity measures narrative frequency. Common cards may appear twice after cooldown; Rare cards appear once.

### Why did a card not appear on a replay?

Check that the seed and every earlier decision match. Card eligibility can change through track values, resources, flags, prior draws, cooldowns, added or removed cards, and the Corporation's strategy.

### Are deposits recoverable?

No. Deposited resources are permanently committed for that run. The Recover action refills the active resource pool; it does not refund `deposited`.

### Can a BRB track lose progress?

Yes. Deposits are irreversible resource commitments, but some Situation Card outcomes can reduce a track. Losing track points does not return the deposited resources.

### Why is Activate BRB disabled?

At least one BRB track is below 50. Resources, Institutions, Panic, and advisor state do not disable the button once all tracks are ready, but they can determine a compromised or losing outcome.

### What is the difference between Access and Corporation Progress?

Access is the player's control track. Corporation Progress is the rival's win/capture meter. Safe activation requires Access at least 50 and Corporation Progress below 80.

### What is the difference between Stress and Panic?

Stress represents administrative overload and can damage Trust. Panic represents the public political crisis and directly ends the run at 100.

### What is the difference between Stability and Institutions?

Stability is one of the four BRB project tracks and must reach 50 for activation. Institutions is a state-health meter; reaching 0 causes collapse. Both must be protected for the best ending.

### What is the difference between Corporation Progress and Threat?

Progress determines capture and loss. Threat makes Corporation responses faster and more harmful.

### Why can “Critical” mean two things?

Both Completion Pressure and Corporation Threat have a `critical` tier. Completion Critical means the BRB is at least 90% ready. Threat Critical means Corporation Threat is at least 75. Always name the owning system.

### Can an advisor leave?

Yes. An advisor becomes inactive when Loyalty falls below their visible breaking point or Leverage reaches 90. Alignment affects advice quality but cannot cause departure by itself. If every advisor leaves, the state collapses.

### Does the Intelligence Archive make later runs easier?

Yes, but only through one deliberately bounded exception: an unlocked Legacy Directive may be equipped and used once in a campaign. The Archive does not grant extra starting resources, higher base values, better card odds, Directive levels, or multiple equipment slots.

### What does “echo” mean?

An echo is a persistent consequence hinted by a card choice. It can add or remove cards, create an advisor memory, add a system modifier, or contribute to an ending.

### What does “classified” mean?

The player has not discovered that content in completed runs. Classification is presentation and knowledge state, not a gameplay penalty.

### What is a route completion?

It is a valid sequence of recorded route transitions ending in `completed`. A route may complete normally from `open` or after reconciliation from `reopened`.

### Is a victory always good?

No. Both Civic Legacy and Compromised Activation are marked as victories, but Compromised Activation means the BRB worked while emergency arrangements became permanent.

## Codex maintenance guide

When changing BRB gameplay:

1. Use `src/game/types.ts` for canonical IDs and state shapes.
2. Use `src/game/content.ts` for names, cards, costs, characters, routes, and ending copy.
3. Use `src/game/engine.ts` for action order, thresholds, endings, and advisor/Corporation behavior.
4. Use `src/game/progression.ts` for Completion Pressure and Corporation Threat tiers.
5. Use `src/game/cards.ts` for draw, eligibility, ignored-card, echo, and encounter behavior.
6. Use `src/game/routes.ts` for legal route transitions.
7. Use `src/game/replay.ts` for reports, pivots, Archive merging, and replay intent.
8. Use current tests as executable examples.
9. Do not restore terminology from `docs/archive/` without an explicit design decision.
10. Update this reference whenever a player-facing term, canonical ID, threshold, card, route, action, advisor, archetype, or ending changes.

Prefer the player-facing label in UI copy and the code ID in implementation discussion. Example: “Corporation Progress (`corporation.progress`) reached 80,” not “the Corporation meter got high.”
