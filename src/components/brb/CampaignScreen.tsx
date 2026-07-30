import { useEffect, useRef, useState } from "react";
import {
  getAdvisorRecommendation,
  getTurnEchoTypes,
  RESOURCE_GUIDANCE,
  RESOURCE_LABELS,
} from "../../game/guidance";
import { getActiveCard, getValidActions } from "../../game/engine";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { formatCampaignTime } from "../../game/progression";
import { deriveTurnBeats } from "../../game/turn-beats";
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
import { CreditsDialog } from "./CreditsDialog";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { OtherCommitmentsPanel } from "./OtherCommitmentsPanel";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";
import { TurnTransitionDialog } from "./TurnTransitionDialog";
import {
  ConsolePanel,
  GuidedObjective,
  MetricStrip,
  type BrbStat,
} from "./ui";

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
    title: "Improve → Connect → Face the new problem.",
    copy: "The aftermath names what improved, which earlier choice mattered, and what pressure your success created. Adapt before committing again.",
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
  const turnBeats = deriveTurnBeats(state, state.lastTurnResolution);
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
  const equippedDirective = state.legacyDirective.equippedId
    ? LEGACY_DIRECTIVES[state.legacyDirective.equippedId]
    : null;
  const pressureStats: BrbStat[] = [
    {
      label: "Stress",
      value: `${state.pressures.stress} / 100`,
      tone: state.pressures.stress >= 75 ? "critical" : "neutral",
    },
    {
      label: "Panic",
      value: `${state.pressures.panic} / 100`,
      tone: state.pressures.panic >= 75 ? "critical" : "neutral",
    },
    {
      label: "Institutions",
      value: `${state.institutions} / 100`,
      tone: state.institutions <= 25 ? "critical" : "neutral",
    },
    {
      label: "Corporation Progress",
      value: `${state.corporation.progress} / 100`,
      tone: state.corporation.progress >= 75 ? "critical" : "neutral",
    },
  ];
  const pressureThresholds = [
    {
      label: "Stress",
      explanation: "At 80+, administrative overload drains 4 Trust every month.",
    },
    {
      label: "Panic",
      explanation: "At 100, public order collapses and the campaign ends.",
    },
    {
      label: "Institutions",
      explanation: "At 0, the state collapses. Protection can restore this meter.",
    },
    {
      label: "Corporation Progress",
      explanation: "At 100, the Corporation wins. At 80+, activation risks capture.",
    },
  ];
  const resourceStats: BrbStat[] = RESOURCE_KEYS.map((key) => ({
    label: RESOURCE_LABELS[key],
    value: state.resources[key],
    maximum: 100,
    tone: "stable",
  }));

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
          <CreditsDialog />
          {onBookmark ? <PlaytestBookmarkDialog onSave={onBookmark} /> : null}
          {onOpenPlaytest ? (
            <button className="text-button internal-tool-button" type="button" onClick={onOpenPlaytest}>
              Internal Playtest
            </button>
          ) : null}
          <button className="text-button" type="button" onClick={onOpenArchive}>Archive</button>
        </div>
      </header>

      {error ? <p role="alert" className="bg-[#7b2722] px-3.5 py-2.5 text-[#ffe6e3]">{error}</p> : null}

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

      {state.experiment ? (
        <GuidedObjective
          className="mb-5"
          eyebrow="NEXT-RUN THEORY"
          title={state.experiment}
          description=""
          compact
        />
      ) : null}
      {equippedDirective ? (
        <ConsolePanel className={`my-3 border-l-4 border-l-signal py-3.5 ${state.legacyDirective.used ? "opacity-60" : ""}`} label="Legacy Directive">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
            <p className="file-label">LEGACY DIRECTIVE · {equippedDirective.rarity}</p>
              <h2 className="brb-display m-0 text-xl leading-none font-semibold">{equippedDirective.title}</h2>
            </div>
            <p className="m-0 text-xs leading-5 text-muted-foreground">
              {state.legacyDirective.used
                ? "Authorization spent for this campaign."
                : `${equippedDirective.benefit} · ${equippedDirective.warning} · available once`}
            </p>
          </div>
        </ConsolePanel>
      ) : null}
      {guidedObjective ? (
        <GuidedObjective
          className="mb-5"
          eyebrow="ACTIVE PLAYTEST DIRECTIVE"
          title={guidedObjective.label}
          titleId="guided-objective-title"
          description={guidedObjective.strategy}
        >
          <ul>{guidedObjective.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </GuidedObjective>
      ) : null}
      {onboarding ? (
        <GuidedObjective
          className="first-turn-guide mb-2.5"
          eyebrow={`${onboarding.label} · BRIEF ${state.turn} OF 3`}
          title={onboarding.title}
          titleId="first-turn-title"
          description={onboarding.copy}
          compact
        />
      ) : null}

      <div className="state-pressure-rail mt-3 mb-2" aria-label="State pressure">
        <MetricStrip
          className="state-pressure-strip"
          columns={4}
          label="Pressure meters"
          stats={pressureStats}
          tabIndex={0}
        />
        <details className="meter-guide mt-1.5 text-[11px] text-muted-foreground">
          <summary className="inline-block cursor-pointer border-b border-muted-foreground">
            What do these pressure thresholds mean?
          </summary>
          <dl className="mt-2.5 grid gap-px bg-border md:grid-cols-4">
            {pressureThresholds.map((item) => (
              <div className="bg-[color:var(--console-600)] p-3" key={item.label}>
                <dt className="font-bold text-foreground">{item.label}</dt>
                <dd className="mt-1 mb-0 leading-5">{item.explanation}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>

      <MetricStrip
        className="metric-strip mb-2"
        label="Active resources"
        stats={resourceStats}
        tabIndex={0}
      />
      <details className="meter-guide mb-3 text-[11px] text-muted-foreground">
        <summary className="inline-block cursor-pointer border-b border-muted-foreground">What do these resources fund?</summary>
        <dl className="mt-2.5 grid gap-px bg-border md:grid-cols-5">
          {RESOURCE_KEYS.map((key) => (
            <div className="bg-[color:var(--console-600)] p-3" key={key}><dt className="font-bold text-foreground">{RESOURCE_LABELS[key]}</dt><dd className="mt-1 mb-0 leading-5">{RESOURCE_GUIDANCE[key]}</dd></div>
          ))}
        </dl>
      </details>

      <CampaignAdvisors
        state={state}
        recommendation={recommendation}
        onConsult={onConsult}
      />

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
        beats={turnBeats}
        echoTypes={resolvedEchoTypes}
        nextTurn={state.turn}
        onContinue={continueToBriefing}
        open={transitionDecisionId === latestDecisionId}
        resolution={state.lastTurnResolution}
        state={state}
      />
    </main>
  );
}
