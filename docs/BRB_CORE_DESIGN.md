# BRB Core Design

## Vision

BRB is a roguelite political strategy game about converting scarce, reusable political resources into permanent progress toward a dangerous national project.

The player tries to accomplish something historic while every shortcut creates dependence, every ally develops leverage, and finishing the project may leave the player unable to control what they built.

The player should feel ambitious, pressured, suspicious, temporarily clever, increasingly compromised, and tempted to activate before conditions are safe.

### Vision lock

- **What is the game system about?** Converting reusable political resources into irreversible BRB progress while managing advisors, public stability, and a rival power.
- **What is the game experience about?** Accomplishing something historic while shortcuts create dependence and allies gain leverage.
- **What is the player's system goal?** Bring all four tracks to activation readiness and activate before the Corporation wins, the state collapses, or the 20-turn limit expires.
- **What is the player's experiential goal?** Discover what kind of ruler they become when the project matters more than the people and institutions needed to build it.

## Core promise

Every run should make the player choose between surviving the present and permanently committing resources to the BRB. The central tension is simple:

> Resources used today cannot be deposited into the BRB, and deposited resources can never be recovered.

Advisors, the Corporation, and the Situation Deck exist to sharpen this choice. They are not separate centers of the game.

Every run builds a unique classified political history. Players should finish feeling they uncovered one version of the truth, not the entire game.

## Core loop

> Assess → Investigate → Commit → Endure consequences → Adapt

1. **Receive the briefing.** See the current Situation Card, changes from the prior turn, resource pressure, an estimate of Corporation activity, and advisor reactions.
2. **Investigate and consult.** Take one limited information action without using the major commitment. Consult an advisor, spend Intelligence, inspect a faction, investigate the Corporation, or request projections. Information can be accurate, incomplete, or biased.
3. **Make one major commitment.** Deposit resources, resolve the crisis, counter the Corporation, strengthen a political faction, manage an advisor, recover or produce resources, or protect stability.
4. **Resolve rival and faction responses.** The Corporation acts; advisors and factions react according to the chosen action, weak resources, leverage, prior cards, BRB progress, and archetype.
5. **Show consequences clearly.** Show resource changes, BRB progress, reactions, Corporation activity, new risks, and delayed-consequence hints.
6. **Prepare the next turn.** Give a short report and return the player to a changed situation.

## Nested loops

### Moment-to-moment

Read the situation, inspect costs, compare advice, make a choice, and see what changed.

### Turn-to-turn

Preserve resources, advance the BRB, manage relationships, counter the Corporation, and respond to escalating crises.

### Run-level

Choose an archetype, pursue a strategy, build or fail to build the BRB, reach an ending, review the collapse or success, then try a different approach.

### Meta-progression

The full game may unlock knowledge and options: archetypes, scenarios, modifiers, advisors, and endings. It should favor horizontal progression (new choices) over vertical progression (permanent power).

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

Stress and panic are managed, not spent. Keeping them separate from resources makes the system easier to understand: resources are tools the player uses; pressure meters are the danger created when the player cannot cope.

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
- **Agenda, relationship tags, crisis specialty, and a hidden breaking point.**

An incompetent loyalist and a brilliant rival should both be viable problems. Consulting can improve information, but may also reveal bias or increase dependence.

## Corporation

The Corporation is a visible rival with a strategy, not a random attack meter. The prototype has four move types selected from these strategic states:

- Expanding
- Infiltrating
- Discrediting
- Buying influence

Players should infer the current state and adapt. Corporation moves respond to player choices and vulnerabilities rather than firing without context.

## Situation Deck

The prototype contains 15 interactive Situation Cards and two connected chains. A seeded 65% appearance check means a card is common, but not guaranteed, each turn. The deck has 6 Crisis, 4 Advisor, and 5 Corporation cards; 10 are Common and 5 are Rare. Rarity describes story frequency, not strength.

- Common cards can appear twice with a four-turn cooldown.
- Rare cards appear once per run.
- Requirements, weights, prior decisions, and deck changes determine eligibility.
- Every choice has an immediate effect and at least one delayed echo with decision provenance.

The prototype routes are Labor Coalition (`protest_spark → national_march`) and Corporate Exposure (`audit_discrepancy → silent_partner`). Card selection uses seeded weighted draws so a replay remains reproducible. Corporation cards are visible schemes or fallout the player can answer; the Corporation still takes its automatic underlying turn.

## Roguelite structure

BRB uses a run structure, not traditional roguelike conventions. It does not need grid movement, dungeons, combat encounters, loot, or permadeath characters.

Each run lasts up to 20 turns and has seeded randomness, a changing Situation Deck, and three archetypes: Technocrat, Populist, and Operator. Each changes card weights, a consultation interaction, a liability, and a possible ending variation—not only starting numbers.

At the ending, a Declassified Report identifies one pivotal choice, its echoes, one unseen-route hint, and one concrete experiment. Archive v0 keeps only discovered knowledge and the latest report. It never improves starting resources or power.

For the full game, optional mutators can include unreliable intelligence, double advisor leverage, a shorter campaign, public-only deposits, or a permanently constrained resource. Persistent progression should primarily reveal knowledge and options—not grant money or other raw power.

## Endings

There are 3–4 prototype endings. Endings emerge from BRB activation, track quality, panic, institutional stability, advisor relationships, Corporation status, and major choices.

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
- 15–20 turns, 15 interactive Situation Cards, and 2 connected chains
- 4 Corporation move types and 3–4 endings
- One difficulty level, local saves, seeded runs, run summary, and basic simulation tools

### Presentation

- One desktop-first responsive browser campaign screen
- Declassified Report and Intelligence Archive v0
- Strong consequence feedback
- Local active-run save, latest report, replay intent, and knowledge archive

## Explicit exclusions

Nothing that fails to test the four prototype goals earns admission. Exclusions include Opportunity, Personal, BRB, Legacy, Legendary, and Black File cards; power unlocks; a route map; a large codex or report library; online accounts; cloud saves; analytics; multiplayer; mobile or desktop packaging; achievements; paid DLC; a faction map; procedural AI dialogue; and full voice acting.

## Future expansion hooks

Future expansion should widen the game horizontally: additional card families and rarities, political scenarios, advisor sets, Corporation personalities, alternate BRB projects, route maps, historical crisis packs, hard-mode mutators, endings, and archetypes. Avoid resource boosts, easier starts, permanent power, individual card purchases, and consumable currency.

## Technical structure

Keep four layers separate so the prototype can grow without a rewrite:

1. **Simulation:** pure TypeScript for valid actions, state transitions, costs, Situation Cards, echoes, advisors, Corporation logic, reports, and endings. No React imports.
2. **Content:** typed data or JSON-compatible definitions for cards, advisors, archetypes, scenarios, deposits, moves, routes, and endings.
3. **Presentation:** React components for screens, animation, audio, input, tooltips, and consequence display.
4. **Platform:** adapters for browser saves now and desktop, Steam, iOS, analytics, and store integration later.
