import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type BrbTone =
  | "neutral"
  | "informational"
  | "stable"
  | "warning"
  | "critical"
  | "classified";

export type BrbAction = {
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onSelect?: () => void;
};

export type BrbStat = {
  label: string;
  value: ReactNode;
  maximum?: number;
  helper?: string;
  trend?: string;
  tone?: BrbTone;
};
