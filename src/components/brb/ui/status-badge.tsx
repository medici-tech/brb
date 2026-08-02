import { AlertTriangle, Check, Circle, Eye, LockKeyhole, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BrbTone } from "./types";

/** Console surfaces are dark, so tones carry their own light. */
const consoleToneStyles: Record<BrbTone, string> = {
  neutral: "border-border bg-raised text-muted-foreground",
  informational: "border-signal/50 bg-signal/10 text-signal",
  stable: "border-phosphor/50 bg-phosphor/10 text-phosphor",
  warning: "border-signal bg-signal/15 text-signal",
  critical: "border-destructive bg-destructive/15 text-destructive-soft",
  classified: "border-dossier/50 bg-dossier/10 text-dossier",
};

/**
 * Paper surfaces are light, so the console tones invert to unreadable — amber
 * signal on cream sits near 1.9:1. Paper tones are printed ink: dark enough to
 * carry text contrast, with the hue kept as the tone signal.
 */
const paperToneStyles: Record<BrbTone, string> = {
  neutral: "border-[color:var(--paper-line)] bg-[color:var(--paper-300)] text-[color:var(--ink)]",
  informational: "border-[#8a6420] bg-[#8a6420]/12 text-[#6d4d15]",
  stable: "border-[#4f6b41] bg-[#4f6b41]/12 text-[#3d5432]",
  warning: "border-[#8a6420] bg-[#8a6420]/18 text-[#6d4d15]",
  critical: "border-destructive bg-destructive/12 text-[color:var(--destructive)]",
  classified: "border-[color:var(--ink)]/45 bg-[color:var(--ink)]/8 text-[color:var(--ink)]",
};

const toneIcons: Record<BrbTone, LucideIcon> = {
  neutral: Circle,
  informational: Radio,
  stable: Check,
  warning: AlertTriangle,
  critical: Eye,
  classified: LockKeyhole,
};

type StatusBadgeProps = ComponentProps<typeof Badge> & {
  tone?: BrbTone;
  showIcon?: boolean;
  /** Which material the badge sits on. Drives contrast, not decoration. */
  surface?: "console" | "paper";
};

export function StatusBadge({
  tone = "neutral",
  showIcon = true,
  surface = "console",
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const Icon = toneIcons[tone];
  const toneStyles = surface === "paper" ? paperToneStyles : consoleToneStyles;
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-sm px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {showIcon ? <Icon aria-hidden="true" /> : null}
      {children}
    </Badge>
  );
}
