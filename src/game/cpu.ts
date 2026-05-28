import type { GameState, LogEntry } from '../types';
import { clamp } from './calculations';
import { BALANCE } from './balance';
import { ADVISORS } from '../data/advisors';

interface CPUResult {
  newState: GameState;
  entry: LogEntry;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function performCPUMove(state: GameState): CPUResult {
  const pressure = state.cpu.pressure;
  const reduced = state.cpu.nextMoveReduced;

  // Weight moves by game state
  const weights = [
    { type: 'research', weight: 35 },
    { type: 'media', weight: 15 },
    { type: 'shield', weight: 10 },
    { type: 'obfuscation', weight: 10 },
    { type: 'blackmail', weight: 15 },
    { type: 'acceleration', weight: 15 },
  ];

  // Bias toward acceleration when they're close
  if (state.cpu.progress >= 70) {
    weights[5].weight += 20;
    weights[0].weight -= 10;
  }
  // Bias toward shield if low
  if (state.cpu.shield < 10) {
    weights[2].weight += 10;
  }

  const total = weights.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * total;
  let moveType = 'research';
  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) {
      moveType = w.type;
      break;
    }
  }

  let newState = { ...state };
  let moveText = '';
  const reductionFactor = reduced ? 0.3 : 1.0;

  switch (moveType) {
    case 'research': {
      const base = rand(6, 10) * pressure;
      const gain = Math.round(base * reductionFactor);
      newState = {
        ...newState,
        cpu: { ...newState.cpu, progress: clamp(newState.cpu.progress + gain, 0, 100) },
      };
      moveText = reduced
        ? `Corporation: Research Push neutralized — only +${gain}% progress.`
        : `Corporation: Research Push — +${gain}% BRB progress.`;
      break;
    }
    case 'media': {
      const panicGain = Math.round(4 * reductionFactor);
      const trustLoss = Math.round(3 * reductionFactor);
      newState = {
        ...newState,
        resources: {
          ...newState.resources,
          panic: clamp(newState.resources.panic + panicGain, 0, BALANCE.MAX_PANIC_CAP),
          trust: clamp(newState.resources.trust - trustLoss, 0, 100),
        },
      };
      moveText = `Corporation: Media Capture — Panic +${panicGain}, Trust -${trustLoss}.`;
      break;
    }
    case 'shield': {
      const shieldGain = Math.round(8 * reductionFactor);
      newState = {
        ...newState,
        cpu: { ...newState.cpu, shield: clamp(newState.cpu.shield + shieldGain, 0, 50) },
      };
      moveText = `Corporation: Legal Shield — +${shieldGain} shield protection.`;
      break;
    }
    case 'obfuscation': {
      newState = {
        ...newState,
        cpu: { ...newState.cpu, nextMoveReduced: false },
      };
      moveText = 'Corporation: Data Obfuscation — their next move is harder to predict.';
      break;
    }
    case 'blackmail': {
      const advisorDefs = ADVISORS;
      const target = advisorDefs[rand(0, advisorDefs.length - 1)];
      const leverageGain = Math.round(rand(4, 7) * reductionFactor);
      newState = {
        ...newState,
        advisors: {
          ...newState.advisors,
          [target.id]: {
            ...newState.advisors[target.id],
            leverage: clamp(newState.advisors[target.id].leverage + leverageGain, 0, BALANCE.MAX_LEVERAGE),
          },
        },
      };
      moveText = `Corporation: Blackmail Attempt — ${target.name} leverage +${leverageGain}.`;
      break;
    }
    case 'acceleration': {
      const base = rand(10, 14) * pressure;
      const gain = Math.round(base * reductionFactor);
      const panicGain = Math.round(5 * reductionFactor);
      newState = {
        ...newState,
        cpu: { ...newState.cpu, progress: clamp(newState.cpu.progress + gain, 0, 100) },
        resources: {
          ...newState.resources,
          panic: clamp(newState.resources.panic + panicGain, 0, BALANCE.MAX_PANIC_CAP),
        },
      };
      moveText = reduced
        ? `Corporation: Emergency Acceleration blunted — +${gain}% progress, Panic +${panicGain}.`
        : `Corporation: Emergency Acceleration — +${gain}% progress, Panic +${panicGain}.`;
      break;
    }
  }

  // Reset nextMoveReduced after it's been consumed
  newState = {
    ...newState,
    cpu: { ...newState.cpu, nextMoveReduced: false, lastMove: moveType },
  };

  // Scale pressure every N turns
  if (state.turn % BALANCE.CPU_PRESSURE_INCREMENT_EVERY === 0) {
    newState = {
      ...newState,
      cpu: { ...newState.cpu, pressure: Math.min(newState.cpu.pressure + 0.5, 3) },
    };
  }

  const entry: LogEntry = {
    id: state.logIdCounter,
    turn: state.turn,
    text: moveText,
    type: 'cpu',
  };

  newState = { ...newState, logIdCounter: newState.logIdCounter + 1 };

  return { newState, entry };
}
