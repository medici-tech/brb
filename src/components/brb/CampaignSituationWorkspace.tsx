import type { RefObject } from "react";
import type {
  AdvisorRecommendation,
  CommitOptions,
  EchoType,
  GameState,
  MajorAction,
  SituationCard,
} from "../../game/types";
import { CampaignActionControl } from "./CampaignActionControl";
import { ControlRoomPresentation } from "./control-room/ControlRoomPresentation";
import workspaceStyles from "./control-room/SituationWorkspace.module.css";
import type { PresentationModel } from "./control-room/presentationStateResolver";
import { LastTurnResult } from "./LastTurnResult";
import { DossierPanel } from "./ui";

type Props = {
  state: GameState;
  card: SituationCard | null;
  recommendation: AdvisorRecommendation | null;
  model: PresentationModel;
  resolvedEchoTypes: EchoType[];
  workspaceRef: RefObject<HTMLElement | null>;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
};

export function CampaignSituationWorkspace({
  state,
  card,
  recommendation,
  model,
  resolvedEchoTypes,
  workspaceRef,
  onCommit,
}: Props) {
  return (
    <section
      ref={workspaceRef}
      aria-label="Situation workspace"
      tabIndex={-1}
      className={workspaceStyles.situationWorkspace}
    >
      <ControlRoomPresentation
        model={model}
        turn={state.turn}
        hasActiveSituation={Boolean(card)}
      />
      {card ? (
        <DossierPanel
          key={card.id}
          className={workspaceStyles.activeFile ?? ""}
          eyebrow="SITUATION DECK"
          title={card.title}
          headingLevel="h1"
          summary={card.description}
          classification={`${card.type} · ${card.rarity}`}
          headerClassName="mobile-duplicate-situation"
          bodyClassName={workspaceStyles.activeFileBody ?? ""}
        >
          <div className={workspaceStyles.choiceList}>
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
          <LastTurnResult
            resolution={state.lastTurnResolution}
            echoTypes={resolvedEchoTypes}
          />
        </DossierPanel>
      ) : (
        <>
          <div className={`${workspaceStyles.noActiveFile} mobile-duplicate-situation`}>
            <p className="file-label">SITUATION DECK · STANDBY</p>
            <h1>No active file</h1>
            <p>The desk is quiet. Choose where to commit the administration.</p>
          </div>
          {state.lastTurnResolution ? (
            <div className={workspaceStyles.inactiveResult}>
              <LastTurnResult
                resolution={state.lastTurnResolution}
                echoTypes={resolvedEchoTypes}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
