# Big Red Button - Canonical Game Design Document

**Title:** Big Red Button
**Genre:** Political idle strategy game with dark satire
**Platform:** Web first
**Document Role:** Source-of-truth GDD
**Status:** Canonical draft for implementation

---

## 1. High Concept

Big Red Button is an advisor-driven idle strategy game about building power in a collapsing world.

The player does not act directly. They act through advisors, spend resources to shape events, and climb toward dominance as the global Doomsday Clock advances. The faster they grow, the more pressure they put on the world. Late in the run, they may choose to force the ending by pressing the Big Red Button: a catastrophic shortcut that can either secure immediate victory or trigger total collapse.

The game should feel strategically satisfying first, then morally corrosive in retrospect.

---

## 2. Player Promise

The player fantasy is:

- Build a machine of influence through other people
- Make meaningful tradeoffs under rising pressure
- Watch a reactive world push back
- Decide whether to win slowly, or risk everything on the final shortcut

The emotional arc is:

1. Gain power
2. Spend power
3. Trigger consequences
4. Manage instability
5. Decide whether to keep climbing or force the ending

---

## 3. Design Pillars

### Advisor-Driven Power

The player never takes actions directly. Every action is routed through an advisor with a specialty, a bias, and a risk profile.

### Strategy Through Tradeoffs

Every meaningful gain should cost time, expose risk, or weaken another part of the machine. There should be no universally safe path.

### Pressure Is Constant

The Doomsday Clock is always active. Growth creates danger. Waiting is safer in the short term, but it narrows the window to win.

### Satire Supports Gameplay

The writing should be sharp, funny, and uncomfortable, but the systems must stand on their own. The game is not a joke simulator.

### Clear End States

The player must always understand that the run can end in one of three broad ways:

- standard victory,
- catastrophic failure,
- forced resolution through the button.

---

## 4. Core Loop

This is the canonical gameplay loop and should be readable by design, engineering, and content teams without interpretation.

### Mechanical Loop

1. The player reviews current resources, advisor state, active threats, and Doomsday pressure.
2. The player chooses one advisor.
3. The player selects one action from that advisor's menu.
4. The game checks requirements and deducts costs up front.
5. Time advances while the action resolves through the idle timer system.
6. When the timer completes, the game resolves an outcome band:
   - critical success,
   - success,
   - partial success,
   - failure,
   - backfire.
7. The game updates resources, follower count, tension, and world pressure.
8. Event checks run:
   - advisor conflict,
   - faction reaction,
   - crisis or opportunity,
   - Doomsday escalation.
9. The game checks terminal states in this order:
   - standard win,
   - button win,
   - clock loss,
   - collapse loss,
   - button catastrophe.
10. The loop repeats until the run ends.

### Emotional Loop

- Build momentum
- Overextend
- Patch the damage
- Grow stronger
- Feel the world get less stable
- Decide whether to gamble on the final shortcut

### Idle Loop Rules

- The game runs on a fixed repeating tick.
- Passive resources update every tick.
- One active action at a time is the default MVP rule.
- Events are checked after action resolution and on time-based intervals.
- The Doomsday Clock updates continuously, not only on major milestones.

---

## 5. Onboarding Interview

The game opens with a five-question interview that determines the player's starting identity and hidden tendencies.

### Purpose

The interview must:

- assign an archetype,
- score hidden traits,
- seed advisor tension and affinity,
- establish tone.

### Rules

- Five questions total
- Three answer choices per question
- No answer is labeled moral or immoral
- Each answer must feel tactical, revealing, or self-justifying

### Hidden Power Tracks

The five archetypes are player-facing, but balancing is built on three hidden tracks:

| Track | Meaning |
|---|---|
| Capital | Wealth, control of assets, institutional leverage |
| Devotion | Belief, emotional loyalty, mass submission |
| Legitimacy | Formal authority, procedural cover, acceptable power |

### Hidden Traits

