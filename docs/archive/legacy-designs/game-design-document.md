> **Historical design — not current implementation guidance.** This document preserves an obsolete BRB concept. Its original status labels and mechanics are superseded. See the [current documentation index](../../README.md).

# Game Design Document
## *[Working Title: Doomsday Protocol]*

> You're not playing the game — you're orchestrating it through people before the world ends.

---

## 1. Vision

A systems-driven power simulation where every decision is filtered through advisors with their own agendas, loyalties, and limits — while a global Doomsday Clock ticks toward collapse.

You never act directly. You build power through people. And the faster you climb, the faster the world falls.

**Core tension:** Growth accelerates collapse. Restraint loses the game.

---

## 2. Core Concept

The player controls a rising power figure operating through a small team of advisors. Every action costs time and resources. Every outcome generates consequences. The goal is to achieve total dominance — through business, cult, or political means — before the Doomsday Clock reaches zero.

Three parallel power tracks define the endgame:
- **Capital** — Economic dominance (Business path)
- **Devotion** — Mass belief and loyalty (Cult path)
- **Legitimacy** — Institutional and political control (Political path)

The player pursues one primary path, but all three interact. Neglecting the others entirely creates vulnerabilities.

---

## 3. Player Identity (Onboarding Interview)

Before the game begins, the player completes a 5-question psychological interview. The tone is evaluative, clinical, and slightly unsettling — like being recruited by an organization that already knows more about you than it should.

### Purpose
- Assign a starting archetype (highest scoring power track)
- Generate hidden trait scores
- Seed advisor relationships and early event probability

### Structure
- 5 questions × 3 answer choices each
- No answer is labeled "good" or "bad" — all feel strategic
- Each answer adds hidden weight to power tracks and traits

### Power Tracks (interview feeds into)
| Track | Path |
|---|---|
| Capital | Business |
| Devotion | Cult |
| Legitimacy | Political |

### Trait Scores (interview feeds into)
| Trait | Effect |
|---|---|
| Charisma | Advisor synergy, follower growth |
| Ruthlessness | High-risk action outcomes, Heat generation |
| Discipline | Time efficiency, resource management |
| Vision | Event foresight, long-term modifiers |
| Instability | Random event frequency, advisor volatility |

### Output Logic
- Highest power track → starting archetype
- Traits modify action outcomes, event probability, and advisor compatibility
- High Instability + high Ruthlessness = volatile but powerful early game

### Design Rules
- No question should feel like a personality test
- Every answer should feel like a calculated choice
- Tone: *"We're not judging you. We're calibrating you."*

---

## 4. Resources

### Primary Resources
| Resource | Description |
|---|---|
| Money | Funds actions, bribes, and infrastructure |
| Influence | Social and political leverage |
| Followers | Base of loyalty and labor |
| Legitimacy | Institutional credibility and cover |
| Heat | Suspicion from rivals, press, or authorities |
| Intel | Actionable information about threats and opportunities |

### The Doomsday Clock
A global pressure resource shared by all systems (see Section 8).

### Internal Traits (hidden, player-facing after unlock)
Charisma, Ruthlessness, Discipline, Vision, Instability — generated during onboarding, modified by events and advisor choices throughout the game.

### Resource Relationships
```
Time ↔ Money ↔ Influence ↔ Risk ↔ Power
```
Every action trades one or more of these. No free moves exist.

---

## 5. Advisor System

### Core Rule
**The player never takes actions directly.** All actions are executed through advisors. Advisors are not neutral tools — they have agendas, relationships, and limits.

