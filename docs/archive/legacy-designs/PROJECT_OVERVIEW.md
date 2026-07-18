> **Historical design — not current implementation guidance.** This document preserves an obsolete BRB concept. Its original status labels and mechanics are superseded. See the [current documentation index](../../README.md).

# Political Idle Game — Project Overview

**Status:** Planning Phase
**Target:** Playable demo in 1 week
**Platform:** Web (React) → iOS (React Native/Capacitor) in week 2

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 | Component-based, state management, great for idle games |
| **State** | Context API + useReducer | Simple, built-in, scales to medium complexity |
| **Data** | JSON configs | Advisors, archetypes, actions defined as data, not code |
| **Styling** | Tailwind CSS | Fast UI building, responsive out of the box |
| **Build** | Vite | Fast dev server, instant HMR (hot reload) |
| **Idle Loop** | setInterval + requestAnimationFrame | Lightweight, standard approach |
| **iOS Migration** | Capacitor | Web app → native iOS wrapper (later) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React App Root                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GameContext (Global State Management)                │  │
│  │  - gameState (current archetype, stats, actions)    │  │
│  │  - gameDispatch (update game state)                 │  │
│  │  - tick() function (idle loop)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────┬─────────────────┬──────────────────────┐  │
│  │              │                  │                      │  │
│  ↓              ↓                  ↓                      ↓  │
│ Prologue    GameScreen         ActionPanel          AdvisorPanel
│ (Character  (Main Game)        (Action List)        (Commentary)
│  Creation)  - Timers          - Buttons & Costs
│            - Resources        - Progress bars
│            - Status display   - Confirmation dialogs
│
└─────────────────────────────────────────────────────────────┘

Config Files (Data Layer):
  - archetypes.json (Politician, Televangelist, etc.)
  - advisors.json (Bundler, Pollster, etc.)
  - actions.json (Buy Ads, Rally, Take Donation, etc.)
  - gameRules.json (Win/loss conditions, resource rates)
```

---

## Project Structure

```
political-idle-game/
├── src/
│   ├── App.jsx                    # Root component
│   ├── context/
│   │   └── GameContext.jsx        # Global game state + dispatch
│   ├── hooks/
│   │   ├── useGameLoop.js         # Manages idle tick/interval
│   │   ├── useLocalStorage.js     # Save/load game state
│   │   └── useActions.js          # Action execution logic
│   ├── components/
│   │   ├── Prologue.jsx           # Interview/character creation
│   │   ├── GameScreen.jsx         # Main game container
│   │   ├── StatusBar.jsx          # Resources (Money, Influence, Approval)
│   │   ├── ActionPanel.jsx        # List of available actions
│   │   ├── ActionButton.jsx       # Individual action with timer
│   │   ├── AdvisorPanel.jsx       # Advisor comments & reactions
│   │   └── Modal.jsx              # Confirmation/info dialogs
│   ├── config/
│   │   ├── archetypes.json        # Archetype definitions
│   │   ├── advisors.json          # Advisor personalities & perks
│   │   ├── actions.json           # Action definitions
│   │   └── gameRules.json         # Win/loss thresholds
│   ├── utils/
│   │   ├── gameLogic.js           # Calculate resource gen, check win/loss
│   │   ├── advisorComments.js     # Map game events to advisor reactions
│   │   └── formatting.js          # Format numbers, timers, etc.
│   └── styles/
│       └── globals.css            # Global styles (Tailwind imports)
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Core Game Systems

### System 1: Game State (GameContext)

The source of truth. Holds:

```javascript
{
  // Game phase
  currentPhase: 'prologue' | 'game' | 'won' | 'lost',

  // Player character
  archetype: 'politician' | 'televangelist' | ... ,
  archetypeStats: {
    charisma: 3,
    faith: 1,
    ambition: 5,
    empathy: 1
  },

  // Resources (idle loop will tick these)
  money: 1000,
  influence: 100,
  approval: 500,

  // Advisors
  advisors: [
    { id: 'bundler', hired: true, level: 1 },
    { id: 'pollster', hired: true, level: 1 },
    // ...
  ],

  // Active action
  activeAction: {
    id: 'buy_ads',
    startTime: Date.now(),
    baseDuration: 3600000, // 1 hour in ms
    costMultiplier: 1.0,
    resourcesSpent: { money: 5000, influence: 0, approval: 0 }
  } | null,

  // Game stats
  followerCount: 0,
  eventLog: [
    { time: '10:30 AM', message: 'Ad campaign launched', advisor: 'bundler' }
  ],

  // Win/loss tracking
  winCondition: { type: 'followers', target: 10000, current: 0 },
  lossFlag: null // 'irrelevance' | 'whistleblower' | 'cascade'
}
```

