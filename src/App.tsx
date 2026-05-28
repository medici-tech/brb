import { useReducer, useState } from 'react';
import type { ActionTab, GameState } from './types';
import { gameReducer } from './game/reducer';
import { canActivateBRB } from './game/calculations';
import { BALANCE } from './game/balance';
import { ArchetypeSelect } from './components/ArchetypeSelect';
import { ResourceBar } from './components/ResourceBar';
import { BRBProjectBoard } from './components/BRBProjectBoard';
import { CpuPanel } from './components/CpuPanel';
import { AdvisorPanel } from './components/AdvisorPanel';
import { DepositPanel } from './components/DepositPanel';
import { RecoveryPanel } from './components/RecoveryPanel';
import { EventLog } from './components/EventLog';
import { GameOverScreen } from './components/GameOverScreen';
import './styles.css';

const INITIAL_STATE: GameState = {
  turn: 1,
  phase: 'start',
  archetypeId: null,
  resources: { money: 4000, influence: 15, intel: 8, trust: 45, stress: 30, panic: 20 },
  brb: { engineering: 20, access: 15, legitimacy: 10, stability: 25 },
  cpu: { progress: 25, shield: 0, pressure: 1, nextMoveReduced: false, lastMove: null },
  advisors: {
    operator: { loyalty: 45, alignment: 10, leverage: 15, loyaltyCeiling: 70, cooperationBought: false },
    fixer: { loyalty: 35, alignment: 0, leverage: 25, loyaltyCeiling: 60, cooperationBought: false },
    analyst: { loyalty: 40, alignment: 10, leverage: 10, loyaltyCeiling: 65, cooperationBought: false },
  },
  eventLog: [],
  activeEvent: null,
  gameOver: null,
  turnActionTaken: false,
  nextFixerRiskReduced: false,
  nextCPUReduced: false,
  logIdCounter: 1,
  turnsSinceDecay: 0,
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<ActionTab>('advisor');

  if (state.phase === 'start') {
    return (
      <ArchetypeSelect
        onSelect={(id) => dispatch({ type: 'CHOOSE_ARCHETYPE', archetypeId: id })}
      />
    );
  }

  if (state.phase === 'gameOver' && state.gameOver) {
    return (
      <GameOverScreen
        result={state.gameOver}
        state={state}
        onRestart={() => dispatch({ type: 'RESTART' })}
      />
    );
  }

  const activatable = canActivateBRB(state);

  return (
    <div className="game-layout">
      <ResourceBar resources={state.resources} turn={state.turn} maxTurns={BALANCE.MAX_TURNS} />

      <div className="main-grid">
        <aside className="left-panel">
          <AdvisorPanel
            advisors={state.advisors}
            resources={state.resources}
            onAdvisorAction={(id) => dispatch({ type: 'TAKE_ADVISOR_ACTION', actionId: id })}
            actionTaken={state.turnActionTaken}
          />
        </aside>

        <main className="center-panel">
          <div className="action-tabs">
            <button
              className={`tab-btn ${activeTab === 'advisor' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('advisor')}
            >
              ADVISOR ACTIONS
            </button>
            <button
              className={`tab-btn ${activeTab === 'deposit' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              BRB DEPOSITS
            </button>
            <button
              className={`tab-btn ${activeTab === 'recovery' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('recovery')}
            >
              RECOVERY
            </button>
          </div>

          {state.turnActionTaken && (
            <div className="turn-taken-notice">
              ✓ Action taken this turn
            </div>
          )}

          <div className="tab-content">
            {activeTab === 'advisor' && (
              <div className="advisor-tab-note">
                Select an action from an advisor card on the left panel.
              </div>
            )}
            {activeTab === 'deposit' && (
              <DepositPanel
                resources={state.resources}
                onDeposit={(id) => dispatch({ type: 'TAKE_DEPOSIT', depositId: id })}
                actionTaken={state.turnActionTaken}
              />
            )}
            {activeTab === 'recovery' && (
              <RecoveryPanel
                onRecovery={(id) => dispatch({ type: 'TAKE_RECOVERY', recoveryId: id })}
                actionTaken={state.turnActionTaken}
              />
            )}
          </div>

          <BRBProjectBoard
            brb={state.brb}
            canActivate={activatable}
            onActivate={() => dispatch({ type: 'ACTIVATE_BRB' })}
          />
        </main>

        <aside className="right-panel">
          <CpuPanel cpu={state.cpu} />
          <EventLog entries={state.eventLog} />
        </aside>
      </div>
    </div>
  );
}
