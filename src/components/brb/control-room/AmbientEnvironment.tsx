import type { CSSProperties } from "react";
import { getArtEntry } from "@/game-art/manifest";
import { PixelSprite } from "../pixel/PixelSprite";
import styles from "./ControlRoomPresentation.module.css";

type ArtSurfaceProperties = CSSProperties & {
  "--room-floor-art": string;
  "--room-wall-art": string;
};

/**
 * Licensed environment art remains decorative and downstream of game state.
 * Broken or uninjected URLs expose the existing CSS room beneath these layers.
 */
export function AmbientRoomSurfaces() {
  const floor = getArtEntry("envFloor");
  const wall = getArtEntry("envWall");
  const style: ArtSurfaceProperties = {
    "--room-floor-art": `url("${floor.src}")`,
    "--room-wall-art": `url("${wall.src}")`,
  };

  return (
    <div
      aria-hidden="true"
      className={styles.roomDepth}
      data-room-part="room-depth"
      style={style}
    >
      <span className={styles.backWall} />
      <span className={styles.floorGrid} />
      <span className={styles.securityCamera} data-room-part="security-camera">
        <PixelSprite
          artKey="envSecurityCamera"
          className={styles.securityCameraSprite ?? ""}
        />
      </span>
    </div>
  );
}

export function AmbientConferenceDesk() {
  return (
    <span
      aria-hidden="true"
      className={styles.conferenceDesk}
      data-room-part="conference-desk"
    >
      <PixelSprite
        artKey="envConferenceDesk"
        className={styles.conferenceDeskSprite ?? ""}
      />
    </span>
  );
}

/**
 * Floor-standing server rack.
 *
 * Deliberately NOT rendered inside a wall-monitor bezel: the source art is a
 * 16x48 rack that stands on the floor, and at the room's scale it is 48x144 —
 * taller than a monitor frame, so a bezel just clipped a third of it off. It
 * belongs on the floor plane with the other props.
 */
export function AmbientServerRack() {
  return (
    <span
      aria-hidden="true"
      className={styles.serverRack}
      data-room-part="server-rack"
    >
      <PixelSprite
        artKey="monitorServer"
        className={styles.serverRackSprite ?? ""}
      />
    </span>
  );
}
