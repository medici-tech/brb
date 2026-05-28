import type { GameOverResult, GameState } from '../types';
import { BALANCE } from '../game/balance';

interface Props {
  result: GameOverResult;
  state: GameState;
  onRestart: () => void;
}

export function GameOverScreen({ result, state, onRestart }: Props) {
  const { resources, brb, cpu, turn } = state;

  return (
    <div className="game-over-screen">
      <div className="game-over-card">
        <div className={`game-over-banner ${result.isVictory ? 'banner-victory' : 'banner-defeat'}`}>
          {result.isVictory ? 'OPERATION COMPLETE' : 'OPERATION FAILED'}
        </div>
        <h2 className="game-over-title">{result.title}</h2>
        <p className="game-over-flavor">{result.flavor}</p>
        <div className="game-over-stats">
          <div className="stat-col">
            <div className="stat-block-title">RESOURCES AT END</div>
            <div>Money: ${Math.round(resources.money).toLocaleString()}</div>
            <div>Trust: {Math.round(resources.trust)}</div>
            <div>Stress: {Math.round(resources.stress)}</div>
            <div>Panic: {Math.round(resources.panic)}</div>
          </div>
          <div className="stat-col">
            <div className="stat-block-title">BRB STATUS</div>
            <div>Engineering: {Math.round(brb.engineering)} / {BALANCE.BRB_ENGINEERING_THRESHOLD}</div>
            <div>Access: {Math.round(brb.access)} / {BALANCE.BRB_ACCESS_THRESHOLD}</div>
            <div>Legitimacy: {Math.round(brb.legitimacy)} / {BALANCE.BRB_LEGITIMACY_THRESHOLD}</div>
            <div>Stability: {Math.round(brb.stability)} / {BALANCE.BRB_STABILITY_THRESHOLD}</div>
          </div>
          <div className="stat-col">
            <div className="stat-block-title">THE CORPORATION</div>
            <div>Progress: {Math.round(cpu.progress)}%</div>
            <div>Turns Survived: {turn - 1}</div>
          </div>
        </div>
        <button className="restart-button" onClick={onRestart}>
          NEW OPERATION
        </button>
      </div>
    </div>
  );
}