| Trait | Gameplay Role |
|---|---|
| Charisma | Improves persuasion and follower growth |
| Ruthlessness | Increases upside on harsh actions and risk exposure |
| Discipline | Improves efficiency and control |
| Vision | Improves long-horizon actions and world-read effects |
| Instability | Increases variance, event frequency, and escalation risk |

### Output

- Highest hidden track determines starting archetype
- Traits modify action quality and event likelihood
- Certain answers create initial advisor friction or loyalty bonuses

---

## 6. Archetypes

The game ships with five archetypes. They share the same base systems but differ in resource emphasis, advisor rosters, preferred actions, and normal win routes.

### 1. Politician

- Core fantasy: institutional takeover through legitimacy, leverage, and public optics
- Strong at: Influence, Approval, procedural control
- Weak at: raw loyalty, dirty power without fallout
- Normal win route: national-scale control through followers plus legitimacy threshold

### 2. Televangelist

- Core fantasy: emotional mass influence wrapped in spectacle and righteousness
- Strong at: Approval, Money, audience growth
- Weak at: hard control when credibility collapses
- Normal win route: massive audience plus financial empire threshold

### 3. Cult Leader

- Core fantasy: closed-system authority through devotion and isolation
- Strong at: Loyalty/Control, compound growth, follower obedience
- Weak at: broad legitimacy and public resilience
- Normal win route: highly loyal self-sustaining power structure

### 4. Oligarch

- Core fantasy: indirect rule through money, institutions, and coercive leverage
- Strong at: Money, Organization, Secrets/Dirt
- Weak at: organic approval
- Normal win route: control of key institutions and protected economic dominance

### 5. Demagogue

- Core fantasy: direct mass mobilization through fear, identity, and escalating crisis
- Strong at: Approval spikes, Media Presence, crowd control
- Weak at: stability and long-term legitimacy
- Normal win route: sustained emergency-rule style mass control

---

## 7. Resource Model

The resource model is intentionally split into three layers.

### Core Resources

These are visible at all times and drive the main loop.

| Resource | Purpose |
|---|---|
| Money | Pays for actions, hiring, speed, and protection |
| Influence | Unlocks backroom leverage, political force, institutional pressure |
| Approval | Represents public buy-in, excitement, and broad consent |
| Organization | Represents infrastructure, offices, networks, compounds, and scale |
| Followers | Represents the size of the player's active base |

### Pressure Resources

These create instability, gating, and failure risk.

| Resource | Purpose |
|---|---|
| Heat | Scrutiny from rivals, institutions, media, or the public |
| Loyalty/Control | Measures obedience and reliability inside the player's machine |
| Reputation/Credibility | Measures whether claims, narratives, and promises still land |
| Secrets/Dirt | Measures gathered leverage, blackmail, and hidden ammunition |

### Global Pressure

| System | Purpose |
|---|---|
| Doomsday Clock | Global collapse meter that creates irreversible urgency |

### Design Rules

- Core resources should grow through play.
- Pressure resources should create friction, not become pure side currencies.
- The Doomsday Clock should affect every run regardless of archetype.
- No single resource should solve all problems without creating another one.

---

## 8. Advisor System

Advisors are the main gameplay interface.

### MVP Rules

- The player operates through advisors only.
- Each advisor has a specialty, passive effect, and private action menu.
- Each advisor has conflict tendencies with at least one other advisor type.
- Each advisor can improve outcomes and also expose risks.

### Shared Advisor Roles

| Role | Focus |
|---|---|
| Operator | Money and deal-making |
| Strategist | Legitimacy and long-term planning |
| Evangelist | Belief, loyalty, and recruitment |
| Fixer | Crisis suppression and cleanup |
| Media Head | Narrative shaping and approval management |
| Technocrat | Efficiency, organization, and system tuning |

### Archetype-Specific Rosters

Each archetype should have a roster of four core advisors. Their exact names can vary, but the roster must cover:

- money or asset generation,
- public or narrative pressure,
- control or loyalty management,
- intelligence, leverage, or cleanup.

