import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeroProps = {
  eyebrow: string;
  title: ReactNode;
  summary: ReactNode;
  stamp?: string;
  children?: ReactNode;
  className?: string;
};

export function Hero({ eyebrow, title, summary, stamp, children, className }: HeroProps) {
  return (
    <section
      className={cn(
        "brb-paper-texture relative min-h-[430px] overflow-hidden border border-dossier px-7 py-10 text-dossier-ink shadow-[var(--shadow-lift-sheet)] sm:px-10 sm:py-14 lg:px-16 lg:py-20",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="brb-display pointer-events-none absolute right-[-2.5rem] bottom-[-7.5rem] text-[clamp(14rem,36vw,31rem)] leading-none font-extrabold text-dossier-ink/[0.055]"
      >
        BRB
      </span>
      {stamp ? <span className="stamp stamp-classified">{stamp}</span> : null}
      <div className="relative z-10 max-w-5xl">
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.18em] uppercase opacity-65">{eyebrow}</p>
        <h1 className="brb-display my-5 text-[clamp(3.125rem,8.5vw,7rem)] leading-[0.95] font-semibold tracking-[-0.012em]">
          {title}
        </h1>
        <div className="max-w-2xl text-[clamp(1.05rem,2vw,1.375rem)] leading-[1.5] text-dossier-ink/75">
          {summary}
        </div>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

type ArchetypeCardProps = {
  index: string;
  title: string;
  description: ReactNode;
  details: Array<{ label: string; value: ReactNode }>;
  action: ReactNode;
  className?: string;
};

export function ArchetypeCard({
  index,
  title,
  description,
  details,
  action,
  className,
}: ArchetypeCardProps) {
  return (
    <article
      className={cn(
        "relative flex min-h-[410px] flex-col border border-border bg-[color:var(--console-600)] p-7 shadow-[var(--shadow-hard-sm)]",
        className,
      )}
    >
      <span className="brb-telemetry absolute top-5 right-5 text-xs tracking-[0.16em] text-muted-foreground">
        {index}
      </span>
      <h3 className="brb-display mt-11 mb-2 text-4xl leading-none font-semibold">{title}</h3>
      <div className="text-sm leading-6 text-muted-foreground">{description}</div>
      <dl className="mt-4 mb-7">
        {details.map((detail) => (
          <div className="border-t border-border py-2.5" key={detail.label}>
            <dt className="brb-telemetry text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {detail.label}
            </dt>
            <dd className="mt-1 mb-0 text-[13px] leading-5">{detail.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto [&>button]:min-h-11 [&>button]:w-full">{action}</div>
    </article>
  );
}

type ConsolePanelProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

export function ConsolePanel({ children, className, label }: ConsolePanelProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "brb-console-grid border border-border bg-[color:var(--console-600)] p-5 shadow-[var(--shadow-hard-sm)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
