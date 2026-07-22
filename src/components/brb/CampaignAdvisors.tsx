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
    <details className="dark-panel campaign-consultation" open={Boolean(state.consultation)}>
      <summary>
        <span>
          <span className="file-label">OPTIONAL CONSULTATION</span>
          <strong>
            {state.consultation
              ? `${ADVISORS[state.consultation.advisorId].name} briefed you`
              : "Consult one advisor before committing"}
          </strong>
        </span>
        <small>
          Cost {consultationCost.intelligence} Intel · +{consultationCost.leverage} Leverage
        </small>
      </summary>
      <p className="panel-explainer">
        Alignment affects advice quality. An advisor leaves if Loyalty falls below their
        listed threshold or Leverage reaches 90.
      </p>
      {state.consultation ? (
        <aside className="advisor-brief" aria-live="polite">
          <p className="file-label">ADVISORY OPINION · INTERESTED ADVICE</p>
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
      <div className="advisor-list">
        {ADVISOR_IDS.map((id) => {
          const advisor = state.advisors[id];
          const definition = ADVISORS[id];
          const ability = getArchetypeAbilityPreview(state, id);
          const consultationError = getConsultationError(state, id);
          return (
            <section className={!advisor.active ? "advisor inactive" : "advisor"} key={id}>
              <div className="advisor-identity">
                <strong>{definition.name}</strong>
                <small>{definition.specialty}</small>
                <div className="advisor-meters">
                  <span>Alignment <b>{advisor.alignment}</b> · advice quality</span>
                  <span>
                    Loyalty <b>{advisor.loyalty}</b> · leaves below{" "}
                    {definition.loyaltyBreakingPoint}
                  </span>
                  <span>Leverage <b>{advisor.leverage}</b> · leaves at 90</span>
                </div>
                <p>{definition.bias}</p>
              </div>
              <div className="advisor-actions">
                <button
                  type="button"
                  aria-label={`Consult ${definition.name}`}
                  disabled={Boolean(consultationError)}
                  onClick={() => onConsult(id, false)}
                  title={consultationError ?? undefined}
                >
                  Consult
                </button>
                {ability ? (
                  <button
                    type="button"
                    aria-label={`${ability.name} with ${definition.name}`}
                    disabled={Boolean(consultationError)}
                    onClick={() => onConsult(id, true)}
                    title={consultationError ?? `${ability.cost}. ${ability.result}`}
                  >
                    {ability.name}
                    <small>{ability.cost}</small>
                  </button>
                ) : null}
                {consultationError ? <small className="advisor-disabled-reason">{consultationError}</small> : null}
              </div>
            </section>
          );
        })}
      </div>
    </details>
  );
}
