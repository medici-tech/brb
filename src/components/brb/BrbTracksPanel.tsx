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
import { ConsolePanel, ProgressTrack } from "./ui";

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
    <ConsolePanel label="BRB tracks">
      <p className="file-label">BRB TRACKS · READINESS THRESHOLD 50</p>
      {TRACK_KEYS.map((track) => (
        <ProgressTrack
          label={TRACK_LABELS[track]}
          value={state.tracks[track]}
          maximum={50}
          progressLabel={`${TRACK_LABELS[track]} readiness`}
          description={TRACK_GUIDANCE[track].question}
          {...(state.tracks[track] >= 50 ? { status: "READY" } : {})}
          tone={state.tracks[track] >= 50 ? "stable" : "informational"}
          controls={(
            <div className="grid gap-2 sm:grid-cols-2">
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
          )}
          footer={<>Track exposure: {TRACK_GUIDANCE[track].sideEffect}</>}
          key={track}
        />
      ))}
      <details className="mt-5 border border-border p-3.5">
        <summary className="cursor-pointer font-bold text-foreground">Activation outcome checklist</summary>
        <p className="text-[11px] leading-5 text-muted-foreground">Readiness allows activation. These safeguards determine whether control remains civic.</p>
        <ul className="m-0 grid list-none gap-2 p-0">
          {civicEvaluation.observations.map((observation) => (
            <li className={`grid gap-0.5 border-l-3 bg-raised px-2 py-1.5 text-[11px] ${observation.passed ? "border-l-phosphor" : "border-l-muted-foreground"}`} key={observation.id}>
              <span>{observation.passed ? "✓" : "○"} {observation.label}</span>
              <small className="text-muted-foreground">{String(observation.actual)} · target {observation.target}</small>
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
        className="mt-5 min-h-14 w-full"
        forceDisabled={!canActivate}
      />
    </ConsolePanel>
  );
}
