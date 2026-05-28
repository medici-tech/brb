import type { GameState } from '../types';
import { ARCHETYPES } from '../data/archetypes';
import { ADVISORS } from '../data/advisors';
import { clamp } from './calculations';
import { BALANCE } from './balance';

export function buildInitialState(archetypeId: string): GameState {
  const archetype = ARCHETYPES.find((a) => a.id === archetypeId)!;

  const baseResources = {
    money: 4000,
    influence: 15,
    intel: 8,
    trust: 45,
    stress: 30,
    panic: 20,
  };

  const resources = { ...baseResources };
  const mods = archetype.resourceModifiers;
  if (mods.money !== undefined) resources.money += mods.money;
  if (mods.influence !== undefined) resources.influence += mods.influence;
  if (mods.intel !== undefined) resources.intel += mods.intel;
  if (mods.trust !== undefined) resources.trust += mods.trust;
  if (mods.stress !== undefined) resources.stress += mods.stress;
  if (mods.panic !== undefined) resources.panic += mods.panic;

  const baseBRB = { engineering: 20, access: 15, legitimacy: 10, stability: 25 };
  const brb = { ...baseBRB };
  const brbMods = archetype.brbModifiers;
  if (brbMods.engineering !== undefined) brb.engineering += brbMods.engineering;
  if (brbMods.access !== undefined) brb.access += brbMods.access;
  if (brbMods.legitimacy !== undefined) brb.legitimacy += brbMods.legitimacy;
  if (brbMods.stability !== undefined) brb.stability += brbMods.stability;

  const advisors: GameState['advisors'] = {} as GameState['advisors'];
  for (const def of ADVISORS) {
    const mods = archetype.advisorModifiers[def.id] ?? {};
    const loyalty = clamp((def.startingLoyalty) + (mods.loyalty ?? 0), BALANCE.MIN_LOYALTY, def.startingCeiling);
    const leverage = clamp(def.startingLeverage + (mods.leverage ?? 0), BALANCE.MIN_LEVERAGE, BALANCE.MAX_LEVERAGE);
    advisors[def.id] = {
      loyalty,
      alignment: def.startingAlignment,
      leverage,
      loyaltyCeiling: def.startingCeiling,
      cooperationBought: false,
    };
  }

  return {
    turn: 1,
    phase: 'playing',
    archetypeId,
    resources,
    brb,
    cpu: {
      progress: 25,
      shield: 0,
      pressure: 1,
      nextMoveReduced: false,
      lastMove: null,
    },
    advisors,
    eventLog: [
      {
        id: 1,
        turn: 0,
        text: `Campaign started. Archetype: ${archetype.name}. The Corporation is already at 25% progress.`,
        type: 'system',
      },
    ],
    activeEvent: null,
    gameOver: null,
    turnActionTaken: false,
    nextFixerRiskReduced: false,
    nextCPUReduced: false,
    logIdCounter: 2,
    turnsSinceDecay: 0,
  };
}
