"use client";

import { useEffect, useRef, useState } from "react";
import {
  AmbientConferenceDesk,
  AmbientRoomSurfaces,
  AmbientServerRack,
} from "./AmbientEnvironment";
import { AmbientMonitorWall } from "./AmbientMonitorWall";
import { AmbientStaff } from "./AmbientStaff";
import { BRBChamberProgress } from "./BRBChamberProgress";
import { PixelSprite } from "@/components/brb/pixel/PixelSprite";
import type {
  PresentationFocus,
  PresentationModel,
} from "./presentationStateResolver";
import lightingStyles from "./roomLighting.module.css";
import propStyles from "./roomProps.module.css";
import stateStyles from "./roomState.module.css";
import styles from "./ControlRoomPresentation.module.css";
import { useReducedMotion } from "./useReducedMotion";

type ControlRoomPresentationProps = {
  model: PresentationModel;
  turn: number;
  hasActiveSituation: boolean;
  reducedMotionOverride?: boolean;
  focusOverride?: PresentationFocus;
};

export function ControlRoomPresentation({
  model,
  turn,
  hasActiveSituation,
  reducedMotionOverride,
  focusOverride,
}: ControlRoomPresentationProps) {
  const reducedMotion = useReducedMotion(reducedMotionOverride);
  const previousTurn = useRef(turn);
  const [showCommitFocus, setShowCommitFocus] = useState(false);

  useEffect(() => {
    if (reducedMotion || turn <= previousTurn.current) {
      previousTurn.current = turn;
      setShowCommitFocus(false);
      return;
    }

    previousTurn.current = turn;
    setShowCommitFocus(true);
    const resetFocus = window.setTimeout(() => setShowCommitFocus(false), 350);
    return () => window.clearTimeout(resetFocus);
  }, [reducedMotion, turn]);

  const focus = focusOverride
    ?? (showCommitFocus ? "commit" : model.focus);
  const displayStateLabel = process.env.NODE_ENV === "development";

  return (
    <section
      aria-label={`Living control room: ${model.stateLabel}`}
      className={`${styles.presentation} ${stateStyles.stateSurface}`}
      data-brb-room=""
      data-active-situation={hasActiveSituation ? "true" : "false"}
      data-focus={focus}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-presentation-state={model.state}
    >
      <div aria-hidden="true" className={propStyles.layerBack}>
        <div className={styles.ceiling} data-room-part="ceiling">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.statusRail} data-room-part="status-rail">
          <span>FCD // CONTINUITY FLOOR</span>
          <i />
          <span>CHANNEL 04</span>
        </div>

        <AmbientMonitorWall />
        <AmbientRoomSurfaces />
      </div>

      <div className={propStyles.layerMid}>
        <div className={styles.advisorStations} data-room-part="advisor-stations">
          <div
            className={`${styles.advisorStation} ${styles.stationLeft}`}
            data-room-part="station-analysis"
          >
            <span>ANALYSIS</span>
            <i />
            <b />
          </div>
          <div
            className={`${styles.advisorStation} ${styles.stationCenter}`}
            data-room-part="station-operations"
          >
            <span>OPERATIONS</span>
            <i />
            <b />
          </div>
          <div
            className={`${styles.advisorStation} ${styles.stationRight}`}
            data-room-part="station-institutions"
          >
            <span>INSTITUTIONS</span>
            <i />
            <b />
          </div>
        </div>

        <div className={styles.paperClutter} data-room-part="paper-clutter">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className={styles.operationsTable} data-room-part="operations-table">
          <span className={styles.tableMap} />
          <span className={styles.tableSignal} />
          <small>CENTRAL OPERATIONS</small>
        </div>

        {/* Kept OUT of `.operationsTable`: that element carries a 3D perspective
            transform. A transformed ancestor resamples pixel art. */}
        <AmbientConferenceDesk />
        <AmbientServerRack />

        <BRBChamberProgress
          progress={model.brbProgress}
          stage={model.brbStage}
        />

        <div className={styles.staffLayer} data-room-part="staff-layer">
          <AmbientStaff label="Analyst" position="left" />
          <AmbientStaff label="Operator" position="center" />
          <AmbientStaff label="Steward" position="right" />
          <AmbientStaff label="Staff" position="crossing" />
        </div>
      </div>

      <div aria-hidden="true" className={lightingStyles.layerLight}>
        <span className={lightingStyles.poolWall} />
        <span className={lightingStyles.poolTable} />
        <span className={lightingStyles.poolFile} />
        <span className={lightingStyles.alertWash} />
      </div>

      <div aria-hidden="true" className={propStyles.layerFore}>
        <span className={propStyles.foreFigureLeft}>
          <PixelSprite
            artKey="staffAnalystIdle"
            className={propStyles.foreFigureSprite ?? ""}
            frameOffset={1}
            fallback={
              <>
                <i />
                <b />
              </>
            }
          />
        </span>
        <span className={propStyles.foreFigureRight}>
          <PixelSprite
            artKey="staffOperatorIdle"
            className={propStyles.foreFigureSprite ?? ""}
            frameOffset={2}
            fallback={
              <>
                <i />
                <b />
              </>
            }
          />
        </span>
        <span className={propStyles.deskEdge} />
        <span className={lightingStyles.scrim} />
        <span className={lightingStyles.vignette} />
      </div>

      <div className={propStyles.layerUi}>
        <div aria-hidden="true" className={styles.corporateOverlay}>
          <span>PRIVATE SYSTEM</span>
          <i>CONTRACT AUTHORITY</i>
        </div>

        <div className={styles.ambientCaption}>
          <span aria-hidden="true" className={styles.captionSignal} />
          <p>{model.caption}</p>
          <small>Focus: {focus}</small>
        </div>

        {displayStateLabel ? (
          <span className={styles.developmentLabel}>
            DEV STATE · {model.stateLabel}
          </span>
        ) : null}
      </div>
    </section>
  );
}
