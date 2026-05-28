import type { GameState, GameOverResult, EndingType } from '../types';
import { BALANCE } from './balance';

export function resolveEnding(state: GameState): GameOverResult {
  const { stability, legitimacy } = state.brb;
  const { panic } = state.resources;

  // Victory endings (BRB activated)
  if (state.phase === 'playing' || state.gameOver === null) {
    let type: EndingType;
    let title: string;
    let flavor: string;

    if (stability >= BALANCE.CONTROLLED_STABILITY && panic < BALANCE.CONTROLLED_PANIC_MAX) {
      type = 'Controlled Activation';
      title = 'Controlled Activation';
      flavor =
        'The button is pressed in a quiet room. No cameras. No speeches. The world changes before anyone can object.';
    } else if (legitimacy < BALANCE.COUP_BUTTON_LEGITIMACY_MAX) {
      type = 'Coup Button';
      title = 'Coup Button';
      flavor =
        "You had no mandate. You had the button. History will argue about the difference for a long time — if there's anyone left to argue.";
    } else if (panic >= BALANCE.PANIC_MANDATE_PANIC_MIN) {
      type = 'Panic Mandate';
      title = 'Panic Mandate';
      flavor =
        'The crowd demanded someone press it. You were there. It was pressed. Whether that constitutes legitimacy is above your pay grade.';
    } else if (stability >= BALANCE.DIRTY_VICTORY_MIN_STABILITY) {
      type = 'Dirty Victory';
      title = 'Dirty Victory';
      flavor =
        'You got there. The methods will not be in the official record. The results will be. Probably.';
    } else {
      type = 'Catastrophic Misfire';
      title = 'Catastrophic Misfire';
      flavor =
        'The button was pressed. Something was supposed to happen. What actually happened is being debated in emergency sessions.';
    }

    return { type, title, flavor, isVictory: true };
  }

  return { type: 'Dirty Victory', title: 'Dirty Victory', flavor: '', isVictory: true };
}

export function resolveLossEnding(reason: string): GameOverResult {
  switch (reason) {
    case 'cpu':
      return {
        type: 'Corporate Capture',
        title: 'Corporate Capture',
        flavor:
          'The Corporation pressed it first. Your operation is now under investigation. The button was the least of your problems.',
        isVictory: false,
      };
    case 'stress':
      return {
        type: 'Mental Collapse',
        title: 'Mental Collapse',
        flavor:
          "You couldn't hold it together. The operation continues without you — which, it turns out, it cannot.",
        isVictory: false,
      };
    case 'panic':
      return {
        type: 'Mass Panic',
        title: 'Mass Panic',
        flavor:
          'The public ran out of patience before you ran out of time. The streets made the decision for you.',
        isVictory: false,
      };
    case 'money':
      return {
        type: 'Financial Ruin',
        title: 'Financial Ruin',
        flavor:
          "The accounts are frozen. The legal team stopped answering. You knew this risk. You didn't know it would happen this fast.",
        isVictory: false,
      };
    default:
      return {
        type: 'Corporate Capture',
        title: 'Defeat',
        flavor: 'The operation collapsed.',
        isVictory: false,
      };
  }
}

export function resolveTurnLimitEnding(state: GameState): GameOverResult {
  const cpuProgress = state.cpu.progress;
  const { panic } = state.resources;

  if (panic >= BALANCE.HIGH_PANIC_THRESHOLD) {
    return {
      type: 'The Crowd Pressed It',
      title: 'The Crowd Pressed It',
      flavor:
        'No one pressed it. Everyone pressed it. The crowd broke into the facility. The button was pressed by committee.',
      isVictory: false,
    };
  }

  if (cpuProgress >= BALANCE.STALEMATE_CPU_MAX) {
    return {
      type: 'Corporate Capture',
      title: 'Corporate Capture',
      flavor:
        'The deadline passed. The Corporation had more patience. They tend to.',
      isVictory: false,
    };
  }

  return {
    type: 'Cold Stalemate',
    title: 'Cold Stalemate',
    flavor:
      'Thirty turns. Neither side pressed the button. The standoff continues. Somewhere, someone is resetting the clock.',
    isVictory: false,
  };
}
