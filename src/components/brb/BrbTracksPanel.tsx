import { TRACK_GUIDANCE, TRACK_LABELS } from "../../game/guidance";
import { evaluateCivicLegacy } from "../../game/engine";
import { TRACK_KEYS } from "../../game/types";
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
  canActivate: boolean;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
}

export function BrbTracksPanel({
  state,
  recommendation,
  activeCardTitle,
  canActivate,
  onCommit,
}: Props) {
  const civicEvaluation = evaluateCivicLegacy(state);
  return (
    <section className="dark-panel">
      <p className="file-label">BRB TRACKS · READINESS THRESHOLD 50</p>
      {TRACK_KEYS.map((track) => (
        <details className="track-row" key={track} open>
          <summary>
            <span>{TRACK_LABELS[track]}</span>
            <strong>
              {state.tracks[track]} / 50 {state.tracks[track] >= 50 ? "· READY" : ""}
            </strong>
          </summary>
          <div className="track-body">
            <p>{TRACK_GUIDANCE[track].question}</p>
            <progress
              aria-label={`${TRACK_LABELS[track]} readiness`}
              max="50"
              value={Math.min(50, state.tracks[track])}
            />
            <div className="track-actions">
              <CampaignActionControl
                state={state}
                action={{ type: "deposit", track, size: "standard" }}
                recommendation={recommendation}
                activeCardTitle={activeCardTitle}
                onCommit={onCommit}
                compact
              />
              <CampaignActionControl
                state={state}
                action={{ type: "deposit", track, size: "large" }}
                recommendation={recommendation}
                activeCardTitle={activeCardTitle}
                onCommit={onCommit}
                compact
              />
            </div>
            <small>Track exposure: {TRACK_GUIDANCE[track].sideEffect}</small>
          </div>
        </details>
      ))}
      <details className="activation-checklist">
        <summary>Activation outcome checklist</summary>
        <p>Readiness allows activation. These safeguards determine whether control remains civic.</p>
        <ul>
          {civicEvaluation.observations.map((observation) => (
            <li className={observation.passed ? "passed" : "unmet"} key={observation.id}>
              <span>{observation.passed ? "✓" : "○"} {observation.label}</span>
              <small>{String(observation.actual)} · target {observation.target}</small>
            </li>
          ))}
        </ul>
      </details>
      <CampaignActionControl
        state={state}
        action={{ type: "activate_brb" }}
        recommendation={recommendation}
        activeCardTitle={activeCardTitle}
        onCommit={onCommit}
        className="activate-button"
        forceDisabled={!canActivate}
      />
    </section>
  );
}
