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
      className={`situation-panel ${workspaceStyles.situationWorkspace}`}
    >
      <ControlRoomPresentation
        model={model}
        turn={state.turn}
        hasActiveSituation={Boolean(card)}
      />
      {card ? (
        <div
          key={card.id}
          className={`paper-panel ${workspaceStyles.activeFile}`}
        >
          <div className="panel-heading mobile-duplicate-situation">
            <div>
              <p className="file-label">SITUATION DECK</p>
              <h1>{card.title}</h1>
            </div>
            <span className={`classification ${card.rarity}`}>
              {card.type} · {card.rarity}
            </span>
          </div>
          <p className="situation-copy mobile-duplicate-situation">{card.description}</p>
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
        </div>
      ) : (
        <>
          <div className={`${workspaceStyles.noActiveFile} mobile-duplicate-situation`}>
            <p className="file-label">SITUATION DECK · STANDBY</p>
            <h1>No active file</h1>
            <p>The desk is quiet. Choose where to commit the administration.</p>
          </div>
          {state.lastTurnResolution ? (
            <div className={`paper-panel ${workspaceStyles.inactiveResult}`}>
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
