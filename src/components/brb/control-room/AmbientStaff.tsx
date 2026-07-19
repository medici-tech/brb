import styles from "./ControlRoomPresentation.module.css";

type AmbientStaffProps = {
  position: "left" | "center" | "right" | "crossing";
  label: string;
};

export function AmbientStaff({ position, label }: AmbientStaffProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.staff} ${styles[`staff-${position}`]}`}
      title={`${label} placeholder silhouette`}
    >
      <i className={styles.staffHead} />
      <i className={styles.staffBody} />
      <small>{label}</small>
    </span>
  );
}
