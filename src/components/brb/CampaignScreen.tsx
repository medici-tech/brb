import {
  getAdvisorRecommendation,
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
import { CampaignActionControl } from "./CampaignActionControl";
import { CorporationWatchPanel } from "./CorporationWatchPanel";
import { HowToPlayDialog } from "./HowToPlayDialog";
import { LastTurnResult } from "./LastTurnResult";
import { OtherCommitmentsPanel } from "./OtherCommitmentsPanel";
import { PlaytestBookmarkDialog } from "./PlaytestBookmarkDialog";

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
  const recommendation = state.consultation
    ? getAdvisorRecommendation(
        state,
        state.consultation.advisorId,
        state.consultation.predictedStrategy,
      )
    : null;
  const onboarding = state.turn <= 3 ? ONBOARDING_STEPS[state.turn - 1] : null;

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
              {card.choices.map((choice) => (
                <CampaignActionControl
                  key={choice.id}
                  state={state}
                  action={{ type: "resolve_card", choiceId: choice.id }}
                  recommendation={recommendation}
                  activeCardTitle={card.title}
                  onCommit={onCommit}
                />
              ))}
            </div>
          ) : null}

          <LastTurnResult
            resolution={state.lastTurnResolution}
            echoTypes={latestDecision?.echoTypes ?? []}
          />
        </section>

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
        <CampaignAdvisors
          state={state}
          recommendation={recommendation}
          onConsult={onConsult}
        />
        <OtherCommitmentsPanel
          state={state}
          recommendation={recommendation}
          activeCardTitle={card?.title ?? null}
          onCommit={onCommit}
        />
        <CorporationWatchPanel state={state} />
      </section>
    </main>
  );
}