### Advisor Conflict

Advisor conflict exists in MVP, but at controlled scope.

Each advisor has:

- a compatibility value with the other advisors,
- a tension meter,
- one or two trigger conditions that increase tension,
- one failure behavior when tension is ignored.

Conflict escalation follows:

1. Disagreement
2. Open friction
3. Loyalty drop
4. Sabotage or refusal
5. Departure, betrayal, or event trigger

This should create meaningful mid-run instability without becoming a full relationship simulator.

---

## 9. Action System

Actions are always launched from an advisor menu.

### Canonical Action Definition

Every action must define:

- advisor owner,
- cost,
- duration,
- requirements,
- resource effects,
- outcome bands,
- event hooks,
- commentary hooks.

### Outcome Bands

Every action resolves into one of five results:

| Outcome | Meaning |
|---|---|
| Critical Success | Best-case result with bonus gain or reduced backlash |
| Success | Intended result |
| Partial Success | Mixed result with reduced reward or extra cost |
| Failure | Action fails and costs are lost |
| Backfire | Action fails and actively harms the player |

### Outcome Inputs

Action quality should be influenced by:

- relevant resources,
- archetype fit,
- hidden traits,
- advisor specialty,
- tension state,
- Doomsday pressure where appropriate.

### Action Categories

The final content set should support at least these action families:

- growth,
- propaganda,
- deal-making,
- infrastructure,
- suppression,
- intelligence,
- repair,
- de-escalation.

---

## 10. Time and Idle Structure

Time is the master cost in the game.

### MVP Time Rules

- Actions consume real-time durations.
- Only one primary action runs at a time.
- Passive generation continues during action resolution.
- Select actions can accelerate or stabilize later systems, but every shortcut should carry cost.

### Why This Matters

The player should be choosing between:

- fast growth with instability,
- slower growth with more control,
- resource spending now for safer outcomes later.

---

## 11. The Doomsday Clock

The Doomsday Clock is a global pressure system, not just flavor text.

### Role

It prevents passive infinite growth and ensures every run has mounting urgency.

### It Advances Through

- destabilizing player actions,
- high Instability,
- high Heat,
- repeated crisis outcomes,
- certain advisor conflicts,
- world events,
- mass unrest or institutional breakdown.

### It Slows Through

- stabilizing actions,
- high Legitimacy play,
- strong Organization,
- successful de-escalation events,
- specific advisor interventions.

### Rules

- The clock is always visible.
- It should move often enough to matter.
- It should not be trivial to reverse.
- Slowing the clock should cost the player momentum elsewhere.

### Terminal Condition

If the Doomsday Clock reaches terminal collapse, the player loses immediately. This is a shared loss condition across all archetypes.

---

## 12. Big Red Button

The Big Red Button is the game's signature endgame shortcut.

It is not the same system as the Doomsday Clock. The clock is ongoing global pressure. The button is a deliberate player choice.

### Unlock Rules

The button appears only when all of the following are true:

- the player has reached a late-game follower threshold,
- the player has reached a late-game organizational threshold,
- the player has reached a late-game stability threshold,
- a minimum run-time threshold has passed,
- the Doomsday Clock is not already at terminal state.

### Shared MVP Unlock Threshold

The canonical MVP thresholds are:

- Followers >= 5,000
- Organization >= 300
- combined stability check:
  - either Approval >= 2,000 or Loyalty/Control >= 2,000,
- at least 20 minutes elapsed in the run

### Button Victory Rule

Pressing the button creates immediate victory only if the player also meets a success state proving they can survive the shock of the shortcut.

Minimum shared button-success conditions:

- Followers >= 5,000
- Organization >= 300
- Money >= 25,000
- one archetype-specific dominance condition met
- no active terminal collapse state already triggered

### Button Catastrophe Rule

If the player presses the button after unlock but without meeting success conditions, the run ends in immediate catastrophe.

This is a shared loss family across all archetypes.

### Archetype Flavor

