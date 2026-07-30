"use client";

import { useState } from "react";
import { PixelSprite, type SpriteLoadState } from "../pixel/PixelSprite";
import { AmbientMonitor } from "./AmbientMonitor";
import styles from "./ControlRoomPresentation.module.css";

/**
 * The control-room monitor wall.
 *
 * The curated `monitorScreens` sheet is NOT a single monitor — each of its 11
 * frames is a complete 4×3 bank of CRTs (surveillance feeds, map, data readouts),
 * so it is drawn ONCE as the wall itself rather than per channel. The four channel
 * plates keep their labels, call-signs and per-state tinting and sit beneath the
 * art, where they stay readable against busy pixels.
 *
 * When the curated art is absent (gitignored / not injected — the default in CI and
 * a fresh clone) the four plates fall back to the original full CSS monitors, so the
 * scene reads exactly as it did before the art pipeline existed.
 */

type Channel = {
  readonly label: string;
  readonly channel: string;
  readonly variant: "public" | "surveillance" | "corporate";
};

const CHANNELS: readonly Channel[] = [
  { label: "STATE NETWORK", channel: "PUB-01", variant: "public" },
  { label: "CITY SURVEILLANCE", channel: "CIV-12", variant: "surveillance" },
  // No sprite here: the server rack is floor furniture (see AmbientServerRack),
  // not something that belongs inside a wall-monitor bezel.
  { label: "RESOURCE FLOW", channel: "ADM-08", variant: "public" },
  { label: "PRIVATE UPLINK", channel: "CORP-X", variant: "corporate" },
];

export function AmbientMonitorWall() {
  const [artState, setArtState] = useState<SpriteLoadState>("pending");
  const hasArt = artState === "loaded";

  return (
    <div
      className={styles.wallMonitors}
      data-art={hasArt ? "pixel" : "css"}
      data-room-part="monitor-wall"
    >
      <PixelSprite
        artKey="monitorScreens"
        className={styles.monitorWallSprite ?? ""}
        onLoadStateChange={setArtState}
      />
      <div className={styles.monitorChannels}>
        {CHANNELS.map((entry) => (
          <AmbientMonitor
            key={entry.channel}
            label={entry.label}
            channel={entry.channel}
            variant={entry.variant}
            chrome={hasArt ? "plate" : "full"}
          />
        ))}
      </div>
    </div>
  );
}
