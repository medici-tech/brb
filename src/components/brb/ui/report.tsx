import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ReportOutcomeSummaryProps = {
  result: ReactNode;
  reasonTitle: string;
  reason: ReactNode;
  rule: ReactNode;
  nextTitle: string;
  nextStep: ReactNode;
  className?: string;
};

export function ReportOutcomeSummary({
  result,
  reasonTitle,
  reason,
  rule,
  nextTitle,
  nextStep,
  className,
}: ReportOutcomeSummaryProps) {
  return (
    <section
      aria-label="Campaign result explained"
      className={cn("mt-10 grid gap-px border border-[color:var(--paper-line)] bg-[color:var(--paper-line)] md:grid-cols-[1.1fr_.9fr]", className)}
    >
      <div className="bg-[color:var(--paper-200)] p-6 sm:p-8">
        {result}
        <h2 className="brb-display mt-4 mb-2 text-[clamp(1.75rem,3.5vw,2.375rem)] leading-none font-semibold">
          {reasonTitle}
        </h2>
        <div className="font-semibold">{reason}</div>
        <div className="mt-2 text-sm leading-6 text-dossier-ink/70">{rule}</div>
      </div>
      <div className="border-t-4 border-t-destructive bg-[color:var(--paper-200)] p-6 sm:p-8 md:border-t-0 md:border-l-4 md:border-l-destructive">
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.14em] text-destructive uppercase">
          One change for your next run
        </p>
        <h2 className="brb-display mt-4 mb-2 text-[clamp(1.75rem,3.5vw,2.375rem)] leading-none font-semibold">
          {nextTitle}
        </h2>
        <div className="text-sm leading-6">{nextStep}</div>
      </div>
    </section>
  );
}

export function ReportMetadata({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn("my-8 grid border-y border-[color:var(--paper-line)] sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <div className="py-4 pr-3" key={item.label}>
          <dt className="brb-telemetry text-[10px] tracking-[0.1em] text-dossier-ink/60 uppercase">{item.label}</dt>
          <dd className="mt-1.5 mb-0 font-bold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ReportSection({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-[color:var(--paper-line)] py-8", className)}>
      <p className="brb-telemetry m-0 text-[10px] tracking-[0.14em] uppercase opacity-65">{eyebrow}</p>
      <h2 className="brb-display mt-2.5 mb-0 max-w-3xl text-[clamp(1.75rem,4vw,2.625rem)] leading-none font-semibold">
        {title}
      </h2>
      {children ? <div className="mt-3 text-sm leading-6 text-dossier-ink/75">{children}</div> : null}
    </section>
  );
}

export function ReportStatGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-px border border-[color:var(--paper-line)] bg-[color:var(--paper-line)] sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}

export function ReportStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <article className="bg-[color:var(--paper-200)] p-4">
      <span className="brb-telemetry text-[9px] tracking-[0.12em] uppercase opacity-60">{label}</span>
      <strong className="brb-display mt-2 block text-3xl leading-none">{value}</strong>
      {helper ? <small className="mt-2 block text-[11px] leading-4 opacity-65">{helper}</small> : null}
    </article>
  );
}
