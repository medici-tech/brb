import type {
  GameState,
  Resources,
  BRBTracks,
  AdvisorId,
  AdvisorRuntimeState,
  ResourceCost,
  ResourceEffect,
  AdvisorEffect,
  LogEntry,
} from '../types';
import { ADVISOR_ACTIONS } from '../data/advisorActions';
import { DEPOSITS } from '../data/deposits';
import { RECOVERY_ACTIONS } from '../data/recoveryActions';
import { ADVISORS } from '../data/advisors';
import { buildInitialState } from './initialState';
import { performCPUMove } from './cpu';
import { maybePickEvent } from './events';
import { resolveEnding, resolveLossEnding, resolveTurnLimitEnding } from './endings';
import { canActivateBRB, checkLossConditions, clamp } from './calculations';
import { BALANCE } from './balance';

// ── Action types ──────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'CHOOSE_ARCHETYPE'; archetypeId: string }
  | { type: 'TAKE_ADVISOR_ACTION'; actionId: string }
  | { type: 'TAKE_DEPOSIT'; depositId: string }
  | { type: 'TAKE_RECOVERY'; recoveryId: string }
  | { type: 'ACTIVATE_BRB' }
  | { type: 'RESTART' };

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyResourceCost(resources: Resources, cost: ResourceCost): Resources {
  return {
    money: resources.money - (cost.money ?? 0),
    influence: clamp(resources.influence - (cost.influence ?? 0), 0, 999),
    intel: clamp(resources.intel - (cost.intel ?? 0), 0, 999),
    trust: clamp(resources.trust - (cost.trust ?? 0), 0, 999),
    stress: clamp(resources.stress + (cost.stress ?? 0), 0, BALANCE.MAX_STRESS_CAP),
    panic: clamp(resources.panic + (cost.panic ?? 0), 0, BALANCE.MAX_PANIC_CAP),
  };
}

function applyResourceEffect(resources: Resources, effect: ResourceEffect): Resources {
  return {
    money: resources.money + (effect.money ?? 0),
    influence: clamp(resources.influence + (effect.influence ?? 0), 0, 999),
    intel: clamp(resources.intel + (effect.intel ?? 0), 0, 999),
    trust: clamp(resources.trust + (effect.trust ?? 0), 0, 999),
    stress: clamp(resources.stress + (effect.stress ?? 0), 0, BALANCE.MAX_STRESS_CAP),
    panic: clamp(resources.panic + (effect.panic ?? 0), 0, BALANCE.MAX_PANIC_CAP),
  };
}

function applyBRBEffect(brb: BRBTracks, effect: ResourceEffect): BRBTracks {
  return {
    engineering: clamp(brb.engineering + (effect.engineering ?? 0), BALANCE.MIN_BRB_TRACK, BALANCE.MAX_BRB_TRACK),
    access: clamp(brb.access + (effect.access ?? 0), BALANCE.MIN_BRB_TRACK, BALANCE.MAX_BRB_TRACK),
    legitimacy: clamp(brb.legitimacy + (effect.legitimacy ?? 0), BALANCE.MIN_BRB_TRACK, BALANCE.MAX_BRB_TRACK),
    stability: clamp(brb.stability + (effect.stability ?? 0), BALANCE.MIN_BRB_TRACK, BALANCE.MAX_BRB_TRACK),
  };
}

function applyAdvisorEffects(
  advisors: Record<AdvisorId, AdvisorRuntimeState>,
  effects: AdvisorEffect[]
): Record<AdvisorId, AdvisorRuntimeState> {
  let result = { ...advisors };
  for (const fx of effects) {
    const cur = result[fx.advisorId];
    const newLoyalty = fx.loyalty !== undefined
      ? clamp(cur.loyalty + fx.loyalty, BALANCE.MIN_LOYALTY, cur.loyaltyCeiling)
      : cur.loyalty;
    result = {
      ...result,
      [fx.advisorId]: {
        ...cur,
        loyalty: newLoyalty,
        alignment: fx.alignment !== undefined
          ? clamp(cur.alignment + fx.alignment, BALANCE.MIN_ALIGNMENT, BALANCE.MAX_ALIGNMENT)
          : cur.alignment,
        leverage: fx.leverage !== undefined
          ? clamp(cur.leverage + fx.leverage, BALANCE.MIN_LEVERAGE, BALANCE.MAX_LEVERAGE)
          : cur.leverage,
      },
    };
  }
  return result;
}

function canAffordCost(resources: Resources, cost: ResourceCost): boolean {
  if (cost.money !== undefined && resources.money < cost.money) return false;
  if (cost.influence !== undefined && resources.influence < cost.influence) return false;
  if (cost.intel !== undefined && resources.intel < cost.intel) return false;
  if (cost.trust !== undefined && resources.trust < cost.trust) return false;
  return true;
}

