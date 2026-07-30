import type { ArtKey } from "@/game-art/manifest";
import { PixelSprite } from "../pixel/PixelSprite";
import type { StaffLayout } from "./presentationStateResolver";
import styles from "./ControlRoomPresentation.module.css";

type StaffPosition = "left" | "center" | "right" | "crossing";

type AmbientStaffProps = {
  position: StaffPosition;
  label: string;
  crossingDirection?: StaffLayout["crossingDirection"];
};

// Station sprites use role labels (Analysis / Operations / Institutions), not
// advisor names, so ambient floor staff are not mistaken for The Analyst / etc.
const POSITION_ART: Record<Exclude<StaffPosition, "crossing">, ArtKey> = {
  left: "staffAnalystIdle",
  center: "staffOperatorIdle",
  right: "staffStewardIdle",
};

function crossingArtKey(
  direction: StaffLayout["crossingDirection"] = "left-to-right",
): ArtKey {
  return direction === "right-to-left"
    ? "staffCrossingWalkLeft"
    : "staffCrossingWalkRight";
}

export function AmbientStaff({
  position,
  label,
  crossingDirection = "left-to-right",
}: AmbientStaffProps) {
  const artKey =
    position === "crossing"
      ? crossingArtKey(crossingDirection)
      : POSITION_ART[position];

  return (
    <span
      aria-hidden="true"
      className={`${styles.staff} ${styles[`staff-${position}`]}`}
      data-room-part={`staff-${position}`}
      title={label}
    >
      <PixelSprite
        artKey={artKey}
        className={styles.staffSprite ?? ""}
        fallback={
          <>
            <i className={styles.staffHead} />
            <i className={styles.staffBody} />
          </>
        }
      />
      <small>{label}</small>
    </span>
  );
}
