import { ADVISORS } from "../../game/content";
import {
  actionKey,
  describeCorporationPosture,
  describeCorporationPressure,
  formatStateDelta,
  getActionPreview,
  getAdvisorRecommendation,
  getArchetypeAbilityPreview,
  getConsultationCost,
  RESOURCE_GUIDANCE,
  RESOURCE_LABELS,
  TRACK_GUIDANCE,
  TRACK_LABELS,
} from "../../game/guidance";
import { getActiveCard, getValidActions } from "../../game/engine";
import {
  describeCompletionPressure,
  formatCampaignTime,
  getCompletionPressure,
  getCorporationPressure,
} from "../../game/progression";
import { RESOURCE_KEYS, TRACK_KEYS } from "../../game/types";
import type {
  AdvisorId,
  CommitOptions,
  GameState,
  MajorAction,
  ResolvedEffect,
} from "../../game/types";
import type { BookmarkInput, GuidedRunObjective } from "../../playtest/journal";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";
import { ConfirmActionDialog } from "./ui/decisions";

type Props = {
  state: GameState;
  error: string | null;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
  onConsult: (advisorId: AdvisorId, useAbility: boolean) => void;
  onOpenArchive: () => void;
  onOpenPlaytest?: () => void;
  onBookmark?: (input: BookmarkInput) => void;
  guidedObjective?: GuidedRunObjective | null;
};

const ONBOARDING_STEPS = [
  {
    label: "ASSESS THE FILE",
    title: "Read the stakes before you commit.",
    copy: "Resources fund your options. Panic, Institutions, Corporation Progress, and advisor Leverage can end or compromise the campaign.",
  },
  {
    label: "READ THE AFTERMATH",
    title: "Every change has a source.",
    copy: "The last-month record separates your commitment, advisor reactions, the Corporation response, and automatic pressure.",
  },
  {
    label: "USE THE ROOM",
    title: "Advice is useful—and interested.",
    copy: "Consultation costs Intel and creates Leverage. Advisors recommend a real action, but each recommendation reflects an agenda.",
  },
] as const;

const ECHO_LABELS = {
  card: "Situation Deck",
  relationship: "advisor relationship",
  system: "operating doctrine",
  ending: "final record",
} as const;

function ResultGroup({ effect }: { effect: ResolvedEffect }) {
  const changes = formatStateDelta(effect.delta);
  return (
    <section className="result-group">
      <strong>{effect.label}</strong>
      {changes.length > 0 ? (
        <ul>{changes.map((change) => <li key={change}>{change}</li>)}</ul>
      ) : (
        <p>No meter changed immediately.</p>
      )}
    </section>
  );
}

