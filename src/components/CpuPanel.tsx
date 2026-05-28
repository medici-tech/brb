import type { CPUState } from '../types';

interface Props {
  cpu: CPUState;
}

export function CpuPanel({ cpu }: Props) {
  const pct = Math.min(100, cpu.progress);
  const danger = cpu.progress >= 70;

  return (
    <div className="cpu-panel card">
      <div className="card-header">
        <span className="card-title">THE CORPORATION</span>
        <span className="stamp danger-stamp">THREAT</span>
      </div>
      <div className="cpu-progress-row">
        <span className="cpu-label">BRB Progress</span>
        <span className={`cpu-value ${danger ? 'text-danger' : ''}`}>{Math.round(cpu.progress)}%</span>
      </div>
      <div className="progress-bar-bg">
        <div
          className={`progress-bar-fill ${danger ? 'progress-danger' : 'progress-cpu'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="cpu-stats">
        <div className="cpu-stat">
          <span className="cpu-stat-label">Shield</span>
          <span className="cpu-stat-value">{Math.round(cpu.shield)}</span>
        </div>
        <div className="cpu-stat">
          <span className="cpu-stat-label">Pressure</span>
          <span className="cpu-stat-value">{cpu.pressure.toFixed(1)}×</span>
        </div>
      </div>
      {cpu.lastMove && (
        <div className="cpu-last-move">
          Last: {cpu.lastMove.replace('-', ' ')}
        </div>
      )}
    </div>
  );
}
