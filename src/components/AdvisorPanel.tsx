import type { AdvisorId, AdvisorRuntimeState, Resources } from '../types';
import { AdvisorCard } from './AdvisorCard';

interface Props {
  advisors: Record<AdvisorId, AdvisorRuntimeState>;
  resources: Resources;
  onAdvisorAction: (actionId: string) => void;
  actionTaken: boolean;
}

const ADVISOR_ORDER: AdvisorId[] = ['operator', 'fixer', 'analyst'];

export function AdvisorPanel({ advisors, resources, onAdvisorAction, actionTaken }: Props) {
  return (
    <div className="advisor-panel">
      {ADVISOR_ORDER.map((id) => (
        <AdvisorCard
          key={id}
          advisorId={id}
          state={advisors[id]}
          resources={resources}
          onAction={onAdvisorAction}
          actionTaken={actionTaken}
        />
      ))}
    </div>
  );
}
