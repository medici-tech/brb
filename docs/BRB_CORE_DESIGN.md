# BRB Core Design

## Vision

BRB is a roguelite political strategy game about converting scarce, reusable political resources into permanent progress toward a dangerous national project.

The player tries to accomplish something historic while every shortcut creates dependence, every ally develops leverage, and finishing the project may leave the player unable to control what they built.

The player should feel ambitious, pressured, suspicious, temporarily clever, increasingly compromised, and tempted to activate before conditions are safe.

### Vision lock

- **What is the game system about?** Converting reusable political resources into irreversible BRB progress while managing advisors, public stability, and a rival power.
- **What is the game experience about?** Accomplishing something historic while shortcuts create dependence and allies gain leverage.
- **What is the player's system goal?** Bring all four tracks to activation readiness and activate before the Corporation wins or the state collapses. There is no calendar deadline.
- **What is the player's experiential goal?** Discover what kind of ruler they become when the project matters more than the people and institutions needed to build it.

## Core promise

Every run should make the player choose between surviving the present and permanently committing resources to the BRB. The central tension is simple:

> Resources used today cannot be deposited into the BRB, and deposited resources can never be recovered.

Advisors, the Corporation, and the Situation Deck exist to sharpen this choice. They are not separate centers of the game.

Every run builds a unique classified political history. Players should finish feeling they uncovered one version of the truth, not the entire game.

## Core loop

> Assess → Investigate → Commit → See improvement → Recognize connections → Face new pressure → Adapt

1. **Receive the briefing.** See the current Situation Card, changes from the prior turn, resource pressure, an estimate of Corporation activity, and advisor reactions.
2. **Investigate and consult.** The prototype allows one optional advisor consultation before the major commitment. It costs Intelligence and can be accurate, incomplete, or biased. Separate faction inspections, Corporation investigations, and projection requests remain future information-action hooks.
3. **Make one major commitment.** Deposit resources, resolve the crisis, counter the Corporation, strengthen a political faction, manage an advisor, recover or produce resources, or protect stability.
4. **Resolve rival and faction responses.** The Corporation acts; advisors and factions react according to the chosen action, weak resources, leverage, prior cards, BRB progress, and archetype.
5. **Show the improvement loop clearly.** After commitment, lead with what improved, identify any route, doctrine, relationship, or archetype connection that actually surfaced, mark meaningful milestones, and then name the resulting pressure. Celebration is reserved for permanent first progress, track readiness, route discoveries or completions, and activation readiness.
6. **Preserve exact provenance.** Keep every meter change attributable to the Situation, commitment, advisor reaction, Corporation response, or monthly pressure. A surfaced connection may explain an already-resolved Echo, but future Echo details remain classified.
7. **Prepare the next turn.** Give a short report that makes the next problem legible, then return the player to a changed situation.

## Nested loops

### Moment-to-moment

Read the situation, inspect costs, compare advice, make a choice, see what improved, recognize what earlier decision mattered, and identify the next pressure.

### Month-to-month

Preserve resources, advance the BRB, manage relationships, counter the Corporation, and respond to escalating crises.

### Run-level

Choose an archetype, pursue a strategy, build or fail to build the BRB, reach an ending, review the collapse or success, then try a different approach.

### Meta-progression

Archive v1 unlocks limited power through six Legacy Directives. A completed run earns 1 Clearance and a victory earns 3; every 3 Clearance produces a deterministic draft of up to three locked Directives. The chosen Directive remains permanently unlocked, but the player may equip only one and use it once in a campaign. Each benefit carries a visible political cost. This is a bounded exception to the knowledge-only rule, not an open-ended stat ladder.

Future progression should still favor horizontal options—archetypes, scenarios, modifiers, advisors, and endings—over cumulative numerical power. Directive levels, consumable copies, multiple equipped cards, and starting-stat upgrades remain excluded until the one-card system is validated.

## Resources

### Spendable resources

| Resource | What it represents | Typical uses |
| --- | --- | --- |
| Money | Funding and material support | Engineering, crisis response, stability |
| Influence | Political capital and access | Factions, access, agreements |
| Intelligence | Information and covert capacity | Investigation, forecasts, counterplay |
| Trust | Public and institutional confidence | Legitimacy, stability, public action |
| Capacity | Ability to execute work | Engineering, recovery, crisis management |

Resources have starting ranges, income sources, costs, caps, floors, and a definition of whether they are renewable or permanent. Those numbers belong in [BRB Balance Targets](BRB_BALANCE_TARGETS.md).

### Pressure meters

Stress and panic are managed, not spent. Keeping them separate from resources makes the system easier to understand: resources are tools the player uses; pressure meters are the danger created when the player cannot cope. Stress at 80 or more drains Trust but does not directly end the campaign. Panic causes State Collapse at 100, while Institutions remains a state-health meter that causes collapse at 0.

## BRB tracks

The prototype tests four tracks. Each must demand a different kind of sacrifice so tracks are understandable without a manual.