### Setup
At game start, the player selects 3 advisors from a pool. Advisor choice is shaped by starting archetype and trait scores (some advisors won't align with incompatible players).

### Advisor Structure
Each advisor has:

- **Actions** — discrete moves the player can select; each costs time and resources and produces outcomes
- **Passives** — always-on modifiers affecting time cost, risk, or rewards
- **Modifiers** — system-wide effects (e.g., reduces Heat accumulation globally, increases follower cap)
- **Conflicts** — ideological or personal tensions with other advisors; ignored too long, these escalate

### Advisor Archetypes
| Advisor | Focus | Example Role |
|---|---|---|
| Operator | Capital | Moves money, cuts deals, hides funds |
| Strategist | Politics | Navigates institutions, builds coalitions |
| Evangelist | Devotion | Recruits followers, shapes belief, runs messaging |
| Fixer | Problems | Suppresses threats, cleans up messes |
| Media Head | Perception | Controls narrative, manages Heat |
| Technocrat | Efficiency | Optimizes operations, reduces resource costs |

### Design Principle
Each advisor pushes the player toward a distinct playstyle. Choosing three advisors is the first major strategic decision — and it determines which actions are available for the entire run.

---

## 6. Core Game Loop

Each turn follows this sequence:

```
1. Select an advisor
2. Choose an action from their available menu
3. Pay the action cost (time + resources)
4. Resolve outcomes (stat changes, event triggers, faction reactions)
5. Time advances
6. Doomsday Clock progresses
7. Check for triggered events
```

### Loop Design Goals
- Every decision has a cost — speed, safety, or resources
- No turn should feel consequence-free
- Events should feel like the world responding, not interrupting

---

## 7. Time System

Time is the master resource. All other resources flow through it.

### Structure (choose one at implementation)
- **Option A:** 3–4 action slots per day
- **Option B:** Time blocks — Morning / Afternoon / Night — each allowing 1 action

### Mechanics
- Every action consumes time units
- Advisors modify time cost (some make actions faster, others slower but safer)
- Some events consume a time block without returning value
- Efficiency-focused advisors (Technocrat) compress time costs; chaotic advisors (Fixer) may add time risk

### Strategic Layer
- Rushing → more actions, higher Heat, higher Instability
- Patience → fewer actions, better outcomes, lower risk
- The Doomsday Clock penalizes both extremes in different ways

---

## 8. Doomsday Clock

A global countdown that creates urgency, prevents passive play, and makes success feel morally ambiguous.

### What Advances It
- AI escalation events
- Mass unrest
- War tension
- Player actions that destabilize institutions
- High Instability score
- Certain advisor combinations at peak conflict

### What Slows It
- Legitimacy accumulation
- Specific advisor actions (Strategist's deescalation moves)
- Certain event outcomes

### Endgame Logic
| State | Result |
|---|---|
| Clock reaches zero | Game over — world collapses before victory |
| Player achieves dominance before zero | Win — but at what cost? |
| Player sacrifices growth to slow the clock | Extended survival, harder win |

### The Core Irony
The player's rise accelerates collapse. Total victory means building power on top of a fracturing world. This isn't a bug — it's the point.

---

## 9. Events System

Events are the game's narrative engine. They make the simulation feel alive and reactive.

### Trigger Conditions
- Specific advisor actions taken
- Stat thresholds crossed (Heat too high, Followers spiking, etc.)
- Advisor conflict reaching a breaking point
- Random draws modified by Instability score
- Time progression (world events tied to Clock stages)

### Event Types
| Type | Description |
|---|---|
| Opportunity | A time-limited chance to gain resources, allies, or advantages |
| Crisis | A threat demanding immediate response at a resource cost |
| Advisor Conflict | Internal friction that forces a player decision |
| Faction Reaction | An outside group responds to the player's actions |
| World Event | A global event (independent of player) that reshapes the board |

### Design Goals
- Events should feel like consequences, not interruptions
- Every event should offer a decision, not just a result
- High Instability should produce more unpredictable event chains

---

## 10. Advisor Conflict System

As the game progresses, advisor relationships become a source of risk and drama.

### Mechanics
- Each advisor has compatibility scores with the others
- Opposing ideologies generate friction over time
- Ignored conflicts escalate through stages

### Escalation Stages
```
Tension → Argument → Loyalty Shift → Sabotage → Departure / Betrayal
```

### Example Conflicts
- **Evangelist vs. Technocrat** — belief vs. efficiency; the Evangelist sees the Technocrat as soulless, the Technocrat sees the Evangelist as irrational
- **Fixer vs. Strategist** — brute force vs. institutional maneuvering; their methods directly undermine each other
- **Media Head vs. Fixer** — the Fixer creates exactly the kind of mess the Media Head spends resources cleaning up

### Player Decisions at Conflict Points
- Side with one advisor (the other loses loyalty)
- Force a compromise (costs time and resources)
- Let it play out (risk escalation)

### Why This Matters
Advisor conflict is mid/late-game content that prevents the player from simply optimizing. Relationships become as important as resource counts.

---

## 11. Factions

The world is populated by factions that respond to the player's growing power. They are not controlled by the player — they react.

### Faction Types (examples)
- **Corporate Rivals** — threatened by Capital growth
- **State Actors** — respond to Legitimacy shifts
- **True Believers** — drawn to or repelled by Devotion
- **Independent Press** — amplifies Heat; can be bought or suppressed
- **Underground Networks** — potential allies or threats depending on Fixer use

### Faction Mechanics
- Factions have a disposition score toward the player (hostile → neutral → aligned)
- Player actions shift disposition over time
- Aligned factions provide passive bonuses; hostile factions generate events and Heat
- Factions can be absorbed, suppressed, or converted — each has costs

*Note: Faction depth is a Phase 4 addition. In Phase 1–3, factions exist as event triggers only.*

---

## 12. Win & Loss Conditions

### Win Conditions
Reach dominance on your primary power track before the Doomsday Clock hits zero.

| Path | Win Condition |
|---|---|
| Capital | Control a defined threshold of economic infrastructure |
| Devotion | Reach mass follower count + loyalty score above threshold |
| Legitimacy | Hold institutional control across key governance nodes |

Secondary win states (stretch goals): hybrid path victories, "survived the collapse" endings.

### Loss Conditions
- Doomsday Clock reaches zero
- All advisors depart or are lost
- Core resource (Money / Followers / Legitimacy) collapses to zero
- Player is exposed (Heat maxes, triggering a terminal crisis event)

---

## 13. UI & Visual Design

### Visual Style
- Isometric city view (modular, readable)
- Simplified characters — functional, not decorative
- Aesthetic: clean and information-dense, not animation-heavy

### Core UI Components
| Component | Function |
|---|---|
| Advisor Panel | Shows active advisors, their status, and conflict indicators |
| Action Menu | Contextual list of available actions for the selected advisor |
| Resource Bar | Live display of all primary resources + Doomsday Clock |
| Event Popups | Modal or inline cards for event resolution |
| District/Map View | Visual representation of controlled zones and faction presence |
| Activity Log | Scrollable history of actions taken and outcomes |

### Design Principle
Every pixel should carry information. No decoration that doesn't serve legibility. The UI is part of the game's tone — cold, systematic, controlled.

---

## 14. Tech Stack

### Frontend
| Tool | Role |
|---|---|
| React / Next.js | Application framework |
| TypeScript | Type safety across all game systems |
| Zustand | Global state management |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Targeted UI animations (events, transitions) |

### Data Layer
All game content is JSON-driven and data-separated from logic:
- `advisors.json` — advisor definitions, actions, passives, conflicts
- `actions.json` — action catalog with costs and outcome tables
- `events.json` — event pool with triggers and resolutions
- `factions.json` — faction definitions and disposition logic

### Persistence
- localStorage for short-term session saves
- IndexedDB for full save states (multiple runs, replay support)

### Architecture Principle
Game logic lives in pure functions fed by JSON. UI is a renderer, not a logic layer. This keeps the engine testable and content easy to extend.

---

## 15. Development Phases

### Phase 1 — Core Engine
- Time system
- Resource tracking
- Action resolution loop
- Basic event system
- Win/loss condition logic

### Phase 2 — UI Shell
- Advisor panel
- Action selection menu
- Resource bar
- Event display
- Activity log

### Phase 3 — First Playable (Business Path)
- 3 advisors (Operator, Strategist, Media Head)
- 10–15 actions across advisors
- 20 events
- Business archetype onboarding + Capital win condition

### Phase 4 — Systems Depth
- Faction system (full)
- Advisor conflict escalation
- AI/faction reactive behavior
- Cult and Political archetypes

### Phase 5 — Expansion
- Full advisor roster
- All three archetypes fully playable
- Replay differentiation (meta-progression, run modifiers)
- Alternate endings

---

## 16. Design Principles

**Start small.** One city. Three advisors. One path. Prove the loop before expanding.

**Depth over breadth.** Three meaningful advisors with real conflict and consequence beat ten shallow ones.

**Systems before content.** The loop must feel good before the world gets big. Fun > full.

**Everything has tradeoffs.** No action is free, safe, or universally optimal. Every choice closes a door.

**The world reacts.** Players should feel the simulation is alive — that their actions ripple outward, not just upward.

**Moral weight without moralizing.** The game doesn't judge the player. It shows them the consequences.

---

*Last updated: April 2026*