The button should produce a different ending flavor for each archetype:

- Politician: emergency state and suspended democracy
- Televangelist: total spectacle and financialized salvation
- Cult Leader: closed-system lock-in and irreversible obedience
- Oligarch: financial capture and protected private sovereignty
- Demagogue: permanent crisis rule and mass fear governance

---

## 13. Events, Factions, and World Reaction

The world must react to player growth.

### Event Types

| Type | Purpose |
|---|---|
| Opportunity | Short-term upside with tradeoffs |
| Crisis | Threat that forces response |
| Advisor Conflict | Internal instability |
| Faction Reaction | External pushback or alignment |
| World Event | Global shift that affects all runs |

### Factions

Factions are reactive forces, not player-owned resources.

Examples include:

- party insiders,
- donors,
- media blocs,
- regulators,
- true believers,
- dissidents,
- institutions,
- rival movements.

Factions should:

- react to repeated action types,
- amplify or suppress resources,
- create branching event pressure,
- reinforce the archetype fantasy.

---

## 14. Win Conditions

The game has two classes of victory.

### A. Standard Victory

Each archetype has a normal route to dominance. These are not just narrative labels. They are implementation-facing end states.

#### Politician Standard Win

The player wins when all of the following are true:

- Followers >= 10,000
- Legitimacy state is high enough to represent national procedural control
- Influence >= 3,000
- Doomsday Clock has not reached terminal collapse

Interpretation: the player has converted public scale and institutional control into durable power.

#### Televangelist Standard Win

The player wins when all of the following are true:

- Followers >= 15,000
- Money >= 50,000
- Reputation/Credibility >= 2,500
- Organization >= 400

Interpretation: the player controls a mass audience and a self-reinforcing empire of belief and money.

#### Cult Leader Standard Win

The player wins when all of the following are true:

- Followers >= 4,000
- Loyalty/Control >= 4,000
- Organization >= 500
- Heat is below terminal exposure threshold

Interpretation: the player has built a closed, loyal, self-sustaining system that can resist outside pressure.

#### Oligarch Standard Win

The player wins when all of the following are true:

- Money >= 100,000
- Organization >= 600
- Secrets/Dirt >= 2,500
- control over 3 major institutions has been established through milestone events

Interpretation: the player rules indirectly through wealth, leverage, and protected institutional capture.

#### Demagogue Standard Win

The player wins when all of the following are true:

- Followers >= 12,000
- Approval >= 4,000
- Loyalty/Control >= 2,500
- emergency-rule state has been sustained through milestone events

Interpretation: the player has converted mass excitement and fear into stable coercive rule.

### B. Button Victory

The player wins instantly if:

- the button is unlocked,
- the shared button-success conditions are met,
- the archetype-specific dominance condition is met,
- no terminal loss state has already fired.

Button victory bypasses the remaining grind and immediately ends the run with the archetype's catastrophic shortcut ending.

---

## 15. Lose Conditions

The game has three main loss families and they must be communicated clearly in both design and implementation.

### A. Clock Loss

The player loses immediately if the Doomsday Clock reaches terminal collapse.

This is the global "the world ends before your project finishes" failure state.

### B. Collapse Loss

The player loses if their power structure becomes nonviable and remains unrecoverable through a short grace window.

#### Grace Window Rule

- Collapse conditions should trigger a warning state first.
- If the player does not recover within the grace window, the run ends.
- MVP grace window recommendation: 60 seconds of real time.

#### Shared Collapse Triggers

Any one of the following can trigger collapse risk:

- two or more critical core resources at zero,
- follower base enters freefall,
- Heat reaches terminal exposure threshold,
- advisor sabotage creates unrecoverable breakdown,
- credibility or loyalty reaches archetype-specific failure floor.

#### Archetype-Specific Collapse Risks

- Politician: legitimacy collapse and loss of institutional cover
- Televangelist: credibility collapse and donor flight
- Cult Leader: mass defection and compound breakdown
- Oligarch: exposure plus asset seizure cascade
- Demagogue: crowd fracture and loss of control over the crisis machine

