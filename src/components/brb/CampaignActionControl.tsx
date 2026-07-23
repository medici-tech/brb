import { ADVISORS } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { getActionError } from "../../game/engine";
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
  const ignoresActiveCard = Boolean(activeCardTitle && action.type !== "resolve_card");
  const directiveId = state.legacyDirective.equippedId;
  const directive = directiveId ? LEGACY_DIRECTIVES[directiveId] : null;
  const directiveAvailable = Boolean(
    directive
    && !state.legacyDirective.used
    && action.type !== "activate_brb",
  );
  const directiveOptions: CommitOptions = {
    ...(ignoresActiveCard ? { confirmCardAbandonment: true } : {}),
    useLegacyDirective: true,
  };
  const directiveError = directiveAvailable
    ? getActionError(state, action, directiveOptions)
    : null;
  const disabled = Boolean(
    forceDisabled
    || (preview.disabledReason && (!directiveAvailable || directiveError)),
  );
  const recommended = recommendation?.actionKey === actionKey(action);
  const activatesBrb = action.type === "activate_brb";
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
      {preview.knownChanges && preview.knownChanges.length > 0 ? (
        <span className="action-known">
          Exact immediate changes: {preview.knownChanges.join(" · ")}
        </span>
      ) : null}
      {preview.risk ? <span className="action-risk">Risk: {preview.risk}</span> : null}
      {preview.delayedConsequence ? (
        <span className="action-echo">{preview.delayedConsequence}</span>
      ) : null}
      {preview.disabledReason ? (
        <span className="action-disabled">
          {directiveAvailable && !directiveError
            ? `${preview.disabledReason} The equipped Directive can make this commitment available.`
            : preview.disabledReason}
        </span>
      ) : null}
    </button>
  );

  return (
    <ConfirmActionDialog
      trigger={trigger}
      title={
        ignoresActiveCard && activatesBrb
          ? `Activate with “${activeCardTitle}” unresolved?`
          : ignoresActiveCard
            ? `Ignore “${activeCardTitle}”?`
            : activatesBrb
              ? "Authorize BRB activation?"
              : activeCardTitle
                ? `Resolve “${activeCardTitle}” with “${preview.label}”?`
                : `Commit to “${preview.label}”?`
      }
      description={
        ignoresActiveCard && activatesBrb
          ? "Activation ends the campaign and this Situation file will expire unresolved."
          : ignoresActiveCard
            ? `Ignoring the active file applies its immediate consequence and registers a classified Delayed Echo before “${preview.label}” ends Month ${state.turn}.`
            : activatesBrb
              ? "Activation ends the campaign and evaluates who controls the completed BRB. There is no next-month briefing."
              : `This commitment applies the listed costs and known risks, then ends Month ${state.turn}. You will review the exact aftermath before Month ${state.turn + 1}.`
      }
      summary={(
        <>
          <section>
            <strong>Selected commitment</strong>
            <p>{preview.label}</p>
          </section>
          <section>
            <strong>Cost</strong>
            <p>
              {preview.costs.length > 0
                ? `${preview.costs.join(" · ")}${preview.permanent ? " · permanently deposited" : ""}`
                : "This month’s commitment"}
            </p>
          </section>
          <section>
            <strong>
              {preview.knownChanges ? "Exact immediate changes" : "Known immediate outcome"}
            </strong>
            <p>
              {preview.knownChanges && preview.knownChanges.length > 0
                ? preview.knownChanges.join(" · ")
                : preview.result}
            </p>
          </section>
          {preview.risk ? (
            <section>
              <strong>Known risk</strong>
              <p>{preview.risk}</p>
            </section>
          ) : null}
          {ignoresActiveCard ? (
            <section className="confirmation-warning">
              <strong>Active Situation</strong>
              <p>
                {activatesBrb
                  ? `“${activeCardTitle}” expires unresolved when the BRB activates. Its ignored consequence and Delayed Echo do not resolve.`
                  : `“${activeCardTitle}” resolves as ignored before this commitment.`}
              </p>
            </section>
          ) : null}
          {directiveAvailable && directive ? (
            <section className="confirmation-directive">
              <strong>Optional Legacy Directive · {directive.rarity}</strong>
              <p>
                {directive.title}: {directive.benefit}. Cost: {directive.warning}.
                It can be used only once this campaign.
              </p>
              {directiveError ? <p>Unavailable here: {directiveError}</p> : null}
            </section>
          ) : null}
        </>
      )}
      {...(directiveAvailable && directive ? {
        secondaryConfirmAction: {
          label: "Use Legacy Directive",
          disabled: Boolean(forceDisabled || directiveError),
          onSelect: () => onCommit(action, directiveOptions),
        },
      } : {})}
      confirmAction={{
        label:
          ignoresActiveCard && activatesBrb
            ? "Expire file and activate"
            : ignoresActiveCard
              ? `Ignore file and end Month ${state.turn}`
              : activatesBrb
                ? "Activate BRB and end campaign"
                : `Authorize and end Month ${state.turn}`,
        disabled,
        onSelect: () => {
          if (ignoresActiveCard) {
            onCommit(action, { confirmCardAbandonment: true });
            return;
          }
          onCommit(action);
        },
      }}
      tone={activatesBrb ? "critical" : "warning"}
    />
  );
}
