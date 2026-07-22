"use client";

import { useEffect, useRef, useState } from "react";
import { AmbientMonitor } from "./AmbientMonitor";
import { AmbientStaff } from "./AmbientStaff";
import { BRBChamberProgress } from "./BRBChamberProgress";
import type {
  PresentationFocus,
  PresentationModel,
} from "./presentationStateResolver";
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
      className={styles.presentation}
      data-active-situation={hasActiveSituation ? "true" : "false"}
      data-focus={focus}
      data-motion={reducedMotion ? "reduced" : "full"}
      data-presentation-state={model.state}
    >
      <div aria-hidden="true" className={styles.ceiling}>
        <span />
        <span />
        <span />
      </div>

      <div aria-hidden="true" className={styles.statusRail}>
        <span>FCD // CONTINUITY FLOOR</span>
        <i />
        <span>CHANNEL 04</span>
      </div>

      <div className={styles.wallMonitors}>
        <AmbientMonitor label="STATE NETWORK" channel="PUB-01" />
        <AmbientMonitor
          label="CITY SURVEILLANCE"
          channel="CIV-12"
          variant="surveillance"
        />
        <AmbientMonitor
          label="RESOURCE FLOW"
          channel="ADM-08"
          variant="public"
        />
        <AmbientMonitor
          label="PRIVATE UPLINK"
          channel="CORP-X"
          variant="corporate"
        />
      </div>

      <div aria-hidden="true" className={styles.roomDepth}>
        <span className={styles.backWall} />
        <span className={styles.floorGrid} />
      </div>

      <div aria-hidden="true" className={styles.advisorStations}>
        <div className={`${styles.advisorStation} ${styles.stationLeft}`}>
          <span>ANALYSIS</span>
          <i />
          <b />
        </div>
        <div className={`${styles.advisorStation} ${styles.stationCenter}`}>
          <span>OPERATIONS</span>
          <i />
          <b />
        </div>
        <div className={`${styles.advisorStation} ${styles.stationRight}`}>
          <span>INSTITUTIONS</span>
          <i />
          <b />
        </div>
      </div>

      <div aria-hidden="true" className={styles.paperClutter}>
        <span />
        <span />
        <span />
        <span />
      </div>

      <div aria-hidden="true" className={styles.operationsTable}>
        <span className={styles.tableMap} />
        <span className={styles.tableSignal} />
        <small>CENTRAL OPERATIONS</small>
      </div>

      <BRBChamberProgress
        progress={model.brbProgress}
        stage={model.brbStage}
      />

      <div className={styles.staffLayer}>
        <AmbientStaff label="Analyst" position="left" />
        <AmbientStaff label="Operator" position="center" />
        <AmbientStaff label="Steward" position="right" />
        <AmbientStaff label="Staff" position="crossing" />
      </div>

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
    </section>
  );
}
