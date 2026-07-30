import styles from "./ControlRoomPresentation.module.css";

type AmbientMonitorProps = {
  label: string;
  channel: string;
  variant?: "public" | "surveillance" | "corporate";
  /**
   * `full` draws the original CSS monitor — bezel, phosphor grid, scanline and
   * animated data bars — and is what renders when no curated art is present.
   * `plate` keeps only the readable label and call-sign, for when the pixel
   * monitor wall is supplying the visuals (`.monitor-plate` hides the simulated
   * screen internals). Per-state tinting applies to both.
   */
  chrome?: "full" | "plate";
  className?: string;
};

/**
 * A single labelled channel on the monitor wall.
 *
 * This component intentionally renders NO sprite. The curated art for this wall
 * is one sheet depicting the entire bank of CRTs, drawn once by
 * `AmbientMonitorWall`; and the server rack is floor furniture drawn by
 * `AmbientServerRack`. Putting either inside a bezel nested a whole wall (or a
 * 144px-tall rack) inside one ~104px screen frame.
 */
export function AmbientMonitor({
  label,
  channel,
  variant = "public",
  chrome = "full",
  className = "",
}: AmbientMonitorProps) {
  const variantClass =
    variant === "public" ? "" : (styles[`monitor-${variant}`] ?? "");

  return (
    <div
      aria-hidden="true"
      className={[
        styles.monitor,
        variantClass,
        styles[`monitor-${chrome}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-monitor-variant={variant}
      data-room-part="monitor"
    >
      <span className={styles.monitorLabel}>{label}</span>
      <span className={styles.monitorChannel}>{channel}</span>
      <span className={styles.monitorGrid} />
      <span className={styles.monitorScan} />
      <span className={styles.monitorData}>
        <i />
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