**Why this structure:**
- Single source of truth
- Easy to save/load (JSON serializable)
- Easy to test (pure data)
- Easy to expand (add new fields)

---

### System 2: The Idle Loop

Every game tick (500ms or 1s):

```javascript
const tick = () => {
  // 1. Generate passive resources
  const passiveResources = calculatePassiveGeneration(
    gameState.advisors,
    gameState.archetype,
    gameState.approval  // approval affects generation rates
  )

  // 2. Decrement active action timer
  if (gameState.activeAction) {
    const elapsed = Date.now() - gameState.activeAction.startTime
    const duration = gameState.activeAction.baseDuration

    if (elapsed >= duration) {
      completeAction(gameState.activeAction.id)
    } else {
      updateActionProgress(elapsed / duration)
    }
  }

  // 3. Check win/loss conditions
  checkWinCondition(gameState)
  checkLossCondition(gameState)

  // 4. Apply state changes
  updateGameState({ ...gameState, ...newResources })
}

// Runs every 500ms
const gameLoopInterval = setInterval(tick, 500)
```

**Expansion point:** Add event triggers here. "Every 5 minutes, random scandal event triggers."

---

### System 3: Actions

Actions are **data-driven**. Each action has:

```javascript
// config/actions.json
{
  "buy_ads": {
    id: "buy_ads",
    name: "Buy Ads",
    description: "Flood the market with your message.",
    baseCost: { money: 5000, influence: 0, approval: 0 },
    baseDuration: 3600000, // 1 hour
    unlocks: ['televangelist', 'politician'], // available to these archetypes
    advisorSpeedBonus: { bundler: 0.8 }, // bundler makes it 20% faster
    onComplete: {
      approval: 500,
      followerGain: 50
    },
    advisorComment: {
      bundler: "That's the spirit. Money talks.",
      pollster: "Approval bumped. We're trending.",
      mirror: "You're buying people now. Nice."
    }
  }
}
```

**Why this structure:**
- New action? Add JSON object. Done.
- Tweak balance? Edit JSON, refresh.
- Advisor bonuses? Add to `advisorSpeedBonus`.
- Reactions? Map in `advisorComment`.

---

### System 4: Advisors

Advisors are **modular**. Each has:

```javascript
// config/advisors.json
{
  "bundler": {
    id: "bundler",
    name: "The Bundler",
    archetype: "politician",
    personality: "Cheerfully corrupt. Never asks questions.",
    trait: "money_specialist", // speeds up money actions
    defaultComment: "That's the spirit. Money talks.",
    reactions: {
      "low_approval": "We're losing them. Time to spend.",
      "action_completed": "Beautiful. Clean work.",
      "loss_flag_triggered": "Well, this is awkward."
    },
    // Expansion: unlock conditions
    unlockCondition: null, // available from start
    // unlockCondition: { type: 'money_spent', threshold: 50000 }
  }
}
```

**Expansion point:** Add `unlockCondition` to gate advisors. "Fixer unlocks after $100k dark money."

---

## Data Flow Example: Player Clicks "Buy Ads"

```
1. User clicks "Buy Ads" button in ActionPanel
   ↓
2. ActionButton component dispatches action:
   dispatch({ type: 'START_ACTION', payload: { actionId: 'buy_ads' } })
   ↓
3. GameContext reducer:
   - Reads action config from actions.json
   - Deducts cost from resources
   - Creates activeAction with timer
   - Gets advisor bonus from advisors.json
   - Sets new baseC duration with multiplier
   ↓
4. UI updates:
   - ActionPanel shows "Buy Ads" is in progress
   - ActionButton shows progress bar + time remaining
   - StatusBar updates resources
   ↓
5. Idle loop ticks (every 500ms):
   - Checks if action is complete
   - If complete: dispatch({ type: 'COMPLETE_ACTION' })
   ↓
6. On completion:
   - Apply onComplete effects (approval +500, followers +50)
   - Trigger advisor comments
   - Trigger win/loss checks
   - Clear activeAction
   ↓
7. UI updates again:
   - Progress bar disappears
   - New resources displayed
   - Advisor comment appears
```

