import { useState } from "react";
import { ADVISOR_IDS, CORPORATION_STRATEGIES, RESOURCE_KEYS } from "../../game/types";
import type {
  AdvisorRecommendation,
  CommitOptions,
  CorporationStrategy,
  GameState,
  MajorAction,
} from "../../game/types";
import { CampaignActionControl } from "./CampaignActionControl";

function postureLabel(strategy: CorporationStrategy): string {
  return strategy.replaceAll("_", " ");
}

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
  const forecast = state.consultation?.predictedStrategy ?? null;
  // The prepared posture is hidden, so countering is a bet. Default the target to
  // the advisor forecast when one exists; otherwise the player picks blindly.
  const [chosenTarget, setChosenTarget] = useState<CorporationStrategy | null>(null);
  const counterTarget = chosenTarget ?? forecast ?? CORPORATION_STRATEGIES[0];
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
          <label className="counter-target-field">
            Counter which posture?
            <select
              value={counterTarget}
              onChange={(event) => setChosenTarget(event.target.value as CorporationStrategy)}
            >
              {CORPORATION_STRATEGIES.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {postureLabel(strategy)}
                  {strategy === forecast ? " (forecast)" : ""}
                </option>
              ))}
            </select>
            <span className="counter-target-hint">
              {forecast
                ? "Succeeds only if the forecast is right. A wrong guess wastes the operation and raises Threat."
                : "Posture unknown—consult an advisor first, or guess. A wrong guess wastes the operation and raises Threat."}
            </span>
          </label>
          <CampaignActionControl
            state={state}
            action={{ type: "counter_corporation", predictedStrategy: counterTarget }}
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
