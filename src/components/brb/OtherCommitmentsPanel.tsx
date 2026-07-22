import { ADVISOR_IDS, RESOURCE_KEYS } from "../../game/types";
import type {
  AdvisorRecommendation,
  CommitOptions,
  GameState,
  MajorAction,
} from "../../game/types";
import { CampaignActionControl } from "./CampaignActionControl";

interface Props {
  state: GameState;
  recommendation: AdvisorRecommendation | null;
  activeCardTitle: string | null;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
}

export function OtherCommitmentsPanel({
  state,
  recommendation,
  activeCardTitle,
  onCommit,
}: Props) {
  return (
    <article className="dark-panel actions-panel">
      <p className="file-label">OTHER COMMITMENTS</p>
      <p className="panel-explainer">
        Each control below consumes the month. Costs and known exposure are listed before
        authorization.
      </p>
      <details className="action-group" open>
        <summary>Counter and protect the state</summary>
        <div className="button-grid">
          <CampaignActionControl
            state={state}
            action={{
              type: "counter_corporation",
              predictedStrategy: state.consultation?.predictedStrategy
                ?? state.corporation.strategy,
            }}
            recommendation={recommendation}
            activeCardTitle={activeCardTitle}
            onCommit={onCommit}
            compact
          />
          <CampaignActionControl
            state={state}
            action={{ type: "protect_institutions" }}
            recommendation={recommendation}
            activeCardTitle={activeCardTitle}
            onCommit={onCommit}
            compact
          />
          <CampaignActionControl
            state={state}
            action={{ type: "strengthen_faction" }}
            recommendation={recommendation}
            activeCardTitle={activeCardTitle}
            onCommit={onCommit}
            compact
          />
        </div>
      </details>
      <details className="action-group">
        <summary>Manage advisor relationships</summary>
        <div className="button-grid">
          {ADVISOR_IDS.map((advisorId) => (
            <CampaignActionControl
              key={advisorId}
              state={state}
              action={{ type: "manage_advisor", advisorId }}
              recommendation={recommendation}
              activeCardTitle={activeCardTitle}
              onCommit={onCommit}
              compact
            />
          ))}
        </div>
      </details>
      <details className="action-group">
        <summary>Recover a resource reserve</summary>
        <div className="button-grid">
          {RESOURCE_KEYS.map((resource) => (
            <CampaignActionControl
              key={resource}
              state={state}
              action={{ type: "recover_resource", resource }}
              recommendation={recommendation}
              activeCardTitle={activeCardTitle}
              onCommit={onCommit}
              compact
            />
          ))}
        </div>
      </details>
    </article>
  );
}
