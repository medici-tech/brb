import { ADVISORS, DEPOSIT_COSTS } from "../../game/content";
import {
  canUseArchetypeConsultation,
  getActiveCard,
  getBriefing,
  getValidActions,
} from "../../game/engine";
import { formatCampaignTime } from "../../game/progression";
import { RESOURCE_KEYS, TRACK_KEYS } from "../../game/types";
import type { AdvisorId, CommitOptions, GameState, MajorAction } from "../../game/types";
import { ConfirmActionDialog } from "./ui/decisions";

type Props = {
  state: GameState;
  error: string | null;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
  onConsult: (advisorId: AdvisorId, useAbility: boolean) => void;
  onOpenArchive: () => void;
};

const LABELS: Record<string, string> = {
  money: "Money",
  influence: "Influence",
  intelligence: "Intel",
  trust: "Trust",
  capacity: "Capacity",
  engineering: "Engineering",
  access: "Access",
  legitimacy: "Legitimacy",
  stability: "Stability",
};

export function CampaignScreen({ state, error, onCommit, onConsult, onOpenArchive }: Props) {
  const card = getActiveCard(state);
  const valid = getValidActions(state);
  const latestDecision = state.decisionHistory.at(-1);
  const canActivate = valid.some((action) => action.type === "activate_brb");

  function commitmentButton(
    key: string,
    label: string,
    action: MajorAction,
    className?: string,
    disabled = false,
  ) {
    const trigger = (
      <button key={key} className={className} disabled={disabled} onClick={card ? undefined : () => onCommit(action)}>
        {label}
      </button>
    );
    if (!card) return trigger;
    const expires = action.type === "activate_brb";
    return (
      <ConfirmActionDialog
        key={key}
        trigger={trigger}
        title={expires ? `Activate with “${card.title}” unresolved?` : `Ignore “${card.title}”?`}
        description={
          expires
            ? "Activation ends the campaign and this Situation Card will expire unresolved."
            : `${card.ignoredOutcome.echoHint} Confirming applies that consequence before the selected commitment.`
        }
        confirmAction={{
          label: expires ? "Expire card and activate" : `Ignore card and ${label}`,
          disabled,
          onSelect: () => onCommit(action, { confirmCardAbandonment: true }),
        }}
      />
    );
  }

  return (
    <main className="shell campaign-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">BRB CONTROL ROOM · {state.runId.slice(0, 14)}</p>
          <strong>{formatCampaignTime(state.turn)}</strong>
        </div>
        <button className="text-button" onClick={onOpenArchive}>Archive</button>
      </header>

      {state.experiment ? <aside className="objective compact"><span>NEXT-RUN THEORY</span>{state.experiment}</aside> : null}
      {error ? <p role="alert" className="error-banner">{error}</p> : null}

      <section className="metric-strip" aria-label="Active resources">
        {RESOURCE_KEYS.map((key) => (
          <div className="metric" key={key}>
            <span>{LABELS[key]}</span><strong>{state.resources[key]}</strong>
            <i style={{ width: `${state.resources[key]}%` }} />
          </div>
        ))}
      </section>

      <div className="campaign-grid">
        <section className="paper-panel situation-panel">
          <div className="panel-heading">
            <div>
              <p className="file-label">SITUATION DECK</p>
              <h1>{card?.title ?? "No active file"}</h1>
            </div>
            {card ? <span className={`classification ${card.rarity}`}>{card.type} · {card.rarity}</span> : null}
          </div>
          <p className="situation-copy">{card?.description ?? "The desk is quiet. Choose where to commit the administration."}</p>
          {card ? (
            <div className="choice-list">
              {card.choices.map((choice) => (
                <button key={choice.id} onClick={() => onCommit({ type: "resolve_card", choiceId: choice.id })}>
                  <span>{choice.label}</span>
                  <small>Immediate cost visible · delayed echo classified</small>
                </button>
              ))}
            </div>
          ) : null}
          {latestDecision ? (
            <aside className="consequence-box" aria-label="Latest consequence">
              <span>IMMEDIATE CONSEQUENCE</span>
              <p>{latestDecision.summary}</p>
              {latestDecision.echoHints.length > 0 ? (
                <details>
                  <summary>Delayed echo detected</summary>
                  <p>{latestDecision.echoHints[0]}</p>
                </details>
              ) : null}
            </aside>
          ) : null}
        </section>

        <aside className="operations-column">
          <section className="dark-panel">
            <p className="file-label">BRB TRACKS</p>
            {TRACK_KEYS.map((track) => (
              <div className="track-row" key={track}>
                <div><span>{LABELS[track]}</span><strong>{state.tracks[track]} / 50</strong></div>
                <progress max="100" value={state.tracks[track]} />
                <div className="track-actions">
                  {commitmentButton(`${track}-standard`, "Deposit", { type: "deposit", track, size: "standard" })}
                  {commitmentButton(`${track}-large`, "Large", { type: "deposit", track, size: "large" })}
                </div>
                <small>Standard: {Object.entries(DEPOSIT_COSTS[track]).filter(([, amount]) => amount > 0).map(([key, amount]) => `${amount} ${LABELS[key]}`).join(" · ")}</small>
              </div>
            ))}
            {commitmentButton("activate", "Activate BRB", { type: "activate_brb" }, "activate-button", !canActivate)}
          </section>
        </aside>
      </div>

      <section className="lower-grid">
        <article className="dark-panel">
          <div className="panel-heading"><div><p className="file-label">ADVISORS</p><h2>Consult before committing</h2></div></div>
          <div className="advisor-list">
            {(Object.keys(ADVISORS) as AdvisorId[]).map((id) => {
              const advisor = state.advisors[id];
              const ability = canUseArchetypeConsultation(state, id);
              return (
                <div className={!advisor.active ? "advisor inactive" : "advisor"} key={id}>
                  <div><strong>{ADVISORS[id].name}</strong><small>Leverage {advisor.leverage} · Alignment {advisor.alignment}</small></div>
                  <button disabled={!advisor.active || state.phase !== "briefing"} onClick={() => onConsult(id, ability)}>
                    {ability ? "Consult + ability" : "Consult"}
                  </button>
                </div>
              );
            })}
          </div>
          {state.consultation ? <p className="forecast">{state.consultation.message} Confidence: {state.consultation.confidence}.</p> : null}
        </article>

        <article className="dark-panel actions-panel">
          <p className="file-label">OTHER COMMITMENTS</p>
          <div className="button-grid">
            {commitmentButton("counter", `Counter ${state.consultation?.predictedStrategy ?? state.corporation.strategy}`, { type: "counter_corporation", predictedStrategy: state.consultation?.predictedStrategy ?? state.corporation.strategy })}
            {commitmentButton("institutions", "Protect institutions", { type: "protect_institutions" })}
            {commitmentButton("faction", "Strengthen coalition", { type: "strengthen_faction" })}
            {commitmentButton("fixer", "Manage Fixer", { type: "manage_advisor", advisorId: "fixer" })}
            {RESOURCE_KEYS.map((resource) => commitmentButton(`recover-${resource}`, `Recover ${LABELS[resource]}`, { type: "recover_resource", resource }))}
          </div>
        </article>

        <article className="dark-panel briefing-panel">
          <p className="file-label">CORPORATION WATCH</p>
          <div className="threat-number">{state.corporation.progress}<small>% progress</small></div>
          <p>Threat {state.corporation.threat} · Current posture: {state.corporation.strategy.replace("_", " ")}</p>
          <ul>{getBriefing(state).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>
    </main>
  );
}
