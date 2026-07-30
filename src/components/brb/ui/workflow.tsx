import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TurnBeatTone = "neutral" | "improvement" | "discovery" | "milestone" | "problem";

const turnBeatTone: Record<TurnBeatTone, string> = {
  neutral: "border-l-[color:var(--paper-line)]",
  improvement: "border-l-[#596b43]",
  discovery: "border-l-[#8c713f] bg-[#89703f]/10",
  milestone: "border-l-[#9a742b] bg-[linear-gradient(100deg,rgba(158,125,57,.16),transparent_62%)] py-[18px]",
  problem: "border-l-destructive bg-destructive/[0.06]",
};

type TurnBeatProps = {
  label: string;
  title: string;
  description?: ReactNode;
  details?: ReactNode;
  tone?: TurnBeatTone;
  className?: string;
};

export function TurnBeat({
  label,
  title,
  description,
  details,
  tone = "neutral",
  className,
}: TurnBeatProps) {
  return (
    <article
      className={cn(
        "w-full min-w-0 overflow-hidden border-l-4 py-3.5 pr-4 pl-4",
        tone === "milestone" && "border-l-[6px]",
        turnBeatTone[tone],
        className,
      )}
    >
      <p className="brb-telemetry m-0 text-[10px] font-bold tracking-[0.12em] text-dossier-ink/65 uppercase">
        {label}
      </p>
      <h3 className={cn("brb-display mt-1 mb-0 text-xl leading-tight font-semibold", tone === "milestone" && "text-2xl")}>
        {title}
      </h3>
      {description ? <div className="mt-1.5 text-xs leading-5 text-dossier-ink/75">{description}</div> : null}
      {details ? <div className="mt-2.5">{details}</div> : null}
    </article>
  );
}

export function TurnBeatSequence({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid min-w-0 gap-2.5", className)}>{children}</div>;
}

type JournalSlotProps = {
  order: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function JournalSlot({
  order,
  eyebrow,
  title,
  children,
  action,
  className,
}: JournalSlotProps) {
  return (
    <article
      className={cn(
        "grid min-h-[150px] grid-cols-1 items-center gap-5 border-t border-border bg-[color:var(--console-600)] p-5 sm:grid-cols-[3.625rem_minmax(0,1fr)_auto]",
        className,
      )}
    >
      <span className="brb-display text-5xl leading-none text-muted-foreground">{order}</span>
      <div className="min-w-0">
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.14em] text-signal uppercase">{eyebrow}</p>
        <h3 className="brb-display my-2 text-3xl leading-none font-semibold">{title}</h3>
        <div className="text-sm leading-5 text-muted-foreground [&>p]:my-0 [&>small]:mt-1 [&>small]:block">{children}</div>
      </div>
      {action ? <div className="min-w-[180px] text-left sm:text-right [&>button]:min-h-11">{action}</div> : null}
    </article>
  );
}

type GuidedObjectiveProps = {
  eyebrow: string;
  title: string;
  titleId?: string;
  description: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function GuidedObjective({
  eyebrow,
  title,
  titleId,
  description,
  children,
  compact = false,
  className,
}: GuidedObjectiveProps) {
  return (
    <aside
      className={cn(
        "grid gap-5 border-l-4 border-destructive bg-[color:var(--paper-300)] text-dossier-ink",
        compact
          ? "grid-cols-1 items-center px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)]"
          : "grid-cols-1 border-2 border-l-[5px] p-5 md:grid-cols-[.8fr_1.2fr]",
        className,
      )}
    >
      <div>
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.14em] text-dossier-ink/80 uppercase">{eyebrow}</p>
        <h2 id={titleId} className="brb-display my-1.5 text-2xl leading-none font-semibold">{title}</h2>
        <div className="text-xs leading-5 text-dossier-ink/75">{description}</div>
      </div>
      {children ? <div className="text-xs leading-5 text-dossier-ink/80">{children}</div> : null}
    </aside>
  );
}
