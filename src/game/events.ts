import type { GameState, RandomEventDef } from '../types';
import { RANDOM_EVENTS } from '../data/randomEvents';
import { BALANCE } from './balance';

export function maybePickEvent(state: GameState): RandomEventDef | null {
  if (Math.random() > BALANCE.EVENT_CHANCE_PER_TURN) return null;

  const eligible = RANDOM_EVENTS.filter((e) => e.triggerCondition(state));

  if (eligible.length === 0) {
    // Pick any random event as fallback with low probability
    if (Math.random() < 0.3) {
      return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    }
    return null;
  }

  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of eligible) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }

  return eligible[eligible.length - 1];
}