| Track | Question answered | Main costs | Main risks |
| --- | --- | --- | --- |
| Engineering | Can the BRB function? | Money, Capacity, Intelligence | Delays, flaws, contractor dependence |
| Access | Can the player control activation infrastructure and authority? | Influence, Intelligence, advisor cooperation | Betrayal, infiltration, leverage |
| Legitimacy | Will institutions and the public tolerate activation? | Trust, Influence, transparency | Protest, exposure, loss of secrecy |
| Stability | Can the state survive the process and aftermath? | Money, Trust, time, crisis actions | Collapse, panic, coup, emergency rule |

BRB progress must make the game harder, not only closer to victory. Engineering raises contractor pressure; Access raises insider threats; Legitimacy makes secrecy harder; Stability trades speed for safety.

## Advisors

Advisors create strategic tension, not free bonuses. The prototype includes the Analyst, Fixer, and Steward.

Each advisor has:

- **Loyalty:** willingness to remain with the player.
- **Alignment:** agreement with the current policy direction.
- **Leverage:** power the advisor has gained over the player.
- **Loyalty ceiling:** the highest sustainable loyalty under current conditions.
- **Competence:** effectiveness at their work.
- **Agenda, relationship tags, crisis specialty, and a visible Loyalty breaking point.**

An approved commitment adds 4 Alignment and 1 Loyalty. A disapproved commitment removes 2 Alignment and 2 Loyalty. Competence, Alignment, Loyalty, Leverage, remembered treatment, and false-plan doctrine all shape consultation accuracy. An advisor leaves when Loyalty falls below their individual breaking point. High Leverage no longer produces a graceful exit: an advisor who reaches the coup bar seizes control instead of departing (see [Endings](#endings)). An incompetent loyalist and a brilliant rival should both be viable problems. Consulting can improve information, but may also reveal bias or increase dependence. Each consultation produces one legal, specific recommendation shaped by that advisor's agenda; it is explicitly advice, not an optimality claim.

## Corporation

The Corporation is a visible rival with a strategy, not a random attack meter. The prototype has four move types selected from these strategic states:

- Expanding
- Infiltrating
- Discrediting
- Buying influence

Players should infer the current state and adapt. The **prepared posture is hidden**: the player sees only the Corporation's last executed move as a tell and must pay an advisor consultation to forecast the posture being prepared. A counter-operation therefore targets a *predicted* posture and is a genuine bet—it blocks the move only if the forecast is correct, and a wrong guess wastes the operation and raises Threat. This makes the paid forecast load-bearing (the technocrat/analyst precise forecast is a real archetype advantage) rather than redundant. Corporation moves respond to player choices and vulnerabilities rather than firing without context. Each candidate posture receives its own small seeded jitter, so close strategic scores can diverge without sacrificing replay determinism.

Corporation Watch separates three related signals. **Progress** is the rival victory meter and ends the campaign at 100. **Posture** is the concealed move being prepared, surfaced only through an advisor forecast; the panel shows the last observed move as a tell. **Threat** controls response cadence and move severity: Monitored (0–24) is 100% severity, Mobilized (25–49) is 110%, Aggressive (50–74) is 125% and one month faster, and Critical (75–100) is 150% and two months faster. Threat modifies the existing BRB-completion cadence with a one-month minimum.

## Situation Deck

The prototype contains 15 interactive Situation Cards and two connected chains. A seeded 55% appearance check means a card is common, but not guaranteed, each turn. The deck has 6 Crisis, 4 Advisor, and 5 Corporation cards; 10 are Common and 5 are Rare. Rarity describes story frequency, not strength.

- Common cards can appear twice with a four-turn cooldown.
- Rare cards appear once per run.
- Requirements, weights, prior decisions, and deck changes determine eligibility.
- Every choice declares mandatory resource costs separately from floor-clamped damage, has an immediate effect, and records at least one delayed echo with decision provenance.

Advisor memories later change that advisor's forecast quality. System echoes change the related rule: accepted delay worsens recovery tempo, replacement contractors raise Engineering Capacity costs, closed oversight raises opaque Trust costs, a false plan weakens forecasts, parallel contractors improve Capacity recovery, Capacity drift erodes Engineering from the following month, and emergency rule continues to weaken Institutions and endings.

The prototype routes are Labor Coalition (`protest_spark → national_march`) and Corporate Exposure (`audit_discrepancy → silent_partner`). Card selection uses seeded weighted draws so a replay remains reproducible. Corporation cards are visible schemes or fallout the player can answer; the Corporation still takes its automatic underlying turn.

## Roguelite structure

BRB uses a run structure, not traditional roguelike conventions. It does not need grid movement, dungeons, combat encounters, loot, or permadeath characters.

Each major commitment advances the campaign by one month. Runs have no fixed duration: an exceptional campaign might finish inside a year, while a cautious campaign can span many in-game years. Seeded randomness, a changing Situation Deck, and three archetypes—Technocrat, Populist, and Operator—shape each attempt. Each archetype changes card weights, a consultation interaction, a liability, and a possible ending variation—not only starting numbers.

At the ending, a versioned Declassified Report identifies the ending trigger, final meters and advisor positions, pivotal choices, one unseen-route hint, one concrete experiment, and the equipped Legacy Directive. Archive v1 keeps discovered knowledge plus Clearance, unlocked Directives, and one pending deterministic reward draft.

For the full game, optional mutators can include unreliable intelligence, double advisor leverage, a shorter campaign, public-only deposits, or a permanently constrained resource. Persistent progression should primarily reveal knowledge and options; Legacy Directives are the deliberately narrow power exception.

## Endings

The prototype has six endings. Endings emerge from BRB activation, track quality, panic, institutional stability, advisor relationships, Corporation status, and major choices.

- **Civic Legacy** (win): activation under durable public control — all nine civic conditions hold.
- **Compromised Activation** (win): activation with access safe but at least one civic condition failed.
- **Corporate Capture** (loss): Corporation Progress reaches 100, or activation occurs while the Corporation holds the decisive access point.
- **State Collapse** (loss): Panic reaches 100, Institutions reach 0, or every advisor leaves.
- **Advisor Coup** (loss): one advisor reaches Leverage 85 and seizes control. High Leverage alone is decisive — there is no dependence gate, and there is no graceful high-Leverage departure; leaning too hard on one advisor hands them the state.
- **Advisor Cabal** (loss): two or more active advisors each hold cabal-level Leverage (50) and jointly govern without the player.

**Reliance compounds.** Each month, an active advisor already at or above Leverage 50 gains a little more Leverage. Because the player can only discipline one advisor per month (`manage_advisor`), leaning on advisors drifts them toward takeover unless actively checked — so over-reliance is a pervasive threat in normal play, not only an extreme strategy. Only Leverage at or above the floor compounds, so early relationships are untouched. An advisor still resigns when Loyalty falls below their breaking point.

The two advisor losses make over-reliance on consultation and advisor shortcuts a distinct failure mode rather than a slow slide into State Collapse: leaning on advisors builds the Leverage that eventually lets them win. They reinforce the Civic Legacy requirement that no advisor holds decisive Leverage.

Victory is not binary. Possible outcomes include preserving democracy, authoritarian control, illegitimate activation, advisor capture, finishing too late, stopping the Corporation while abandoning BRB, or mutual catastrophe.

## Prototype scope

The itch.io prototype is not the full BRB game. It proves only four things:

1. The resource-deposit decision hurts.
2. Advisors create meaningful strategic tension.
3. The Corporation forces adaptation.
4. Players want another run.

### Core content

- 3 advisors and 3 archetypes
- 5 active resources and 4 BRB tracks (pending validation)
- Open-ended monthly campaigns, 15 interactive Situation Cards, and 2 connected chains
- 4 Corporation move types and 6 endings
- One difficulty level, local saves, seeded runs, run summary, and basic simulation tools

### Presentation

- One desktop-first responsive browser campaign screen with the active Situation as
  the primary playfield
- A fixed-camera orthographic continuity facility (16px LimeZu tile grid) beside the
  Situation dossier; dossier text and controls stay outside the illustrated room
- Fully orthographic aftermath rooms that show Setup → Action → Consequence
  without giving the player an avatar or adding movement
- Six reusable political locations and canonical-state-derived facility scars
- Declassified Report and Intelligence Archive v1
- Strong consequence feedback
- Local active-run save, latest report, replay intent, and knowledge-plus-Directive archive

## Explicit exclusions

Nothing that fails to test the four prototype goals earns admission. Exclusions include Opportunity, Personal, BRB, Legacy, Legendary, and Black File Situation Cards; Directive levels or extra equipment slots; a route map; a large codex or report library; online accounts; cloud saves; analytics; multiplayer; mobile or desktop packaging; achievements; paid DLC; a faction map; procedural AI dialogue; and full voice acting.

## Future expansion hooks

Future expansion should widen the game horizontally: additional card families and rarities, political scenarios, advisor sets, Corporation personalities, alternate BRB projects, route maps, historical crisis packs, hard-mode mutators, endings, and archetypes. Avoid uncapped resource boosts, easier starts, individual card purchases, and consumable currency.

## Technical structure

Keep four layers separate so the prototype can grow without a rewrite:

1. **Simulation:** pure TypeScript for valid actions, state transitions, costs, Situation Cards, echoes, advisors, Corporation logic, reports, and endings. No React imports.
2. **Content:** typed data or JSON-compatible definitions for cards, advisors, archetypes, scenarios, deposits, moves, routes, and endings.
3. **Presentation:** React components for screens, orthographic `PixelRoom` scenes,
   animation, audio, input, tooltips, and consequence display. Scene selection derives
   from canonical state and decision history but is not persisted as gameplay state.
4. **Platform:** adapters for browser saves now and desktop, Steam, iOS, analytics, and store integration later.
