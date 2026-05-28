import { RECOVERY_ACTIONS } from '../data/recoveryActions';
import { ActionCard } from './ActionCard';

interface Props {
  onRecovery: (recoveryId: string) => void;
  actionTaken: boolean;
}

export function RecoveryPanel({ onRecovery, actionTaken }: Props) {
  return (
    <div className="recovery-panel">
      <div className="panel-note">
        Recovery actions skip your turn's progress but may prevent collapse.
      </div>
      <div className="recovery-grid">
        {RECOVERY_ACTIONS.map((rec) => (
          <ActionCard
            key={rec.id}
            name={rec.name}
            description={rec.description}
            cost={{}}
            canAfford={!actionTaken}
            disabledReason={actionTaken ? 'Action already taken this turn' : undefined}
            onClick={() => onRecovery(rec.id)}
            variant="recovery"
          />
        ))}
      </div>
    </div>
  );
}
