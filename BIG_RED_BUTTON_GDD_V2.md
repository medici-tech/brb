# Big Red Button — Game Design Document (Complete)

**Title:** Big Red Button
**Genre:** Political Idle Game with Resource Strategy
**Platform:** Web (React) → iOS (Capacitor) Week 2
**Status:** Final Design Document
**Version:** 2.0 - Complete

---

## 1. Design Philosophy

### What This Game Is
A satisfying idle game where you build political/cultural power through strategic resource management and advisor-driven actions. Satire enhances the experience but doesn't overshadow it — the game is fun to play first, darkly funny second.

### What This Game Isn't
- NOT a story-first narrative game (Disco Elysium is companion inspiration, not blueprint)
- NOT a pure satire simulator (fun gameplay comes before message)
- NOT a game where players feel they wasted time (progression is rewarding)

### Player Experience
Players should feel:
1. **Powerful:** Resources grow, followers increase, you're building something
2. **Strategic:** Choosing which advisor actions matter, managing resource balance
3. **Challenged:** Resources can collapse, actions can fail, consequences matter
4. **Amused:** Darkly funny copy and character voices enhance, not distract

---

## 2. Eight-Resource Economy

### Core Resources (4)

| Resource | Represents | Generation | Usage | Notes |
|---|---|---|---|---|
| **Money** | Cash, donations, bribes, speaking fees | Passive idle + actions | Speeds almost all actions | Universal accelerant |
| **Influence** | Political favors, leverage, relationships | Actions with allies | Political/backroom actions | Slows if allies leave |
| **Approval** | Public support, polling, votes | Public actions, media | Public-facing actions | Volatile, event-sensitive |
| **Organization** | Infrastructure, facilities, offices, compound | Growth actions, time | Unlocks new action tiers | Scales your capacity |

### Situational Resources (4) — Rise/Fall Based on Events & Choices

| Resource | Represents | Affects | Changes When |
|---|---|---|---|
| **Reputation/Credibility** | How trustworthy you seem | Success of promises, pledges | You lie, make scandals, break promises → drops. You deliver → rises. |
| **Loyalty/Control** | How much actual power over followers | Follower actions succeed, obedience | You reward followers → rises. You exploit them → drops. Crisis events lower it. |
| **Media Presence** | How much you're in news cycle | Viral actions, publicity | Public actions, scandals → rises. Ignored → drops slowly. |
| **Secrets/Dirt** | Blackmail material you've gathered | Sabotage actions, leverage | Gather intelligence → rises. Use blackmail → falls. Opponent reveals → drops. |

### Generation Model

**Passive Generation (every idle tick, 500ms):**
- Money: +1 per tick (~3,600/min)
- Influence: +0.5 per tick
- Approval: +0.3 per tick
- Organization: +0.1 per tick (very slow growth)

**Situational Resources (NO passive generation):**
- Reputation/Credibility: Only changes through actions/events
- Loyalty/Control: Only changes through advisor actions
- Media Presence: Only changes through public actions or scandals
- Secrets/Dirt: Only changes through intelligence gathering or use

**Multipliers:**
- High Approval → All resources generate 10-30% faster
- High Organization → Unlock higher-tier actions
- High Loyalty → Followers work for reduced cost

---

## 3. Action System: Advisor-Driven Menus

### How It Works

Players don't have a generic "Actions" list. Instead:
1. **Click an advisor** → Their personal action menu opens
2. **Select an action** → See cost and resource requirements
3. **Attempt action** → Outcome depends on resource levels (Success/Partial/Fail/Backfire)
4. **Advisors specialize** in different action types based on their archetype role

### Action Outcome System

Every action has a **base success probability** and multiple outcomes:

