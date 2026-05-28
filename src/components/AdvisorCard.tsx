import type { AdvisorId, AdvisorRuntimeState, Resources } from '../types';
import { ADVISORS } from '../data/advisors';
import { ADVISOR_ACTIONS } from '../data/advisorActions';
import { getAdvisorState } from '../game/calculations';
import { ActionCard } from './ActionCard';

interface Props {
  advisorId: AdvisorId;
  state: AdvisorRuntimeState;
  resources: Resources;
  onAction: (actionId: string) => void;
  actionTaken: boolean;
}

function canAffordAction(resources: Resources, cost: Record<string, number | undefined>): { ok: boolean; reason?: string } {
  if (cost.money !== undefined && resources.money < cost.money)
    return { ok: false, reason: `Need $${cost.money.toLocaleString()} (have $${Math.round(resources.money).toLocaleString()})` };
  if (cost.influence !== undefined && resources.influence < cost.influence)
    return { ok: false, reason: `Need ${cost.influence} Influence` };
  if (cost.intel !== undefined && resources.intel < cost.intel)
    return { ok: false, reason: `Need ${cost.intel} Intel` };
  if (cost.trust !== undefined && resources.trust < cost.trust)
    return { ok: false, reason: `Need ${cost.trust} Trust` };
  return { ok: true };
}

function statBar(value: number, min: number, max: number, colorClass: string) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="stat-bar-bg">
      <div className={`stat-bar-fill ${colorClass}`} style={{ width: `${Math.max(0, pct)}%` }} />
    </div>
  );
}

export function AdvisorCard({ advisorId, state, resources, onAction, actionTaken }: Props) {
  const def = ADVISORS.find((a) => a.id === advisorId)!;
  const stateLabel = getAdvisorState(state);
  const actions = ADVISOR_ACTIONS.filter((a) => a.advisorId === advisorId);

  const stateLabelClass =
    stateLabel === 'Dangerous' || stateLabel === 'Rival Power Center'
      ? 'state-label state-dangerous'
      : stateLabel === 'Kingmaker' || stateLabel === 'Ambitious'
      ? 'state-label state-warning'
      : 'state-label state-stable';

  return (
    <div className="advisor-card card">
      <div className="advisor-header">
        <div className="advisor-portrait">
          {def.name.charAt(4).toUpperCase()}
        </div>
        <div className="advisor-info">
          <div className="advisor-name">{def.name}</div>
          <div className="advisor-role">{def.role}</div>
          <div className={stateLabelClass}>{stateLabel}</div>
        </div>
      </div>
      <div className="advisor-quote">"{def.quote}"</div>
      <div className="advisor-stats">
        <div className="stat-row">
          <span className="stat-label">Loyalty</span>
          <span className="stat-num">{Math.round(state.loyalty)}</span>
          {statBar(state.loyalty, -100, 100, 'fill-loyalty')}
          <span className="stat-ceiling">/ {state.loyaltyCeiling}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Align</span>
          <span className="stat-num">{Math.round(state.alignment)}</span>
          {statBar(state.alignment, -100, 100, 'fill-alignment')}
        </div>
        <div className="stat-row">
          <span className="stat-label">Leverage</span>
          <span className={`stat-num ${state.leverage >= 60 ? 'text-danger' : ''}`}>{Math.round(state.leverage)}</span>
          {statBar(state.leverage, 0, 100, state.leverage >= 60 ? 'fill-danger' : 'fill-leverage')}
        </div>
      </div>
      <div className="advisor-actions">
        {actions.map((act) => {
          const affordCheck = canAffordAction(resources, act.cost);
          const disabled = actionTaken || !affordCheck.ok;
          const reason = actionTaken
            ? 'Action already taken this turn'
            : affordCheck.reason;
          return (
            <ActionCard
              key={act.id}
              name={act.name}
              description={act.description}
              cost={act.cost}
              canAfford={!disabled}
              disabledReason={reason}
              onClick={() => onAction(act.id)}
              variant="advisor"
            />
          );
        })}
      </div>
    </div>
  );
}
