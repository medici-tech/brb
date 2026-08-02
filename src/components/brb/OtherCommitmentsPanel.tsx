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
import { ConsolePanel } from "./ui";

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
    <ConsolePanel label="Other commitments">
      <p className="file-label">OTHER COMMITMENTS</p>
      <p className="text-xs leading-5 text-muted-foreground">
        Each control below consumes the month. Costs and known exposure are listed before
        authorization.
      </p>
      <details className="mt-3 border-t border-border pt-3" open>
        <summary className="cursor-pointer font-bold text-foreground">Counter and protect the state</summary>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {/* The prepared posture is concealed, so this control is the bet the
              player is placing. It keeps the console surface rather than the
              retired global form styles. */}
          <label className="col-span-full grid gap-1.5 text-xs font-bold text-foreground">
            Counter which posture?
            <select
              className="cursor-pointer border border-border bg-console px-2 py-2 font-sans text-xs font-normal text-foreground"
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
            <span className="text-[11px] leading-5 font-normal text-muted-foreground">
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
