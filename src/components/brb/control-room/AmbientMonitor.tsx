import styles from "./ControlRoomPresentation.module.css";

type AmbientMonitorProps = {
  label: string;
  channel: string;
  variant?: "public" | "surveillance" | "corporate";
  className?: string;
};

export function AmbientMonitor({
  label,
  channel,
  variant = "public",
  className = "",
}: AmbientMonitorProps) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.monitor} ${styles[`monitor-${variant}`]} ${className}`}
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
