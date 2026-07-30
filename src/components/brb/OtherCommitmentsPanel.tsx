import { ADVISOR_IDS, RESOURCE_KEYS } from "../../game/types";
import type {
  AdvisorRecommendation,
  CommitOptions,
  GameState,
  MajorAction,
} from "../../game/types";
import { CampaignActionControl } from "./CampaignActionControl";
import { ConsolePanel } from "./ui";

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
    <ConsolePanel label="Other commitments">
      <p className="file-label">OTHER COMMITMENTS</p>
      <p className="text-xs leading-5 text-muted-foreground">
        Each control below consumes the month. Costs and known exposure are listed before
        authorization.
      </p>
      <details className="mt-3 border-t border-border pt-3" open>
        <summary className="cursor-pointer font-bold text-foreground">Counter and protect the state</summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
      <details className="mt-3 border-t border-border pt-3">
        <summary className="cursor-pointer font-bold text-foreground">Manage advisor relationships</summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
      <details className="mt-3 border-t border-border pt-3">
        <summary className="cursor-pointer font-bold text-foreground">Recover a resource reserve</summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
    </ConsolePanel>
  );
}
