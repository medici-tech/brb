import { AlertCircle, ArchiveX, RadioTower } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import type { BrbAction, BrbTone } from "./types";

const noticeStyles: Record<BrbTone, string> = {
  neutral: "border-border bg-raised/70",
  informational: "border-signal/50 bg-signal/5",
  stable: "border-phosphor/50 bg-phosphor/5",
  warning: "border-signal bg-signal/8",
  critical: "border-destructive bg-destructive/8",
  classified: "border-dossier/50 bg-dossier/5",
};

type OutcomeNoticeProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  details?: ReactNode;
  tone?: BrbTone;
  className?: string;
};

export function OutcomeNotice({ eyebrow, title, description, details, tone = "informational", className }: OutcomeNoticeProps) {
  return (
    <Alert className={cn("rounded-sm py-5", noticeStyles[tone], className)}>
      <AlertCircle aria-hidden="true" />
      <AlertTitle className="font-sans">
        <span className="brb-telemetry mb-1 block text-[9px] tracking-[0.15em] text-muted-foreground uppercase">{eyebrow}</span>
        <span className="font-semibold text-foreground">{title}</span>
      </AlertTitle>
      <AlertDescription className="mt-2 text-sm leading-6 text-muted-foreground">{description}</AlertDescription>
      {details ? <div className="col-start-2 mt-4 border-t border-current/15 pt-4 text-xs text-muted-foreground">{details}</div> : null}
    </Alert>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: BrbAction;
  tone?: BrbTone;
};

export function EmptyState({ title, description, icon: Icon = ArchiveX, action, tone = "neutral" }: EmptyStateProps) {
  const ActionIcon = action?.icon;
  return (
    <section className="grid min-h-64 place-items-center border border-dashed border-border bg-console/60 p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-14 place-items-center border border-border bg-raised"><Icon className="size-6 text-muted-foreground" aria-hidden="true" /></div>
        <StatusBadge tone={tone} className="mt-5">No recoverable data</StatusBadge>
        <h3 className="brb-display mt-4 mb-0 text-3xl leading-none font-semibold">{title}</h3>
        <p className="mt-3 mb-0 text-sm leading-6 text-muted-foreground">{description}</p>
        {action ? <Button className="mt-5" variant="command" disabled={action.disabled} onClick={action.onSelect}>{ActionIcon ? <ActionIcon aria-hidden="true" /> : null}{action.label}</Button> : null}
      </div>
    </section>
  );
}

export function LoadingState({ label = "Receiving classified transmission" }: { label?: string }) {
  return (
    <section aria-busy="true" aria-label={label} className="border border-border bg-console p-5">
      <div className="flex items-center gap-3"><RadioTower className="size-4 animate-pulse text-signal" aria-hidden="true" /><span className="brb-telemetry text-[10px] tracking-[0.15em] text-muted-foreground uppercase">{label}</span></div>
      <div className="mt-5 grid gap-3">
        <Skeleton className="h-8 w-3/5 rounded-sm bg-raised" />
        <Skeleton className="h-4 w-full rounded-sm bg-raised" />
        <Skeleton className="h-4 w-4/5 rounded-sm bg-raised" />
        <div className="mt-2 grid grid-cols-2 gap-3"><Skeleton className="h-20 rounded-sm bg-raised" /><Skeleton className="h-20 rounded-sm bg-raised" /></div>
      </div>
    </section>
  );
}
