import { ADVISORS } from "../../game/content";
import { actionKey, getActionPreview } from "../../game/guidance";
import type {
  AdvisorRecommendation,
  CommitOptions,
  GameState,
  MajorAction,
} from "../../game/types";
import { ConfirmActionDialog } from "./ui/decisions";

type Props = {
  state: GameState;
  action: MajorAction;
  recommendation: AdvisorRecommendation | null;
  activeCardTitle: string | null;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
  className?: string;
  forceDisabled?: boolean;
  compact?: boolean;
};

export function CampaignActionControl({
  state,
  action,
  recommendation,
  activeCardTitle,
  onCommit,
  className = "",
  forceDisabled = false,
  compact = false,
}: Props) {
  const preview = getActionPreview(state, action);
  const disabled = Boolean(forceDisabled || preview.disabledReason);
  const recommended = recommendation?.actionKey === actionKey(action);
  const trigger = (
    <button
      type="button"
      className={[
        "action-control",
        compact ? "compact-action" : "",
        className,
        recommended ? "recommended-action" : "",
      ].filter(Boolean).join(" ")}
      disabled={disabled}
      onClick={activeCardTitle && action.type !== "resolve_card"
        ? undefined
        : () => onCommit(action)}
    >
      <span className="action-title">
        {preview.label}
        {recommended ? <em>{ADVISORS[recommendation.advisorId].name} advises</em> : null}
      </span>
      <small>
        {preview.costs.length > 0
          ? `Cost: ${preview.costs.join(" · ")}${preview.permanent ? " · permanently deposited" : ""}`
          : "Cost: this month’s commitment"}
      </small>
      <span className="action-result">{preview.result}</span>
      {preview.risk ? <span className="action-risk">Risk: {preview.risk}</span> : null}
      {preview.delayedConsequence ? (
        <span className="action-echo">{preview.delayedConsequence}</span>
      ) : null}
      {preview.disabledReason ? (
        <span className="action-disabled">{preview.disabledReason}</span>
      ) : null}
    </button>
  );

  if (!activeCardTitle || action.type === "resolve_card") return trigger;
  const expires = action.type === "activate_brb";
  return (
    <ConfirmActionDialog
      trigger={trigger}
      title={expires
        ? `Activate with “${activeCardTitle}” unresolved?`
        : `Ignore “${activeCardTitle}”?`}
      description={
        expires
          ? "Activation ends the campaign and this Situation file will expire unresolved."
          : "Ignoring the active file applies its immediate consequence and registers a classified Delayed Echo before your selected commitment."
      }
      confirmAction={{
        label: expires ? "Expire file and activate" : `Ignore file and ${preview.label}`,
        disabled,
        onSelect: () => onCommit(action, { confirmCardAbandonment: true }),
      }}
    />
  );
}
