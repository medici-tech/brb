import type { AdvisorRuntimeState, AdvisorStateLabel, GameState } from '../types';
import { BALANCE } from './balance';

export function getSupportScore(advisor: AdvisorRuntimeState): number {
  return advisor.loyalty + advisor.alignment - Math.round(advisor.leverage * 0.6);
}

export function getAdvisorState(advisor: AdvisorRuntimeState): AdvisorStateLabel {
  const score = getSupportScore(advisor);
  const { loyalty, alignment, leverage } = advisor;

  if (leverage >= 85) return 'Rival Power Center';
  if (loyalty >= 50 && leverage >= 70) return 'Kingmaker';
  if (loyalty < 20 && leverage >= 50) return 'Dangerous';
  if (alignment < -30) return 'Alienated';
  if (loyalty >= 40 && leverage >= 45) return 'Ambitious';
  if (score >= 30) return 'Reliable';
  return 'Useful';
}

export function canActivateBRB(state: GameState): boolean {
  return (
    state.brb.engineering >= BALANCE.BRB_ENGINEERING_THRESHOLD &&
    state.brb.access >= BALANCE.BRB_ACCESS_THRESHOLD &&
    state.brb.legitimacy >= BALANCE.BRB_LEGITIMACY_THRESHOLD &&
    state.brb.stability >= BALANCE.BRB_STABILITY_THRESHOLD
  );
}

export function checkLossConditions(state: GameState): string | null {
  if (state.cpu.progress >= BALANCE.CPU_WIN_THRESHOLD) return 'cpu';
  if (state.resources.stress >= BALANCE.MAX_STRESS) return 'stress';
  if (state.resources.panic >= BALANCE.MAX_PANIC) return 'panic';
  if (state.resources.money <= BALANCE.MIN_MONEY) return 'money';
  return null;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getPlayerBRBTotal(state: GameState): number {
  return state.brb.engineering + state.brb.access + state.brb.legitimacy + state.brb.stability;
}