export function CampaignScreen({
  state,
  error,
  onCommit,
  onConsult,
  onOpenArchive,
  onOpenPlaytest,
  onBookmark,
  guidedObjective = null,
}: Props) {
  const card = getActiveCard(state);
  const valid = getValidActions(state);
  const latestDecision = state.decisionHistory.at(-1);
  const canActivate = valid.some((action) => action.type === "activate_brb");
  const consultationCost = getConsultationCost(state);
  const recommendation = state.consultation
    ? getAdvisorRecommendation(
        state,
        state.consultation.advisorId,
        state.consultation.predictedStrategy,
      )
    : null;
  const corporationPressure = getCorporationPressure(state);
  const completionPressure = getCompletionPressure(state);
  const onboarding = state.turn <= 3 ? ONBOARDING_STEPS[state.turn - 1] : null;

  function actionControl(
    action: MajorAction,
    options: { className?: string; forceDisabled?: boolean; compact?: boolean } = {},
  ) {
    const preview = getActionPreview(state, action);
    const disabled = Boolean(options.forceDisabled || preview.disabledReason);
    const recommended = recommendation?.actionKey === actionKey(action);
    const trigger = (
      <button
        key={preview.actionKey}
        className={[
          "action-control",
          options.compact ? "compact-action" : "",
          options.className ?? "",
          recommended ? "recommended-action" : "",
        ].filter(Boolean).join(" ")}
        disabled={disabled}
        onClick={card && action.type !== "resolve_card" ? undefined : () => onCommit(action)}
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
        {preview.disabledReason ? <span className="action-disabled">{preview.disabledReason}</span> : null}
      </button>
    );

    if (!card || action.type === "resolve_card") return trigger;
    const expires = action.type === "activate_brb";
    return (
      <ConfirmActionDialog
        key={preview.actionKey}
        trigger={trigger}
        title={expires ? `Activate with “${card.title}” unresolved?` : `Ignore “${card.title}”?`}
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

  const resolutionGroups = state.lastTurnResolution
    ? [
        state.lastTurnResolution.ignoredSituation,
        state.lastTurnResolution.commitment,
        state.lastTurnResolution.advisorReactions,
        state.lastTurnResolution.corporationResponse,
        state.lastTurnResolution.monthlyPressure,
      ].filter((effect): effect is ResolvedEffect => effect !== null)
    : [];

  return (
    <main className="shell campaign-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">BRB CONTROL ROOM · {state.runId.slice(0, 14)}</p>
          <strong>{formatCampaignTime(state.turn)}</strong>
        </div>
        <div className="header-actions">
          <HowToPlayDialog />
          {onBookmark ? <PlaytestBookmarkDialog onSave={onBookmark} /> : null}
          {onOpenPlaytest ? (
            <button className="text-button" type="button" onClick={onOpenPlaytest}>
              Playtest Journal
            </button>
          ) : null}
          <button className="text-button" type="button" onClick={onOpenArchive}>Archive</button>
        </div>
      </header>

      {state.experiment ? (
        <aside className="objective compact"><span>NEXT-RUN THEORY</span>{state.experiment}</aside>
      ) : null}
      {guidedObjective ? (
        <aside className="guided-objective" aria-labelledby="guided-objective-title">
          <div>
            <p className="file-label">ACTIVE PLAYTEST DIRECTIVE</p>
            <h2 id="guided-objective-title">{guidedObjective.label}</h2>
            <p>{guidedObjective.strategy}</p>
          </div>
          <ul>{guidedObjective.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </aside>
      ) : null}
      {error ? <p role="alert" className="error-banner">{error}</p> : null}

      {onboarding ? (
        <section className="first-turn-guide" aria-labelledby="first-turn-title">
          <div>
            <p className="file-label">{onboarding.label} · BRIEF {state.turn} OF 3</p>
            <h2 id="first-turn-title">{onboarding.title}</h2>
            <p>{onboarding.copy}</p>
          </div>
          <ol>
            <li><strong>Assess</strong><span>Read the Situation, state pressure, and Corporation Watch.</span></li>
            <li><strong>Investigate</strong><span>Consult one advisor if their biased advice is worth the cost.</span></li>
            <li><strong>Commit</strong><span>Choose one action; the exact aftermath appears next month.</span></li>
          </ol>
        </section>
      ) : null}

      <section className="metric-strip" aria-label="Active resources">
        {RESOURCE_KEYS.map((key) => (
          <div className="metric" key={key} title={RESOURCE_GUIDANCE[key]}>
            <span>{RESOURCE_LABELS[key]}</span><strong>{state.resources[key]}</strong>
            <small>{RESOURCE_GUIDANCE[key]}</small>
            <i style={{ width: `${state.resources[key]}%` }} />
          </div>
        ))}
      </section>

      <section className="state-pressure-strip" aria-label="State pressure">
        <article>
          <span>Stress</span><strong>{state.pressures.stress} / 100</strong>
          <p>At 80+, administrative overload drains 4 Trust every month.</p>
        </article>
        <article className={state.pressures.panic >= 75 ? "danger-metric" : ""}>
          <span>Panic</span><strong>{state.pressures.panic} / 100</strong>
          <p>At 100, public order collapses and the campaign ends.</p>
        </article>
        <article className={state.institutions <= 25 ? "danger-metric" : ""}>
          <span>Institutions</span><strong>{state.institutions} / 100</strong>
          <p>At 0, the state collapses. Protection can restore this meter.</p>
        </article>
      </section>

      <div className="campaign-grid">
        <section className="paper-panel situation-panel">
          <div className="panel-heading">
            <div>
              <p className="file-label">SITUATION DECK</p>
              <h1>{card?.title ?? "No active file"}</h1>
            </div>
            {card ? (
              <span className={`classification ${card.rarity}`}>
                {card.type} · {card.rarity}
              </span>
            ) : null}
          </div>
          <p className="situation-copy">
            {card?.description ?? "The desk is quiet. Choose where to commit the administration."}
          </p>
          {card ? (
            <div className="choice-list">
              {card.choices.map((choice) => actionControl(
                { type: "resolve_card", choiceId: choice.id },
              ))}
            </div>
          ) : null}

          {resolutionGroups.length > 0 ? (
            <aside className="consequence-box" aria-label="Last month’s result">
              <span>LAST MONTH’S RESULT · EXACT CHANGES</span>
              <div className="result-groups">
                {resolutionGroups.map((effect) => <ResultGroup effect={effect} key={effect.label} />)}
              </div>
              {latestDecision?.echoTypes.length ? (
                <p className="classified-echo">
                  <strong>Delayed Echo registered:</strong>{" "}
                  {[...new Set(latestDecision.echoTypes.map((type) => ECHO_LABELS[type]))].join(", ")}.
                  Details remain classified until they surface in the campaign or Declassified Report.
                </p>
              ) : null}
            </aside>
          ) : null}
        </section>

        <aside className="operations-column">
          <section className="dark-panel">
            <p className="file-label">BRB TRACKS · READINESS THRESHOLD 50</p>
            {TRACK_KEYS.map((track) => (
              <div className="track-row" key={track}>
                <div>
                  <span>{TRACK_LABELS[track]}</span>
                  <strong>{state.tracks[track]} / 50 {state.tracks[track] >= 50 ? "· READY" : ""}</strong>
                </div>
                <p>{TRACK_GUIDANCE[track].question}</p>
                <progress
                  aria-label={`${TRACK_LABELS[track]} readiness`}
                  max="50"
                  value={Math.min(50, state.tracks[track])}
                />
                <div className="track-actions">
                  {actionControl({ type: "deposit", track, size: "standard" }, { compact: true })}
                  {actionControl({ type: "deposit", track, size: "large" }, { compact: true })}
                </div>
                <small>Track exposure: {TRACK_GUIDANCE[track].sideEffect}</small>
              </div>
            ))}
            {actionControl(
              { type: "activate_brb" },
              { className: "activate-button", forceDisabled: !canActivate },
            )}
          </section>
        </aside>
      </div>

      <section className="lower-grid">
        <article className="dark-panel advisors-panel">
          <div className="panel-heading">
            <div><p className="file-label">ADVISORS</p><h2>Consult before committing</h2></div>
          </div>
          <p className="panel-explainer">
            Consultation costs {consultationCost.intelligence} Intel and gives the advisor +{consultationCost.leverage} Leverage.
            Leverage is the power they accumulate over your administration.
          </p>
          <div className="advisor-list">
            {(Object.keys(ADVISORS) as AdvisorId[]).map((id) => {
              const advisor = state.advisors[id];
              const ability = getArchetypeAbilityPreview(state, id);
              return (
                <section className={!advisor.active ? "advisor inactive" : "advisor"} key={id}>
                  <div className="advisor-identity">
                    <strong>{ADVISORS[id].name}</strong>
                    <small>{ADVISORS[id].specialty}</small>
                    <small>Leverage {advisor.leverage} · Alignment {advisor.alignment} · Loyalty {advisor.loyalty}</small>
                    <p>{ADVISORS[id].bias}</p>
                  </div>
                  <div className="advisor-actions">
                    <button
                      disabled={!advisor.active || state.phase !== "briefing" || state.resources.intelligence < 2}
                      onClick={() => onConsult(id, false)}
                    >
                      Consult
                    </button>
                    {ability ? (
                      <button
                        disabled={!advisor.active || state.phase !== "briefing"}
                        onClick={() => onConsult(id, true)}
                        title={`${ability.cost}. ${ability.result}`}
                      >
                        {ability.name}
                        <small>{ability.cost}</small>
                      </button>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
          {state.consultation ? (
            <aside className="advisor-brief">
              <p className="file-label">ADVISORY OPINION · NOT AN OPTIMALITY CLAIM</p>
              <h3>{state.consultation.message}</h3>
              <p>Forecast confidence: <strong>{state.consultation.confidence}</strong>.</p>
              {recommendation ? (
                <>
                  <p><strong>Recommended commitment:</strong> {recommendation.actionLabel}</p>
                  <p>{recommendation.rationale}</p>
                  <p><strong>Caution:</strong> {recommendation.warning}</p>
                </>
              ) : null}
            </aside>
          ) : null}
        </article>

        <article className="dark-panel actions-panel">
          <p className="file-label">OTHER COMMITMENTS</p>
          <p className="panel-explainer">Each control below consumes the month. Costs and known exposure are listed before authorization.</p>
          <div className="button-grid">
            {actionControl({
              type: "counter_corporation",
              predictedStrategy: state.consultation?.predictedStrategy ?? state.corporation.strategy,
            }, { compact: true })}
            {actionControl({ type: "protect_institutions" }, { compact: true })}
            {actionControl({ type: "strengthen_faction" }, { compact: true })}
            {(Object.keys(ADVISORS) as AdvisorId[]).map((advisorId) => actionControl(
              { type: "manage_advisor", advisorId },
              { compact: true },
            ))}
            {RESOURCE_KEYS.map((resource) => actionControl(
              { type: "recover_resource", resource },
              { compact: true },
            ))}
          </div>
        </article>

        <article className="dark-panel briefing-panel">
          <p className="file-label">CORPORATION WATCH</p>
          <div className="watch-meter">
            <span>Progress</span>
            <strong>{state.corporation.progress}<small>/ 100</small></strong>
            <p>At 100, the Corporation completes its objective and wins.</p>
          </div>
          <div className="watch-section">
            <span>Threat · {corporationPressure.tier}</span>
            <strong>{state.corporation.threat} / 100</strong>
            <p>{describeCorporationPressure(state)}</p>
          </div>
          <div className="watch-section">
            <span>Posture</span>
            <strong>{state.corporation.strategy.replaceAll("_", " ")}</strong>
            <p>{describeCorporationPosture(state.corporation.strategy)}</p>
          </div>
          <div className="watch-section">
            <span>Response clock</span>
            <strong>
              {corporationPressure.monthsUntilResponse === 0
                ? "Response due now"
                : `${corporationPressure.monthsUntilResponse} month${corporationPressure.monthsUntilResponse === 1 ? "" : "s"}`}
            </strong>
            <p>Expected Month {corporationPressure.nextResponseMonth}. A correct counter pushes back Progress and Threat; a wrong counter raises Threat.</p>
          </div>
          <details className="watch-details">
            <summary>Why pressure is rising</summary>
            <p>
              BRB completion pressure is {completionPressure.tier} at {completionPressure.completionPercent}%.
              {` ${describeCompletionPressure(completionPressure)}.`}
            </p>
          </details>
        </article>
      </section>
    </main>
  );
}
