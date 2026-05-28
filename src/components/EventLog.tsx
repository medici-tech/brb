import type { LogEntry } from '../types';

interface Props {
  entries: LogEntry[];
}

export function EventLog({ entries }: Props) {
  return (
    <div className="event-log card">
      <div className="card-header">
        <span className="card-title">OPERATION LOG</span>
      </div>
      <div className="log-entries">
        {entries.slice(0, 30).map((entry) => (
          <div key={entry.id} className={`log-entry log-entry--${entry.type}`}>
            <span className="log-turn">T{entry.turn}</span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
