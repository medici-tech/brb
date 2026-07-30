import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import type { BrbAction, BrbStat, BrbTone } from "./types";

const indicatorTone: Record<BrbTone, string> = {
  neutral: "bg-muted-foreground",
  informational: "bg-signal",
  stable: "bg-phosphor",
  warning: "bg-signal",
  critical: "bg-destructive",
  classified: "bg-dossier",
};

function ActionButton({ action, variant = "quiet" }: { action: BrbAction; variant?: "quiet" | "command" | "critical" }) {
  const Icon = action.icon;
  return (
    <Button variant={variant} disabled={action.disabled} onClick={action.onSelect} className="min-w-0 flex-1 px-2 text-center whitespace-normal">
      {Icon ? <Icon aria-hidden="true" /> : null}
      {action.label}
    </Button>
  );
}

type MetricReadoutProps = {
  stat: BrbStat;
  className?: string;
};

export function MetricReadout({ stat, className }: MetricReadoutProps) {
  const tone = stat.tone ?? "neutral";
  const numericValue = typeof stat.value === "number" ? stat.value : null;
  const progress = numericValue !== null && stat.maximum ? Math.min(100, Math.max(0, (numericValue / stat.maximum) * 100)) : null;
  const TrendIcon = stat.trend?.startsWith("+") ? ArrowUpRight : stat.trend?.startsWith("-") ? ArrowDownRight : Minus;
  return (
    <div className={cn("relative min-w-0 overflow-hidden border border-border bg-console p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="brb-telemetry text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{stat.label}</span>
        {stat.trend ? <span className="brb-telemetry flex items-center text-[10px] text-phosphor"><TrendIcon className="mr-1 size-3" aria-hidden="true" />{stat.trend}</span> : null}
      </div>
      <div className="brb-telemetry mt-3 text-2xl font-semibold text-foreground">{stat.value}</div>
      {stat.helper ? <p className="mt-2 mb-0 text-[11px] leading-4 text-muted-foreground">{stat.helper}</p> : null}
      {progress !== null ? <Progress aria-label={`${stat.label} progress`} value={progress} className="mt-4 h-1 rounded-none bg-raised" indicatorClassName={indicatorTone[tone]} /> : null}
    </div>
  );
}

const metricColumns = {
  3: "md:grid-cols-3 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
  5: "md:grid-cols-3 xl:grid-cols-5",
} as const;

export function MetricStrip({
  stats,
  columns = 5,
  className,
}: {
  stats: BrbStat[];
  columns?: keyof typeof metricColumns;
  className?: string;
}) {
  return (
    <section aria-label="Operational metrics" className={cn("grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2", metricColumns[columns], className)}>
      {stats.map((stat) => <MetricReadout key={stat.label} stat={stat} className="border-0" />)}
    </section>
  );
}

type ProgressTrackProps = {
  label: string;
  value: number;
  maximum: number;
  description?: string;
  tone?: BrbTone;
  status?: string;
  actions?: BrbAction[];
};

export function ProgressTrack({ label, value, maximum, description, tone = "informational", status, actions = [] }: ProgressTrackProps) {
  const percent = Math.min(100, Math.max(0, (value / maximum) * 100));
  return (
    <section className="border-b border-border py-5 last:border-b-0" aria-label={`${label} track`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="brb-display m-0 text-2xl leading-none font-semibold">{label}</h3>
          {description ? <p className="mt-2 mb-0 text-xs leading-5 text-muted-foreground">{description}</p> : null}
        </div>
        <div className="text-right">
          <strong className="brb-telemetry text-sm text-foreground">{value} / {maximum}</strong>
          {status ? <div className="mt-2"><StatusBadge tone={tone}>{status}</StatusBadge></div> : null}
        </div>
      </div>
      <Progress value={percent} aria-label={`${label}: ${value} of ${maximum}`} className="mt-4 h-1.5 rounded-none bg-raised" indicatorClassName={indicatorTone[tone]} />
      {actions.length > 0 ? <div className="mt-4 flex flex-col gap-2 sm:flex-row">{actions.map((action, index) => <ActionButton key={action.label} action={action} variant={index === 0 ? "command" : "quiet"} />)}</div> : null}
    </section>
  );
}

type ThreatPanelProps = {
  label?: string;
  progress: number;
  threatLevel: string;
  posture: string;
  briefingItems?: string[];
  footer?: ReactNode;
};

export function ThreatPanel({ label = "Corporation watch", progress, threatLevel, posture, briefingItems = [], footer }: ThreatPanelProps) {
  return (
    <section className="brb-console-grid border border-destructive/45 bg-console p-5" aria-label={label}>
      <div className="flex items-center justify-between gap-4">
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.16em] text-destructive-soft uppercase">{label}</p>
        <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
      </div>
      <div className="mt-6 flex items-end justify-between gap-5">
        <div className="brb-telemetry text-6xl leading-none font-semibold text-foreground">{progress}<span className="text-xl text-muted-foreground">%</span></div>
        <StatusBadge tone="critical">{threatLevel}</StatusBadge>
      </div>
      <Progress value={progress} aria-label={`${label}: ${progress}%`} className="mt-5 h-2 rounded-none bg-raised" indicatorClassName="bg-destructive" />
      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><Activity className="size-4 text-signal" aria-hidden="true" />Current posture: <strong className="text-foreground">{posture}</strong></div>
      {briefingItems.length > 0 ? <ul className="mt-4 space-y-2 pl-4 text-xs leading-5 text-muted-foreground">{briefingItems.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      {footer ? <div className="mt-5 border-t border-border pt-4">{footer}</div> : null}
    </section>
  );
}
