import type { Resources } from '../types';
import { DEPOSITS } from '../data/deposits';
import { ActionCard } from './ActionCard';

interface Props {
  resources: Resources;
  onDeposit: (depositId: string) => void;
  actionTaken: boolean;
}

function canAfford(resources: Resources, cost: Record<string, number | undefined>): { ok: boolean; reason?: string } {
  if (cost.money !== undefined && resources.money < cost.money)
    return { ok: false, reason: `Need $${cost.money.toLocaleString()}` };
  if (cost.influence !== undefined && resources.influence < cost.influence)
    return { ok: false, reason: `Need ${cost.influence} Influence` };
  if (cost.intel !== undefined && resources.intel < cost.intel)
    return { ok: false, reason: `Need ${cost.intel} Intel` };
  if (cost.trust !== undefined && resources.trust < cost.trust)
    return { ok: false, reason: `Need ${cost.trust} Trust` };
  return { ok: true };
}

export function DepositPanel({ resources, onDeposit, actionTaken }: Props) {
  return (
    <div className="deposit-panel">
      <div className="panel-note">
        ⚠ Deposits permanently lock resources into BRB tracks. They cannot be refunded.
      </div>
      <div className="deposit-grid">
        {DEPOSITS.map((dep) => {
          const affordCheck = canAfford(resources, dep.cost);
          const disabled = actionTaken || !affordCheck.ok;
          return (
            <ActionCard
              key={dep.id}
              name={dep.name}
              description={dep.description}
              cost={dep.cost}
              canAfford={!disabled}
              disabledReason={actionTaken ? 'Action already taken this turn' : affordCheck.reason}
              onClick={() => onDeposit(dep.id)}
              variant="deposit"
            />
          );
        })}
      </div>
    </div>
  );
}
