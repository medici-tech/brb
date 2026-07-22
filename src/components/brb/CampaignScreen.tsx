import { useEffect, useRef, useState } from "react";
import {
  getAdvisorRecommendation,
  getAdvisorTurnMoment,
  getTurnEchoTypes,
  RESOURCE_GUIDANCE,
  RESOURCE_LABELS,
} from "../../game/guidance";
import { getActiveCard, getValidActions } from "../../game/engine";
import { formatCampaignTime } from "../../game/progression";
import { RESOURCE_KEYS } from "../../game/types";
import type {
  AdvisorId,
  CommitOptions,
  GameState,
  MajorAction,
} from "../../game/types";
import type { BookmarkInput, GuidedRunObjective } from "../../playtest/journal";
import { BrbTracksPanel } from "./BrbTracksPanel";
import { CampaignAdvisors } from "./CampaignAdvisors";
import { CampaignSituationWorkspace } from "./CampaignSituationWorkspace";
import { CorporationWatchPanel } from "./CorporationWatchPanel";
import {
  derivePresentationInputs,
  resolvePresentationModel,
} from "./control-room/presentationStateResolver";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { OtherCommitmentsPanel } from "./OtherCommitmentsPanel";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";
import { TurnTransitionDialog } from "./TurnTransitionDialog";

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
    title: "Assess → Consult optionally → Commit.",
    copy: "Read the Situation and danger meters, ask one interested advisor if useful, then authorize exactly one commitment.",
  },
  {
    label: "READ THE AFTERMATH",
    title: "Review → Adapt → Commit again.",
    copy: "The last-month record attributes every change. Use it to choose what this month must protect or advance.",
  },
  {
    label: "USE THE ROOM",
    title: "Advice has a price and an agenda.",
    copy: "Consultation costs Intel and creates Leverage. Loyalty and Leverage determine whether an advisor remains.",
  },
] as const;

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
  const latestDecisionId = latestDecision?.id;
  const resolvedEchoTypes = state.lastTurnResolution
    ? getTurnEchoTypes(state, state.lastTurnResolution.month)
    : [];
  const advisorMoment = getAdvisorTurnMoment(state, state.lastTurnResolution);
  const situationWorkspaceRef = useRef<HTMLElement>(null);
  const previousDecisionIdRef = useRef(latestDecisionId);
  const shouldFocusWorkspaceRef = useRef(false);
  const [transitionDecisionId, setTransitionDecisionId] = useState<string | null>(null);
  const canActivate = valid.some((action) => action.type === "activate_brb");
  const recommendation = state.consultation
    ? getAdvisorRecommendation(
        state,
        state.consultation.advisorId,
        state.consultation.predictedStrategy,
      )
    : null;
  const onboarding = state.turn <= 3 ? ONBOARDING_STEPS[state.turn - 1] : null;
  const controlRoomModel = resolvePresentationModel(
    derivePresentationInputs(state, card?.type ?? null),
  );

  useEffect(() => {
    if (!latestDecisionId || previousDecisionIdRef.current === latestDecisionId) return;
    previousDecisionIdRef.current = latestDecisionId;
    setTransitionDecisionId(latestDecisionId);
  }, [latestDecisionId]);

  useEffect(() => {
    if (transitionDecisionId || !shouldFocusWorkspaceRef.current) return;
    shouldFocusWorkspaceRef.current = false;
    const workspace = situationWorkspaceRef.current;
    if (!workspace) return;
    workspace.focus({ preventScroll: true });
    workspace.scrollIntoView({ behavior: "auto", block: "start" });
  }, [transitionDecisionId]);

  function continueToBriefing(): void {
    shouldFocusWorkspaceRef.current = true;
    setTransitionDecisionId(null);
  }

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
            <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>
              Internal Playtest
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
          <p className="file-label">{onboarding.label} · BRIEF {state.turn} OF 3</p>
          <div>
            <h2 id="first-turn-title">{onboarding.title}</h2>
            <p>{onboarding.copy}</p>
          </div>
        </section>
      ) : null}

      <section className="state-pressure-strip" aria-label="State pressure" tabIndex={0}>
        <article className={state.pressures.stress >= 75 ? "danger-metric" : ""}>
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
        <article className={state.corporation.progress >= 75 ? "danger-metric" : ""}>
          <span>Corporation Progress</span><strong>{state.corporation.progress} / 100</strong>
          <p>At 100, the Corporation wins. At 80+, activation risks capture.</p>
        </article>
      </section>

      <section className="mobile-situation-brief" aria-label="Current Situation">
        <p className="file-label">
          {card ? "CURRENT SITUATION" : "SITUATION DECK · STANDBY"}
        </p>
        <h1>{card?.title ?? "No active file"}</h1>
        <p>
          {card?.description
            ?? "The desk is quiet. Choose where to commit the administration."}
        </p>
      </section>

      <section className="metric-strip" aria-label="Active resources" tabIndex={0}>
        {RESOURCE_KEYS.map((key) => (
          <div className="metric" key={key} title={RESOURCE_GUIDANCE[key]}>
            <span>{RESOURCE_LABELS[key]}</span><strong>{state.resources[key]}</strong>
            <i style={{ width: `${state.resources[key]}%` }} />
          </div>
        ))}
      </section>
      <details className="meter-guide">
        <summary>What do these resources fund?</summary>
        <dl>
          {RESOURCE_KEYS.map((key) => (
            <div key={key}><dt>{RESOURCE_LABELS[key]}</dt><dd>{RESOURCE_GUIDANCE[key]}</dd></div>
          ))}
        </dl>
      </details>

      <CampaignAdvisors
        state={state}
        recommendation={recommendation}
        onConsult={onConsult}
      />

      <div className={`campaign-grid ${card ? "has-active-card" : "no-active-card"}`}>
        <CampaignSituationWorkspace
          state={state}
          card={card}
          recommendation={recommendation}
          model={controlRoomModel}
          resolvedEchoTypes={resolvedEchoTypes}
          workspaceRef={situationWorkspaceRef}
          onCommit={onCommit}
        />

        <aside className="operations-column">
          <BrbTracksPanel
            state={state}
            recommendation={recommendation}
            activeCardTitle={card?.title ?? null}
            canActivate={canActivate}
            onCommit={onCommit}
          />
        </aside>
      </div>

      <section className="lower-grid">
        <OtherCommitmentsPanel
          state={state}
          recommendation={recommendation}
          activeCardTitle={card?.title ?? null}
          onCommit={onCommit}
        />
        <CorporationWatchPanel state={state} />
      </section>

      <TurnTransitionDialog
        advisorMoment={advisorMoment}
        echoTypes={resolvedEchoTypes}
        nextTurn={state.turn}
        onContinue={continueToBriefing}
        open={transitionDecisionId === latestDecisionId}
        resolution={state.lastTurnResolution}
      />
    </main>
  );
}
