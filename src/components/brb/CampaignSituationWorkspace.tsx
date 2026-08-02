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
  commitSignalKey: string | null;
  resolvedEchoTypes: EchoType[];
  workspaceRef: RefObject<HTMLElement | null>;
  onCommit: (action: MajorAction, options?: CommitOptions) => void;
};

export function CampaignSituationWorkspace({
  state,
  card,
  recommendation,
  model,
  commitSignalKey,
  resolvedEchoTypes,
  workspaceRef,
  onCommit,
}: Props) {
  return (
    <section
      ref={workspaceRef}
      aria-label="Situation workspace"
      tabIndex={-1}
      className={`${workspaceStyles.situationWorkspace} campaign-situation-workspace`}
      data-situation={card ? "active" : "standby"}
    >
      <div className={workspaceStyles.workspaceRail} aria-hidden="true">
        <span className={workspaceStyles.railIdentity}>
          <i />
          Situation command
        </span>
        <span className={workspaceStyles.railCaption}>{model.caption}</span>
        <strong>{card ? "Action required" : "Authorization window"}</strong>
      </div>
      <div className={workspaceStyles.sceneStage} data-room-stage="">
        <ControlRoomPresentation
          model={model}
          turn={state.turn}
          hasActiveSituation={Boolean(card)}
          commitSignalKey={commitSignalKey}
        />
        <div
          aria-hidden="true"
          className={workspaceStyles.roomReadout}
          data-mobile-room-readout=""
        >
          <span className={workspaceStyles.liveFeed}>
            <i />
            Live · Facility 01
          </span>
          <strong>{model.stateLabel}</strong>
          <span>BRB {Math.round(model.brbProgress).toString().padStart(3, "0")}%</span>
        </div>
      </div>
      <div className={workspaceStyles.dossierColumn}>
        {card ? (
          <DossierPanel
            key={card.id}
            className={workspaceStyles.activeFile ?? ""}
            eyebrow="SITUATION DECK"
            title={card.title}
            headingLevel="h1"
            summary={card.description}
            classification={`${card.type} · ${card.rarity}`}
            bodyClassName={workspaceStyles.activeFileBody ?? ""}
          >
            <p className={workspaceStyles.actionRequired}>
              Action required · choose one of {card.choices.length} responses
            </p>
            <div
              className={workspaceStyles.choiceList}
              role="group"
              aria-label="Situation responses"
            >
              {card.choices.map((choice) => (
                <CampaignActionControl
                  key={choice.id}
                  state={state}
                  action={{ type: "resolve_card", choiceId: choice.id }}
                  recommendation={recommendation}
                  activeCardTitle={card.title}
                  onCommit={onCommit}
                  compact
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
            <div className={workspaceStyles.noActiveFile}>
              <p className="file-label">SITUATION DECK · STANDBY</p>
              <h1>No active file</h1>
              <p>The desk is quiet. Choose where to commit the administration.</p>
              <aside className={workspaceStyles.standbyRouting}>
                <span>Next authorization</span>
                <strong>Choose one monthly commitment.</strong>
                <p>BRB projects · public operations · resource recovery</p>
              </aside>
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
      </div>
    </section>
  );
}