---

## Week-by-Week Build Plan

### **Week 1: MVP (Core Loop)**

| Day | Focus | Deliverable |
|---|---|---|
| **Day 1-2** | Setup + Prologue | React project, Vite config, Prologue scene with 5 questions → sets archetype |
| **Day 2-3** | Game State + Loop | GameContext, idle loop (setInterval), passive resource generation |
| **Day 3-4** | Actions System | ActionPanel with 3 actions, timers, costs, progress bars |
| **Day 4-5** | Advisors | AdvisorPanel, advisor comments, advisor speed bonuses |
| **Day 5-6** | Win/Loss Logic | Check win condition (e.g., 10k followers), check loss condition (Irrelevance) |
| **Day 6-7** | Polish + Test | UI polish, save/load state, mobile responsiveness, test on iPhone browser |

**End of Week 1:** Playable demo with Politician archetype, 3 actions, 2 advisors, working win condition.

---

### **Week 2: iOS Migration + Refinement**

- Wrap React app in Capacitor
- Test on actual iOS device
- Add Televangelist archetype
- Refine balance
- Add more advisor comments

---

### **Week 3+: Expansion**

- Add remaining archetypes (Cult Leader, Oligarch, Demagogue)
- Add True Win conditions
- Add prestige/NG+ system
- Add The Convergence endgame

---

## Expansion Points (Where to Add Stuff Later)

### Adding a New Archetype
1. Add entry to `config/archetypes.json`
2. Add advisor set to `config/advisors.json`
3. Add archetype-specific actions to `config/actions.json`
4. Create new Prologue question that unlocks it
5. Done.

### Adding a New Advisor
1. Add to `config/advisors.json`
2. Assign to archetype
3. Add speed bonuses to relevant actions
4. Add reactions to game events
5. Done.

### Adding a New Action
1. Add to `config/actions.json`
2. Set baseCost, baseDuration, onComplete effects
3. Add advisor comment reactions
4. Done.

### Adding Events (Advanced)
- Add to idle loop: "Every 300 ticks, random scandal triggers"
- Modifies game state, triggers advisor comments
- Can trigger loss conditions

---

## Key Design Decisions

| Decision | Why |
|---|---|
| **Context API, not Redux** | Simpler for MVP, scales to this complexity |
| **JSON configs, not hardcoded** | Easy to balance, easy to expand |
| **500ms tick, not 1s** | Feels responsive without performance cost |
| **Single active action** | Simpler UI, matches idle game pattern |
| **No real-time sync** | Single player, save to localStorage |
| **Capacitor for iOS** | Zero code changes, web wraps to iOS |

---

## Testing Checklist (Week 1 End)

- [ ] Prologue loads, sets archetype correctly
- [ ] Idle loop ticks resources
- [ ] Actions execute, cost resources, complete after timer
- [ ] Advisors get hired, give speed bonuses
- [ ] Advisor comments appear on actions
- [ ] Win condition triggers at 10k followers
- [ ] Loss condition triggers (approval = 0)
- [ ] Save/load state works
- [ ] Mobile responsive on iPhone browser
- [ ] No console errors

---

## Definitions

**Archetype:** The character class (Politician, Televangelist, etc.). Determines advisor set and action availability.

**Advisor:** Passive helper that speeds up certain actions and gives commentary. Costs to hire.

**Action:** Player-initiated task with cost, duration, and reward. Can be sped up by spending resources.

**Idle Loop:** The 500ms game tick that generates resources, progresses timers, checks win/loss.

**Win Condition:** Goal state (10k followers, $100k, etc.). Depends on archetype.

**Loss Condition:** Failure state (Approval = 0, Whistleblower, etc.). Game transitions to epilogue.

---

## Next Steps

1. ✅ Read this document (you are here)
2. → Create React project & install deps
3. → Build Prologue component
4. → Build GameContext & idle loop
5. → Build ActionPanel & timers
6. → Iterate

Ready to start coding? Or any questions on the architecture?