```
Action: "Sabotage Rival" (The Oppo Guy, Politician)
├─ Cost: 2k Money + 100 Influence
├─ Requires: 50+ Secrets/Dirt to attempt
├─ Duration: 4 hours
│
├─ If Secrets/Dirt ≥ 150 (Excellent):
│  └─ CRITICAL SUCCESS: Rival loses 500 followers, you gain credibility
│
├─ If Secrets/Dirt 50-150 (Good):
│  └─ SUCCESS: Rival loses 200 followers, action completes
│
├─ If Secrets/Dirt 20-50 (Weak):
│  └─ PARTIAL SUCCESS: Scandal is weak, rival loses 50 followers only
│
├─ If Secrets/Dirt < 20 (Insufficient):
│  └─ FAILURE: Action attempted but fails, resources wasted
│
└─ BACKFIRE (rare, if you try during rival's high credibility):
   └─ Backfire: Your reputation takes hit, lose 100 credibility
```

This creates **meaningful gameplay decisions:**
- Do I attempt this sabotage with weak intel? (Risk wasting resources)
- Should I gather more dirt first? (Takes time, action waits)
- Is the risk worth it? (Resource-to-reward calculation)

---

## 4. The Five Archetypes & Their Advisors

### 🏛️ POLITICIAN

**Win Condition:** Reach 10,000 followers (standard) OR press Big Red Button with resources

**Starting Resources:**
- Money: 2,000
- Influence: 150
- Approval: 1,000
- Organization: 50

**Advisor Roster:**

| Advisor | Role | Specialty | Actions |
|---|---|---|---|
| **The Bundler** | Money specialist | Campaign finance | "Buy Ads", "Host Fundraiser", "Dark Money Deal" |
| **The Pollster** | Approval specialist | Public opinion | "Commission Poll", "Spin Story", "Rally Supporters" |
| **The Party Whip** | Influence specialist | Party loyalty | "Call Favors", "Broker Deal", "Pressure Ally" |
| **The Oppo Guy** | Intelligence specialist | Opposition research | "Sabotage Rival", "Leak Documents", "Spread Rumor" |

**Advisor-Specific Actions:**

**The Bundler Menu:**
- "Buy Ads" (Cost: 5k Money | Duration: 1hr | Reward: +500 App, +50 followers)
- "Host Fundraiser" (Cost: 2k Money, 100 Influence | Duration: 2hrs | Reward: +3k Money, +200 followers)
- "Dark Money Deal" (Cost: None | Duration: 30min | Reward: +5k Money, -100 Reputation if caught)

**The Pollster Menu:**
- "Commission Poll" (Cost: 1k Money | Duration: 1hr | Reward: +100 Reputation)
- "Spin Story" (Cost: 500 Money, 50 Influence | Duration: 2hrs | Reward: +300 Approval, costs Loyalty if too many spins)
- "Rally Supporters" (Cost: 2k Money, 50 Influence | Duration: 2hrs | Reward: +1000 Approval, +100 followers)

**The Party Whip Menu:**
- "Call Favors" (Cost: 100 Influence | Duration: 1hr | Reward: +2k Money, -50 Loyalty if excessive)
- "Broker Deal" (Cost: 50 Influence | Duration: 30min | Requires: 100+ Reputation | Reward: +1k Money, +500 Approval)
- "Pressure Ally" (Cost: 150 Influence | Duration: 2hrs | Requires: 50+ Secrets | Reward: Ally complies with action)

**The Oppo Guy Menu:**
- "Gather Intel" (Cost: 1k Money | Duration: 1hr | Reward: +50 Secrets/Dirt)
- "Sabotage Rival" (Cost: 2k Money, 100 Influence | Duration: 4hrs | Requires: 50+ Secrets | Outcome: Rival loses followers based on Secrets amount)
- "Leak Documents" (Cost: None | Duration: 2hrs | Requires: 100+ Secrets | Reward: +300 Approval, -100 Secrets, -200 Reputation if traced back)

---

### 📺 TELEVANGELIST

**Win Condition:** 50M followers + $1B network value (future) OR press Big Red Button

**Starting Resources:**
- Money: 1,500
- Influence: 50
- Approval: 2,000 (higher baseline)
- Organization: 30

**Advisor Roster:**

