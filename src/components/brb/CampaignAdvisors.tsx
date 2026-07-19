import { ADVISORS } from "../../game/content";
import { getArchetypeAbilityPreview } from "../../game/guidance";
import {
  getConsultationCost,
  getConsultationError,
} from "../../game/engine";
import { ADVISOR_IDS } from "../../game/types";
import type {
  AdvisorId,
  AdvisorRecommendation,
  GameState,
} from "../../game/types";

interface Props {
  state: GameState;
  recommendation: AdvisorRecommendation | null;
  onConsult: (advisorId: AdvisorId, useAbility: boolean) => void;
}

export function CampaignAdvisors({ state, recommendation, onConsult }: Props) {
  const consultationCost = getConsultationCost(state);

  return (
    <article className="dark-panel advisors-panel">
      <div className="panel-heading">
        <div><p className="file-label">ADVISORS</p><h2>Consult before committing</h2></div>
      </div>
      <p className="panel-explainer">
        Consultation costs {consultationCost.intelligence} Intel and gives the advisor
        +{consultationCost.leverage} Leverage. Leverage is the power they accumulate over
        your administration.
      </p>
      <div className="advisor-list">
        {ADVISOR_IDS.map((id) => {
          const advisor = state.advisors[id];
          const ability = getArchetypeAbilityPreview(state, id);
          const consultationError = getConsultationError(state, id);
          return (
            <section className={!advisor.active ? "advisor inactive" : "advisor"} key={id}>
              <div className="advisor-identity">
                <strong>{ADVISORS[id].name}</strong>
                <small>{ADVISORS[id].specialty}</small>
                <small>
                  Leverage {advisor.leverage} · Alignment {advisor.alignment} · Loyalty{" "}
                  {advisor.loyalty}
                </small>
                <p>{ADVISORS[id].bias}</p>
              </div>
              <div className="advisor-actions">
                <button
                  type="button"
                  disabled={Boolean(consultationError)}
                  onClick={() => onConsult(id, false)}
                  title={consultationError ?? undefined}
                >
                  Consult
                </button>
                {ability ? (
                  <button
                    type="button"
                    disabled={Boolean(consultationError)}
                    onClick={() => onConsult(id, true)}
                    title={consultationError ?? `${ability.cost}. ${ability.result}`}
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
  );
}
