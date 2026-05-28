import type { ResourceCost, ResourceEffect, AdvisorEffect } from '../types';

interface Props {
  name: string;
  description: string;
  cost: ResourceCost;
  effect?: ResourceEffect;
  advisorEffects?: AdvisorEffect[];
  canAfford: boolean;
  disabledReason?: string;
  onClick: () => void;
  variant?: 'advisor' | 'deposit' | 'recovery';
}

function formatCost(cost: ResourceCost): string[] {
  const lines: string[] = [];
  if (cost.money) lines.push(`$${cost.money.toLocaleString()}`);
  if (cost.influence) lines.push(`Influence −${cost.influence}`);
  if (cost.intel) lines.push(`Intel −${cost.intel}`);
  if (cost.trust) lines.push(`Trust −${cost.trust}`);
  if (cost.stress) lines.push(`Stress +${cost.stress}`);
  if (cost.panic) lines.push(`Panic +${cost.panic}`);
  return lines;
}

export function ActionCard({
  name,
  description,
  cost,
  canAfford,
  disabledReason,
  onClick,
  variant = 'advisor',
}: Props) {
  const costLines = formatCost(cost);
  const hasCost = costLines.length > 0;

  return (
    <button
      className={`action-card action-card--${variant} ${!canAfford ? 'action-card--disabled' : ''}`}
      onClick={onClick}
      disabled={!canAfford}
      title={disabledReason}
    >
      <div className="action-name">{name}</div>
      <div className="action-description">{description}</div>
      {hasCost && (
        <div className="action-cost">
          {costLines.map((l, i) => (
            <span key={i} className="cost-item">{l}</span>
          ))}
        </div>
      )}
      {!canAfford && disabledReason && (
        <div className="action-disabled-reason">{disabledReason}</div>
      )}
    </button>
  );
}