function addLog(state: GameState, text: string, type: LogEntry['type']): GameState {
  const entry: LogEntry = { id: state.logIdCounter, turn: state.turn, text, type };
  return {
    ...state,
    logIdCounter: state.logIdCounter + 1,
    eventLog: [entry, ...state.eventLog],
  };
}

function applyAdvisorDecay(state: GameState): GameState {
  const advisorDefs = ADVISORS;
  let advisors = { ...state.advisors };

  for (const def of advisorDefs) {
    const cur = advisors[def.id];
    let alignment = cur.alignment;
    let loyalty = cur.loyalty;

    // Alignment decays toward 0 by 5 points
    if (alignment > 0) alignment = Math.max(0, alignment - BALANCE.ALIGNMENT_DECAY_TOWARD_ZERO);
    else if (alignment < 0) alignment = Math.min(0, alignment + BALANCE.ALIGNMENT_DECAY_TOWARD_ZERO);

    // Loyalty above ceiling decays
    if (loyalty > cur.loyaltyCeiling) {
      loyalty = Math.max(cur.loyaltyCeiling, loyalty - BALANCE.LOYALTY_ABOVE_CEILING_DECAY);
    }

    advisors = { ...advisors, [def.id]: { ...cur, alignment, loyalty } };
  }

  return { ...state, advisors };
}

function advanceTurn(stateAfterAction: GameState): GameState {
  let s = stateAfterAction;

  // 1. CPU move
  const { newState: afterCPU, entry: cpuEntry } = performCPUMove(s);
  s = { ...afterCPU, eventLog: [cpuEntry, ...afterCPU.eventLog] };

  // 2. Maybe trigger event
  const event = maybePickEvent(s);
  if (event) {
    s = addLog(s, `EVENT — ${event.title}: ${event.narrative}`, 'event');
    s = { ...s, resources: applyResourceEffect(s.resources, event.resourceEffect) };
    s = { ...s, brb: applyBRBEffect(s.brb, event.resourceEffect) };
    s = { ...s, advisors: applyAdvisorEffects(s.advisors, event.advisorEffects) };
    if (event.cpuProgressDelta) {
      s = { ...s, cpu: { ...s.cpu, progress: clamp(s.cpu.progress + event.cpuProgressDelta, 0, 100) } };
    }
  }

  // 3. Advisor decay every N turns
  const newDecayCount = s.turnsSinceDecay + 1;
  if (newDecayCount >= BALANCE.DECAY_EVERY_N_TURNS) {
    s = applyAdvisorDecay(s);
    s = addLog(s, 'Advisor relationships shift. Alignment fades without reinforcement.', 'system');
    s = { ...s, turnsSinceDecay: 0 };
  } else {
    s = { ...s, turnsSinceDecay: newDecayCount };
  }

  // 4. Reset turn action flag and advance turn
  s = { ...s, turnActionTaken: false, turn: s.turn + 1 };

  // Reset cooperation flags
  const advisors = { ...s.advisors };
  for (const id of Object.keys(advisors) as AdvisorId[]) {
    advisors[id] = { ...advisors[id], cooperationBought: false };
  }
  s = { ...s, advisors };

  // 5. Check loss
  const lossReason = checkLossConditions(s);
  if (lossReason) {
    const gameOver = resolveLossEnding(lossReason);
    return { ...s, phase: 'gameOver', gameOver };
  }

  // 6. Check turn limit
  if (s.turn > BALANCE.MAX_TURNS) {
    const gameOver = resolveTurnLimitEnding(s);
    return { ...s, phase: 'gameOver', gameOver };
  }

  return s;
}

