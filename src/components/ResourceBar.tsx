import type { Resources } from '../types';

interface Props {
  resources: Resources;
  turn: number;
  maxTurns: number;
}

function ResourceItem({ label, value, isDanger, isNegative }: {
  label: string;
  value: number;
  isDanger?: boolean;
  isNegative?: boolean;
}) {
  const cls = ['resource-item', isDanger ? 'resource-danger' : '', isNegative ? 'resource-negative' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <span className="resource-label">{label}</span>
      <span className="resource-value">{typeof value === 'number' ? Math.round(value) : value}</span>
    </div>
  );
}

export function ResourceBar({ resources, turn, maxTurns }: Props) {
  const { money, influence, intel, trust, stress, panic } = resources;

  return (
    <div className="resource-bar">
      <div className="resource-group">
        <ResourceItem label="$" value={money} isNegative={money < 0} isDanger={money < 500} />
        <ResourceItem label="INF" value={influence} isDanger={influence < 3} />
        <ResourceItem label="INTEL" value={intel} isDanger={intel < 2} />
        <ResourceItem label="TRUST" value={trust} isDanger={trust < 15} />
      </div>
      <div className="turn-display">
        <span className="turn-label">TURN</span>
        <span className="turn-value">{turn} / {maxTurns}</span>
      </div>
      <div className="resource-group">
        <ResourceItem label="STRESS" value={stress} isDanger={stress >= 70} />
        <ResourceItem label="PANIC" value={panic} isDanger={panic >= 60} />
      </div>
    </div>
  );
}