| Advisor | Role | Specialty | Actions |
|---|---|---|---|
| **The Producer** | Media specialist | Broadcast presence | "Air Sermon", "Host Event", "Media Blitz" |
| **The Deacon** | Faith specialist | Spiritual authority | "Preach", "Blessing Ceremony", "Recruit Clergy" |
| **The Tax Lawyer** | Finance specialist | Money laundering | "Reclassify Donation", "Open Shell Charity", "Tax Shelter" |
| **The Healed** | Testimonial specialist | Social proof | "Promote Testimony", "Create Miracle Story", "Recruit Ambassador" |

**Key Mechanic:** Reputation/Credibility is CRITICAL. If credibility drops below 50, followers leave faster.

---

### 🏕️ CULT LEADER

**Win Condition:** 1,000 loyal followers + self-sufficient compound (future) OR press Big Red Button

**Starting Resources:**
- Money: 800
- Influence: 100
- Approval: 500
- Organization: 20

**Advisor Roster:**

| Advisor | Role | Specialty | Actions |
|---|---|---|---|
| **The Recruiter** | Growth specialist | Follower expansion | "Recruit", "Host Retreat", "Love Bomb" |
| **The Keeper** | Loyalty enforcer | Internal control | "Enforce Loyalty", "Isolate Doubters", "Purification Ritual" |
| **The Architect** | Infrastructure builder | Compound growth | "Build Facility", "Expand Compound", "Self-Sufficiency Drive" |
| **The Doubter** | Mirror advisor | Conscience/risk | Cannot be fired, provides insight into failures |

**Key Mechanic:** Loyalty/Control is PRIMARY. High Loyalty = followers obey. Low Loyalty = mass defection events.

---

### 💰 OLIGARCH

**Win Condition:** Control 3 of 5 major institutions (future) OR press Big Red Button

**Starting Resources:**
- Money: 5,000 (highest)
- Influence: 200
- Approval: 200 (lowest)
- Organization: 100 (highest)

**Advisor Roster:**

| Advisor | Role | Specialty | Actions |
|---|---|---|---|
| **The Fixer** | Problem solver | Crisis management | "Suppress Scandal", "Eliminate Threat", "Bribe Official" |
| **The CFO** | Finance wizard | Money management | "Launder Money", "Create LLC", "Offshore Funds" |
| **The Senator** | Political arm | Government access | "Lobby Bill", "Install Puppet", "Buy Influence" |
| **The PR Strategist** | Reputation manager | Image control | "Spin Scandal", "Media Campaign", "Rebrand" |

**Key Mechanic:** Secrets/Dirt is currency. Gathering and using blackmail is core gameplay.

---

### 📢 DEMAGOGUE

**Win Condition:** Declare national emergency + renew indefinitely (future) OR press Big Red Button

**Starting Resources:**
- Money: 1,200
- Influence: 50
- Approval: 3,000 (highest)
- Organization: 40

**Advisor Roster:**

| Advisor | Role | Specialty | Actions |
|---|---|---|---|
| **The Propagandist** | Narrative specialist | Mass belief | "Spread Narrative", "Amplify Fear", "Rewrite History" |
| **The Organizer** | Logistics genius | Movement building | "Organize Rally", "Mobilize Base", "Create Crisis" |
| **The Scapegoat** | Rotation sacrifice | Blame management | "Create Scapegoat", "Blame Minority", "Deflect Crisis" |
| **The General** | Military option (late unlock) | Force projection | "Martial Law", "Take Control", "Emergency Powers" |

**Key Mechanic:** Media Presence and Loyalty/Control are primary. Demagogues win through mass movement, not institutions.

---

## 5. Big Red Button: The Nuclear Option

### Unlock Conditions
- Followers ≥ 5,000
- Money ≥ $25,000
- Approval ≥ 2,000
- All archetypes: ≥ 20 minutes elapsed

### What It Does

**If pressed with sufficient resources (Victory):**
- Immediate win
- Epilogue text reflects archetype
- Politician: "Martial law declared. Democracy suspended."
- Televangelist: "Rapture revival. All-in moment."
- Cult Leader: "Compound sealed. No one leaves."
- Oligarch: "Financial takeover. Assets consolidated."
- Demagogue: "Emergency powers. Indefinite rule."

