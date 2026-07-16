import { AlertTriangle, Check, Circle, Eye, LockKeyhole, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BrbTone } from "./types";

const toneStyles: Record<BrbTone, string> = {
  neutral: "border-border bg-raised text-muted-foreground",
  informational: "border-signal/50 bg-signal/10 text-signal",
  stable: "border-phosphor/50 bg-phosphor/10 text-phosphor",
  warning: "border-signal bg-signal/15 text-signal",
  critical: "border-destructive bg-destructive/15 text-[#e98479]",
  classified: "border-dossier/50 bg-dossier/10 text-dossier",
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
};

export function StatusBadge({
  tone = "neutral",
  showIcon = true,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const Icon = toneIcons[tone];
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
