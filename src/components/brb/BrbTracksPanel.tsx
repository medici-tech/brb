import { TRACK_GUIDANCE, TRACK_LABELS } from "../../game/guidance";
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
  return (
    <section className="dark-panel">
      <p className="file-label">BRB TRACKS · READINESS THRESHOLD 50</p>
      {TRACK_KEYS.map((track) => (
        <div className="track-row" key={track}>
          <div>
            <span>{TRACK_LABELS[track]}</span>
            <strong>
              {state.tracks[track]} / 50 {state.tracks[track] >= 50 ? "· READY" : ""}
            </strong>
          </div>
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
      ))}
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