**If pressed with insufficient resources (Mutual Destruction):**
- Instant loss
- Everything collapses simultaneously
- Final advisor comment: "You brought the house down."

### Visual
- Pulsing red button in corner when available
- Confirmation modal: "Irreversible action. Are you sure?"
- Major consequence either way

---

## 6. Idle Loop (500ms Tick)

```javascript
function gameTick() {
  // 1. Passive resource generation (core resources only)
  gameState.money += 1
  gameState.influence += 0.5
  gameState.approval += 0.3
  gameState.organization += 0.1

  // 2. Apply multipliers
  if (gameState.approval > 5000) {
    gameState.money *= 1.15  // High approval helps all resources
  }

  // 3. Progress active action timer
  if (gameState.activeAction) {
    const elapsed = now() - gameState.activeAction.startTime
    if (elapsed >= gameState.activeAction.duration) {
      completeAction(gameState.activeAction)
      // Adjust situational resources based on action
      // Example: "Spread Rumor" reduces Reputation
    } else {
      updateProgressBar(elapsed / duration)
    }
  }

  // 4. Check Big Red Button unlock
  if (shouldShowButton()) {
    gameState.bigRedButtonAvailable = true
  }

  // 5. Check win condition
  if (gameState.followers >= 10000) {
    triggerWin()
  }

  // 6. Check loss conditions
  if (gameState.money <= 0 && gameState.approval <= 0) {
    triggerLoss('irrelevance')
  }

  // 7. Random events (future)
  // if (Math.random() < 0.001) { triggerRandomEvent() }

  // 8. Save game
  if (gameState.tickCount % 10 === 0) {
    saveGameState()
  }

  gameState.tickCount++
}

setInterval(gameTick, 500)
```

---

## 7. Kairosoft Visual Progression

The UI evolves as player grows from grassroots to absolute power.

### Four Stages

| Stage | Followers | Visual Shift |
|---|---|---|
| **Grassroots** | 0-2,000 | Minimal, flat, gray, desperate feeling |
| **Rising** | 2,000-5,000 | Brand colors appear, subtle depth, ambition |
| **Consolidating** | 5,000-8,000 | Gold accents, ornate borders, celebratory |
| **Absolute Power** | 8,000-10,000 | Grotesque, over-saturated, unhinged aesthetic |

**Changes:**
- Advisor portraits: 16x16 → 24x24 → 32x32 → 48x48 (grotesque)
- Borders: None → Thin → Medium → Baroque nightmare
- Colors: Grays → Reds/Blues → Gold → Oversaturated blood red + gold
- Background: Empty → Furnished → Palace → Absurd throne room

---

## 8. Game State Structure

```javascript
{
  gamePhase: 'prologue' | 'game' | 'won' | 'lost',
  archetype: 'politician' | 'televangelist' | 'cult_leader' | 'oligarch' | 'demagogue',

  // Core Resources
  money: 5000,
  influence: 150,
  approval: 1200,
  organization: 50,

  // Situational Resources
  reputation: 100,           // 0-200 scale
  loyalty: 100,              // 0-200 scale
  mediaPresence: 50,         // 0-200 scale
  secretsDirt: 25,           // 0-200 scale

  // Progress
  followers: 450,
  hiredAdvisors: [
    { id: 'bundler', level: 1, available: true }
  ],

  // Active Action
  activeAction: {
    id: 'buy_ads',
    advisorId: 'bundler',
    startTime: timestamp,
    duration: 3600000,
    cost: { money: 5000, influence: 0, approval: 0 },
    situationalCost: { reputation: 0, loyalty: 0 },
    successOutcome: 'success' | 'partial' | 'fail' | 'backfire'
  } | null,

  // Big Red Button
  bigRedButtonAvailable: false,
  bigRedButtonPressed: false,

  // Game meta
  elapsedSeconds: 3600,
  tickCount: 7200,
  eventLog: []
}
```

---

## 9. MVP Scope (Playable Demo)

### Week 1 Deliverable: Politician Archetype

