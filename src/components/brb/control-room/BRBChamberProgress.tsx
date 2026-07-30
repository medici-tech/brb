import type { BrbVisualStage } from "./presentationStateResolver";
import styles from "./ControlRoomPresentation.module.css";

type BRBChamberProgressProps = {
  progress: number;
  stage: BrbVisualStage;
};

const STAGE_LABELS: Record<BrbVisualStage, string> = {
  sealed: "Sealed",
  infrastructure: "Infrastructure online",
  construction: "Construction active",
  unstable: "High-energy staging",
  "activation-ready": "Activation ready",
};

export function BRBChamberProgress({
  progress,
  stage,
}: BRBChamberProgressProps) {
  const boundedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      aria-label={`BRB chamber ${STAGE_LABELS[stage]}, ${boundedProgress}% complete`}
      className={styles.chamber}
      data-brb-stage={stage}
      data-room-part="brb-chamber"
      role="img"
    >
      <div aria-hidden="true" className={styles.chamberDoor}>
        <span className={styles.chamberSeam} />
        <span className={styles.chamberLock}>BRB</span>
        <span className={styles.chamberLight} />
      </div>
      <div className={styles.chamberReadout}>
        <span>SECURED ACCESS</span>
        <strong>{boundedProgress}%</strong>
        <small>{STAGE_LABELS[stage]}</small>
      </div>
      <div aria-hidden="true" className={styles.chamberMeter}>
        <i style={{ width: `${boundedProgress}%` }} />
      </div>
    </div>
  );
}
