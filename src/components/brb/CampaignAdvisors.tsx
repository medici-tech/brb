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
import { Button } from "../ui/button";
import { AdvisorPanel, OutcomeNotice } from "./ui";

interface Props {
  state: GameState;
  recommendation: AdvisorRecommendation | null;
  onConsult: (advisorId: AdvisorId, useAbility: boolean) => void;
}

export function CampaignAdvisors({ state, recommendation, onConsult }: Props) {
  const consultationCost = getConsultationCost(state);

  return (
    <details className="campaign-consultation mb-3 border border-border bg-[color:var(--console-600)] px-5 py-4" open={Boolean(state.consultation)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 max-sm:flex-col max-sm:items-start [&::-webkit-details-marker]:hidden">
        <span className="grid gap-1">
          <span className="file-label">OPTIONAL CONSULTATION</span>
          <strong className="text-base">
            {state.consultation
              ? `${ADVISORS[state.consultation.advisorId].name} briefed you`
              : "Consult one advisor before committing"}
          </strong>
        </span>
        <small className="text-muted-foreground">
          Cost {consultationCost.intelligence} Intel · +{consultationCost.leverage} Leverage
        </small>
      </summary>
      <p className="text-xs leading-5 text-muted-foreground">
        Alignment affects advice quality. An advisor leaves if Loyalty falls below their
        listed threshold or Leverage reaches 90.
      </p>
      {state.consultation ? (
        <aside aria-live="polite">
          <OutcomeNotice
            eyebrow="ADVISORY OPINION · INTERESTED ADVICE"
            title={state.consultation.message}
            description={<>Forecast confidence: <strong>{state.consultation.confidence}</strong>.</>}
            details={recommendation ? (
              <div className="grid gap-2">
                <p className="m-0"><strong>Recommended commitment:</strong> {recommendation.actionLabel}</p>
                <p className="m-0">{recommendation.rationale}</p>
                <p className="m-0"><strong>Caution:</strong> {recommendation.warning}</p>
              </div>
            ) : undefined}
            tone="warning"
          />
        </aside>
      ) : null}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {ADVISOR_IDS.map((id) => {
          const advisor = state.advisors[id];
          const definition = ADVISORS[id];
          const ability = getArchetypeAbilityPreview(state, id);
          const consultationError = getConsultationError(state, id);
          return (
            <AdvisorPanel
              name={definition.name}
              role={definition.specialty}
              status={null}
              showPortrait={false}
              className={!advisor.active ? "opacity-45" : ""}
              stats={[
                { label: "Alignment · advice quality", value: advisor.alignment },
                { label: `Loyalty · leaves below ${definition.loyaltyBreakingPoint}`, value: advisor.loyalty },
                { label: "Leverage · leaves at 90", value: advisor.leverage },
              ]}
              description={definition.bias}
              footer={(
                <>
                  <Button
                  className="w-full"
                  variant="quiet"
                  type="button"
                  aria-label={`Consult ${definition.name}`}
                  disabled={Boolean(consultationError)}
                  onClick={() => onConsult(id, false)}
                  title={consultationError ?? undefined}
                >
                  Consult
                  </Button>
                {ability ? (
                  <Button
                    className="h-auto min-h-11 w-full flex-col gap-1 whitespace-normal"
                    variant="quiet"
                    type="button"
                    aria-label={`${ability.name} with ${definition.name}`}
                    disabled={Boolean(consultationError)}
                    onClick={() => onConsult(id, true)}
                    title={consultationError ?? `${ability.cost}. ${ability.result}`}
                  >
                    {ability.name}
                    <small className="text-[9px]">{ability.cost}</small>
                  </Button>
                ) : null}
                {consultationError ? <small className="text-[9px] leading-4 text-destructive-soft">{consultationError}</small> : null}
              </>
              )}
              key={id}
            />
          );
        })}
      </div>
    </details>
  );
}