**In Scope:**
- ✅ Prologue (5 questions → Politician archetype)
- ✅ Four core resources (Money, Influence, Approval, Organization) with passive generation
- ✅ Advisor action menus (The Bundler, The Pollster, The Party Whip, The Oppo Guy)
- ✅ 12 total actions (3 per advisor) with timers
- ✅ Situational resources (Reputation, Loyalty, Media Presence, Secrets) that change through actions
- ✅ Resource-dependent outcomes (Success/Partial/Fail for key actions)
- ✅ Big Red Button with two outcomes (Victory/Mutual Destruction)
- ✅ Win condition: 10,000 followers OR button press (sufficient resources)
- ✅ Loss condition: Money + Approval both 0 OR button press (insufficient resources)
- ✅ Kairosoft visual progression (4 stages)
- ✅ Save/load via localStorage
- ✅ Mobile responsive

**Out of Scope (Future):**
- ❌ Additional archetypes (Televangelist, Cult Leader, Oligarch, Demagogue)
- ❌ True Win conditions per archetype
- ❌ Random events / crisis system
- ❌ Advisor leveling / upgrades
- ❌ Advanced advisor bonuses
- ❌ New Game+ / Prestige system
- ❌ The Convergence meta-ending
- ❌ iOS native app (wrap with Capacitor in Week 2)

### Realistic MVP Timeline

| Day | Focus |
|---|---|
| **Day 1** | Setup + Prologue (character creation) |
| **Day 2** | GameContext + idle loop (resources tick) |
| **Day 3** | Advisor system + action menus (UI) |
| **Day 4** | Action execution + timers + advisor comments |
| **Day 5** | Situational resources + action outcomes (Success/Fail logic) |
| **Day 6** | Big Red Button + win/loss conditions |
| **Day 7** | Polish + visual progression + mobile test |

---

## 10. Success Criteria

### Technical
- [ ] React app loads in <2 seconds
- [ ] Prologue sets archetype correctly
- [ ] Idle loop ticks every 500ms without lag
- [ ] Core resources generate passively at correct rates
- [ ] Advisor action menus work (click advisor → menu opens)
- [ ] Actions cost correct resources and complete on timer
- [ ] Situational resources change based on actions
- [ ] Outcomes vary (Success vs Partial vs Fail based on situational resources)
- [ ] Big Red Button unlocks at correct thresholds
- [ ] Win condition triggers at 10k followers
- [ ] Loss condition triggers when resources deplete
- [ ] Save/load works via localStorage
- [ ] Mobile responsive (iPhone Safari)

### Gameplay
- [ ] Progression feels rewarding (followers tick up, money grows)
- [ ] Actions feel consequential (outcome varies, not guaranteed)
- [ ] Advisor menus feel natural (not clunky UI)
- [ ] Resource balance feels right (can't spam actions indefinitely)
- [ ] First playthrough reaches win condition in 30-40 minutes

### Design
- [ ] Satire enhances, doesn't distract
- [ ] Tone is consistent (cynical but not preachy)
- [ ] Visual progression is noticeable (UI evolves)
- [ ] UI is clear (no confusing states)

---

## 11. Technical Stack

- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Context API + useReducer
- **Storage:** localStorage
- **Idle Loop:** setInterval (500ms)
- **iOS Migration:** Capacitor (Week 2)

---

## 12. Post-MVP Roadmap

### Week 2: iOS + Refinement
- Wrap in Capacitor for iOS
- Add Televangelist archetype
- Refine balance

### Week 3: More Archetypes
- Add Cult Leader, Oligarch, Demagogue
- Implement True Win conditions

### Month 2: Advanced Features
- Random events / crises
- Advisor leveling
- Prestige system
- The Convergence meta-ending

---

## Final Approval Questions

1. ✅ Does the advisor action menu system feel right?
2. ✅ Do the eight resources feel balanced?
3. ✅ Does the outcome system (Success/Partial/Fail/Backfire) add good gameplay?
4. ✅ Is Politician archetype enough for MVP?
5. ✅ Ready to build?

---

**Status:** ⏳ PENDING FINAL APPROVAL FOR BUILD
