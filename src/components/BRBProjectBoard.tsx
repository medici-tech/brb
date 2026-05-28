import type { BRBTracks } from '../types';
import { BALANCE } from '../game/balance';

interface Props {
  brb: BRBTracks;
  canActivate: boolean;
  onActivate: () => void;
}

function TrackBar({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const pct = Math.min(100, (value / threshold) * 100);
  const met = value >= threshold;
  return (
    <div className="brb-track">
      <div className="brb-track-header">
        <span className="brb-track-label">{label}</span>
        <span className={`brb-track-value ${met ? 'brb-met' : ''}`}>
          {Math.round(value)} / {threshold} {met ? '✓' : ''}
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          className={`progress-bar-fill ${met ? 'progress-met' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BRBProjectBoard({ brb, canActivate, onActivate }: Props) {
  return (
    <div className="brb-board card">
      <div className="card-header">
        <span className="card-title">BRB PROJECT</span>
        <span className="stamp">CLASSIFIED</span>
      </div>
      <TrackBar label="ENGINEERING" value={brb.engineering} threshold={BALANCE.BRB_ENGINEERING_THRESHOLD} />
      <TrackBar label="ACCESS" value={brb.access} threshold={BALANCE.BRB_ACCESS_THRESHOLD} />
      <TrackBar label="LEGITIMACY" value={brb.legitimacy} threshold={BALANCE.BRB_LEGITIMACY_THRESHOLD} />
      <TrackBar label="STABILITY" value={brb.stability} threshold={BALANCE.BRB_STABILITY_THRESHOLD} />
      {canActivate && (
        <button className="activate-button" onClick={onActivate}>
          ⚡ ACTIVATE THE BIG RED BUTTON
        </button>
      )}
    </div>
  );
}