// ── Main reducer ──────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CHOOSE_ARCHETYPE': {
      return buildInitialState(action.archetypeId);
    }

    case 'RESTART': {
      return {
        ...state,
        phase: 'start',
        archetypeId: null,
        gameOver: null,
      };
    }

    case 'ACTIVATE_BRB': {
      if (!canActivateBRB(state)) return state;
      const gameOver = resolveEnding(state);
      return { ...state, phase: 'gameOver', gameOver };
    }

    case 'TAKE_ADVISOR_ACTION': {
      if (state.turnActionTaken || state.phase !== 'playing') return state;

      const actionDef = ADVISOR_ACTIONS.find((a) => a.id === action.actionId);
      if (!actionDef) return state;

      if (!canAffordCost(state.resources, actionDef.cost)) return state;

      let s = state;

      // Special: buy cooperation targets the most resistant advisor
      if (actionDef.targetAdvisorCooperation) {
        // Find advisor with highest leverage
        const ids: AdvisorId[] = ['operator', 'fixer', 'analyst'];
        const target = ids.reduce((best, id) =>
          s.advisors[id].leverage > s.advisors[best].leverage ? id : best
        );
        s = {
          ...s,
          resources: applyResourceCost(s.resources, actionDef.cost),
          advisors: {
            ...s.advisors,
            [target]: {
              ...s.advisors[target],
              leverage: clamp(s.advisors[target].leverage + 4, 0, BALANCE.MAX_LEVERAGE),
              cooperationBought: true,
            },
          },
        };
        s = addLog(s, `${actionDef.name}: Purchased cooperation from ${ADVISORS.find(a => a.id === target)?.name}. Their leverage grows.`, 'player');
      } else {
        s = { ...s, resources: applyResourceCost(s.resources, actionDef.cost) };
        s = { ...s, resources: applyResourceEffect(s.resources, actionDef.resourceEffect) };
        s = { ...s, brb: applyBRBEffect(s.brb, actionDef.resourceEffect) };
        s = { ...s, advisors: applyAdvisorEffects(s.advisors, actionDef.advisorEffects) };

        if (actionDef.cpuProgressDelta) {
          const shieldAbsorb = Math.min(s.cpu.shield, Math.abs(actionDef.cpuProgressDelta));
          const effective = actionDef.cpuProgressDelta + (actionDef.cpuProgressDelta < 0 ? shieldAbsorb : 0);
          s = {
            ...s,
            cpu: {
              ...s.cpu,
              progress: clamp(s.cpu.progress + effective, 0, 100),
              shield: clamp(s.cpu.shield - shieldAbsorb, 0, 50),
            },
          };
        }
        if (actionDef.cpuShieldDelta) {
          s = { ...s, cpu: { ...s.cpu, shield: clamp(s.cpu.shield + actionDef.cpuShieldDelta, 0, 50) } };
        }
        if (actionDef.reducesNextCPU) {
          s = { ...s, cpu: { ...s.cpu, nextMoveReduced: true } };
        }
        if (actionDef.reducesNextFixer) {
          s = { ...s, nextFixerRiskReduced: true };
        }

        s = addLog(s, `${actionDef.name}: ${actionDef.description}`, 'player');
      }

      s = { ...s, turnActionTaken: true };
      return advanceTurn(s);
    }

    case 'TAKE_DEPOSIT': {
      if (state.turnActionTaken || state.phase !== 'playing') return state;

      const deposit = DEPOSITS.find((d) => d.id === action.depositId);
      if (!deposit) return state;

      if (!canAffordCost(state.resources, deposit.cost)) return state;

      let s = state;
      s = { ...s, resources: applyResourceCost(s.resources, deposit.cost) };
      s = { ...s, resources: applyResourceEffect(s.resources, deposit.resourceEffect) };
      s = { ...s, brb: applyBRBEffect(s.brb, deposit.resourceEffect) };
      s = { ...s, advisors: applyAdvisorEffects(s.advisors, deposit.advisorEffects) };

      s = addLog(s, `BRB DEPOSIT — ${deposit.name}: Resources locked in permanently.`, 'player');
      s = { ...s, turnActionTaken: true };
      return advanceTurn(s);
    }

    case 'TAKE_RECOVERY': {
      if (state.turnActionTaken || state.phase !== 'playing') return state;

      const recovery = RECOVERY_ACTIONS.find((r) => r.id === action.recoveryId);
      if (!recovery) return state;

      let s = state;
      s = { ...s, resources: applyResourceEffect(s.resources, recovery.resourceEffect) };
      s = { ...s, brb: applyBRBEffect(s.brb, recovery.resourceEffect) };

      // Internal Mediation: reduce highest leverage advisor
      if (recovery.id === 'internal-mediation') {
        const ids: AdvisorId[] = ['operator', 'fixer', 'analyst'];
        const target = ids.reduce((best, id) =>
          s.advisors[id].leverage > s.advisors[best].leverage ? id : best
        );
        const targetDef = ADVISORS.find(a => a.id === target)!;
        const rival = targetDef.rival;
        s = {
          ...s,
          advisors: {
            ...s.advisors,
            [target]: {
              ...s.advisors[target],
              leverage: clamp(s.advisors[target].leverage - 4, 0, BALANCE.MAX_LEVERAGE),
            },
            [rival]: {
              ...s.advisors[rival],
              alignment: clamp(s.advisors[rival].alignment - 3, BALANCE.MIN_ALIGNMENT, BALANCE.MAX_ALIGNMENT),
            },
          },
        };
        s = addLog(s, `Internal Mediation: Reduced ${targetDef.name}'s leverage through negotiation. Their rival responds poorly.`, 'player');
      } else {
        if (recovery.advisorEffects.length > 0) {
          s = { ...s, advisors: applyAdvisorEffects(s.advisors, recovery.advisorEffects) };
        }
        s = addLog(s, `${recovery.name}: ${recovery.description}`, 'player');
      }

      if (recovery.cpuProgressDelta) {
        s = { ...s, cpu: { ...s.cpu, progress: clamp(s.cpu.progress + recovery.cpuProgressDelta, 0, 100) } };
      }

      s = { ...s, turnActionTaken: true };
      return advanceTurn(s);
    }

    default:
      return state;
  }
}
