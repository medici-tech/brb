import type { ArtKey } from "@/game-art/manifest";
import { PixelSprite } from "../pixel/PixelSprite";
import styles from "./ControlRoomPresentation.module.css";

type StaffPosition = "left" | "center" | "right" | "crossing";

type AmbientStaffProps = {
  position: StaffPosition;
  label: string;
};

// Each control-room post maps to a curated LimeZu sprite. When the runtime art
// is absent (gitignored / not injected) PixelSprite renders the CSS silhouette
// fallback below, so the scene still reads.
const POSITION_ART: Record<StaffPosition, ArtKey> = {
  left: "staffAnalystIdle",
  center: "staffOperatorIdle",
  right: "staffStewardSeated",
  crossing: "staffCrossingWalk",
};

export function AmbientStaff({ position, label }: AmbientStaffProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.staff} ${styles[`staff-${position}`]}`}
      data-room-part={`staff-${position}`}
      title={label}
    >
      <PixelSprite
        artKey={POSITION_ART[position]}
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