### C. Button Catastrophe

The player loses immediately if they press the Big Red Button without meeting button-success requirements.

This is not a soft fail. It is a terminal misfire.

### Terminal State Evaluation Order

The game should evaluate terminal states in this order:

1. Standard win
2. Button win
3. Clock loss
4. Collapse loss
5. Button catastrophe

This order ensures:

- earned victories resolve before background fail checks,
- the button can still produce a valid win when used correctly,
- the clock remains the highest shared fail-pressure after unresolved wins.

---

## 16. MVP Scope

This GDD defines a five-archetype MVP.

### In Scope

- Five-question interview
- Five archetypes
- Hidden tracks and hidden traits
- Core and pressure resources
- One active action at a time
- Advisor-driven menus
- Outcome bands
- Doomsday Clock
- Big Red Button
- Basic advisor conflict
- Faction and world events
- Standard wins
- Button win
- Clock loss
- Collapse loss
- Button catastrophe

### Out of Scope for MVP

- full advisor relationship tree,
- large branching narrative campaign,
- multiplayer or PvP features,
- deep city-builder layer,
- prestige or new game plus system.

---

## 17. Content and State Definitions

These definitions should be treated as public interfaces for implementation.

### Archetype Definition

Each archetype must define:

- id,
- name,
- starting resource profile,
- hidden track emphasis,
- advisor roster,
- action weighting,
- standard win route,
- collapse risks,
- button ending flavor.

### Advisor Definition

Each advisor must define:

- id,
- role,
- specialty,
- passive effect,
- action list,
- tension triggers,
- commentary role.

### Action Definition

Each action must define:

- id,
- advisor owner,
- cost,
- duration,
- requirements,
- outcome bands,
- rewards,
- penalties,
- event hooks.

### Question Definition

Each interview question must define:

- prompt,
- three answers,
- hidden track weights,
- hidden trait weights,
- optional advisor-affinity hooks.

### Game State Definition

The game state must track:

- current phase,
- selected archetype,
- hidden tracks,
- hidden traits,
- visible resources,
- advisor roster,
- active action,
- advisor tension state,
- event queue,
- Doomsday Clock state,
- Big Red Button availability,
- win or loss flags.

---

## 18. UX Principles

The UI should make these realities obvious at all times:

- what the player can do now,
- what it will cost,
- what is in danger,
- how close the world is to collapse,
- whether the button is becoming available.

The player should never lose because the rules were hidden. They should lose because they made the wrong tradeoff.

---

## 19. Implementation Notes

This document is gameplay-first, but it is intended to be build-ready for a React or Next.js team.

Implementation should favor:

- data-driven archetypes, advisors, actions, and questions,
- clear terminal-state checks,
- deterministic action definitions with controlled variance,
- readable content pipelines for writing and balance changes.

Do not let frontend structure dictate game design. The UI serves the loop, not the other way around.

---

## 20. Acceptance Criteria

The GDD is implementation-ready when the following statements are true:

- The interview always resolves to a valid archetype and trait profile
- Each archetype has a distinct standard win route
- The core loop can be implemented without guessing at missing steps
- Advisors materially change action access or outcome quality
- Resource loops create tradeoffs instead of a single dominant stat
- The Doomsday Clock adds urgency without making early play hopeless
- The Big Red Button unlocks late enough to feel consequential
- Button victory and button catastrophe are both unambiguous
- A run can end through standard victory, button victory, clock loss, collapse loss, or button catastrophe
- The player can understand why they won or lost from the final game state

---

## 21. Canonical Summary

Big Red Button is a game about building power through advisors under escalating world pressure.

The player wins either by fully realizing their archetype's route to dominance or by forcing the end through the Big Red Button after building enough momentum to survive it. The player loses if the world collapses first, if their machine breaks apart, or if they force the ending before they are truly ready.

That relationship between growth, pressure, and catastrophic choice is the center of the game.
