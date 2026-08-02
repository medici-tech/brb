"use client";

import { ChevronRight, MessageSquareQuote, UserRound } from "lucide-react";
import {
  forwardRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArtworkPlaceholder } from "./dossier";
import { StatusBadge } from "./status-badge";
import type { BrbAction, BrbStat, BrbTone } from "./types";

type DecisionOptionProps = {
  className?: string | undefined;
  index?: string;
  title: string;
  description?: string;
  metadata?: ReactNode | undefined;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  surface?: "paper" | "console";
} & Omit<
  ComponentProps<"button">,
  "className" | "disabled" | "onSelect" | "title"
>;

export const DecisionOption = forwardRef<HTMLButtonElement, DecisionOptionProps>(
  function DecisionOption({
  className,
  index,
  title,
  description,
  metadata,
  selected,
  disabled = false,
  onSelect,
  surface = "paper",
  ...buttonProps
  }, ref) {
  return (
    <Button
      ref={ref}
      type="button"
      variant={surface === "paper" ? "dossier" : "quiet"}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      {...buttonProps}
      className={cn(
        "group h-auto min-h-20 w-full justify-start gap-4 rounded-sm px-4 py-4 text-left normal-case tracking-normal whitespace-normal",
        surface === "console" && "bg-console/35 text-foreground",
        selected && "bg-dossier-ink text-dossier",
        className,
      )}
    >
      {index ? <span className="brb-telemetry self-start text-[10px] opacity-55">{index}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-sm font-semibold">{title}</span>
        {description ? (
          <span className={cn(
            "mt-1.5 block font-sans text-xs leading-5",
            surface === "console" ? "text-muted-foreground" : "opacity-65",
          )}>
            {description}
          </span>
        ) : null}
        {metadata ? (
          <span className={cn(
            "brb-telemetry mt-2 block text-[9px] tracking-[0.08em] uppercase",
            surface === "console" ? "text-muted-foreground" : "text-dossier-ink/70",
          )}>
            {metadata}
          </span>
        ) : null}
      </span>
      <ChevronRight className="mt-0.5 size-4 shrink-0 opacity-45 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Button>
  );
  },
);

type ActionControlProps = {
  className?: string | undefined;
  title: string;
  cost: string;
  result: string;
  knownChanges?: string[] | undefined;
  risk?: string | undefined;
  delayedConsequence?: string | undefined;
  disabledReason?: string | undefined;
  recommendation?: string | undefined;
  disabled?: boolean;
  compact?: boolean;
  condensedMetadata?: boolean;
  surface?: "paper" | "console";
} & Omit<
  ComponentProps<"button">,
  "className" | "disabled" | "onSelect" | "title"
>;

/**
 * The shared visual anatomy for every major commitment. Game rules and previews
 * remain in plain TypeScript; this component only decides how that information
 * is presented inside the confirmation trigger.
 */
export const ActionControl = forwardRef<HTMLButtonElement, ActionControlProps>(
  function ActionControl({
  className,
  title,
  cost,
  result,
  knownChanges,
  risk,
  delayedConsequence,
  disabledReason,
  recommendation,
  disabled = false,
  compact = false,
  condensedMetadata = false,
  surface = "console",
  ...buttonProps
  }, ref) {
  return (
    <DecisionOption
      ref={ref}
      className={cn(
        "items-start",
        compact ? "min-h-[92px] py-3" : "min-h-[116px] py-4",
        recommendation && "ring-2 ring-inset ring-signal/65",
        className,
      )}
      disabled={disabled}
      surface={surface}
      title={title}
      {...buttonProps}
      description={result}
      metadata={(
        <span className={cn("grid", condensedMetadata ? "gap-1.5" : "gap-2")}>
          <span className={cn(
            "border-t border-current/20 pt-2",
            condensedMetadata
              ? "flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
              : "grid gap-1",
          )}>
            <span className="shrink-0 text-[9px] tracking-[0.14em] uppercase">
              Commitment cost
            </span>
            <strong className="min-w-0 flex-1 font-sans text-xs leading-5 font-semibold normal-case tracking-normal">
              {cost}
            </strong>
          </span>
          {knownChanges && knownChanges.length > 0 ? (
            <span className="font-sans text-xs leading-5 font-semibold normal-case tracking-normal">
              Exact immediate changes: {knownChanges.join(" · ")}
            </span>
          ) : null}
          {risk ? (
            <span className={cn(
              "font-sans text-xs leading-5 font-medium normal-case tracking-normal",
              surface === "paper"
                ? "text-[color:var(--paper-danger)]"
                : "text-[color:var(--destructive-soft)]",
            )}>
              Risk: {risk}
            </span>
          ) : null}
          {delayedConsequence ? (
            <span className="border-t border-dashed border-current/30 pt-2 font-sans text-xs leading-5 normal-case tracking-normal opacity-75">
              {delayedConsequence}
            </span>
          ) : null}
          {disabledReason ? (
            <span className={cn(
              "font-sans text-xs leading-5 font-semibold normal-case tracking-normal",
              surface === "paper"
                ? "text-[color:var(--paper-danger)]"
                : "text-[color:var(--destructive-soft)]",
            )}>
              {disabledReason}
            </span>
          ) : null}
          {recommendation ? (
            <span className="justify-self-start bg-signal/15 px-2 py-1 text-[9px] tracking-[0.12em] text-signal uppercase">
              {recommendation}
            </span>
          ) : null}
        </span>
      )}
    />
  );
  },
);

type AdvisorPanelProps = {
  name: string;
  role: string;
  status?: string | null;
  tone?: BrbTone;
  quote?: string;
  description?: ReactNode;
  stats?: BrbStat[];
  portrait?: ReactNode;
  showPortrait?: boolean;
  action?: BrbAction;
  footer?: ReactNode;
  className?: string;
};

export function AdvisorPanel({
  name,
  role,
  status = "Available",
  tone = "stable",
  quote,
  description,
  stats = [],
  portrait,
  showPortrait = true,
  action,
  footer,
  className,
}: AdvisorPanelProps) {
  const ActionIcon = action?.icon;
  return (
    <Card className={cn("gap-0 overflow-hidden rounded-sm border-border bg-console py-0 shadow-[4px_4px_0_rgba(0,0,0,0.28)]", className)}>
      <CardHeader className={cn("grid gap-4 border-b border-border p-4", showPortrait && "grid-cols-[72px_1fr]")}>
        {showPortrait ? portrait ?? <ArtworkPlaceholder aspect="square" icon={UserRound} label={`${name} portrait placeholder`} className="size-[72px]" /> : null}
        <div className="min-w-0">
          {status ? <StatusBadge tone={tone}>{status}</StatusBadge> : null}
          <h3 className="brb-display mt-3 mb-0 text-3xl leading-none font-semibold">{name}</h3>
          <p className="brb-telemetry mt-1 mb-0 text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{role}</p>
        </div>
      </CardHeader>
      {quote ? <CardContent className="border-b border-border p-4"><blockquote className="m-0 flex gap-3 text-sm leading-6 text-muted-foreground"><MessageSquareQuote className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" /><span>“{quote}”</span></blockquote></CardContent> : null}
      {description ? <CardContent className="border-b border-border p-4 text-[11px] leading-5 text-muted-foreground">{description}</CardContent> : null}
      {stats.length > 0 ? <CardContent className="grid auto-cols-fr grid-flow-col gap-px bg-border p-0">{stats.map((stat) => <div key={stat.label} className="bg-console p-3"><span className="brb-telemetry block text-[8px] tracking-[0.12em] text-muted-foreground uppercase">{stat.label}</span><strong className="brb-telemetry mt-2 block text-sm">{stat.value}</strong></div>)}</CardContent> : null}
      {action ? <CardFooter className="border-t border-border p-4"><Button className="w-full" variant="command" disabled={action.disabled} onClick={action.onSelect}>{ActionIcon ? <ActionIcon aria-hidden="true" /> : null}{action.label}</Button></CardFooter> : null}
      {footer ? <CardFooter className="grid gap-2 border-t border-border p-4">{footer}</CardFooter> : null}
    </Card>
  );
}

export function ActionBar({ actions, className }: { actions: BrbAction[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 border border-border bg-console p-3 sm:flex-row", className)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return <Button key={action.label} className="flex-1" variant={index === 0 ? "command" : "quiet"} disabled={action.disabled} onClick={action.onSelect}>{Icon ? <Icon aria-hidden="true" /> : null}{action.label}</Button>;
      })}
    </div>
  );
}

type ConfirmActionDialogProps = {
  trigger: ReactNode;
  title: string;
  description: string;
  summary?: ReactNode;
  confirmAction: BrbAction;
  secondaryConfirmAction?: BrbAction;
  cancelLabel?: string;
  tone?: "warning" | "critical";
};

export function ConfirmActionDialog({ trigger, title, description, summary, confirmAction, secondaryConfirmAction, cancelLabel = "Return to briefing", tone = "warning" }: ConfirmActionDialogProps) {
  const Icon = confirmAction.icon;
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {/* The confirm step is a stamped authorization slip laid on the desk, not
        * a console box. Every commitment in the game passes through here, so it
        * is the one surface that most has to agree with the paper screens
        * behind it. */}
      <DialogContent className="brb-design-system paper-surface max-h-[calc(100dvh-2rem)] min-w-0 overflow-x-hidden overflow-y-auto rounded-none border-[color:var(--paper-line)] text-[color:var(--paper-ink)] shadow-[var(--shadow-lift-sheet)]">
        <span aria-hidden="true" className="absolute top-0 left-7 h-3 w-20 bg-destructive/75" />
        <span aria-hidden="true" className="sheet-marks" />
        <DialogHeader className="min-w-0">
          <StatusBadge tone={tone} surface="paper" className="mb-3 self-start">Confirmation required</StatusBadge>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold text-[color:var(--paper-ink)]">{title}</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-[color:var(--ink)]/72">{description}</DialogDescription>
        </DialogHeader>
        {summary ? <div className="confirmation-summary confirmation-summary--paper">{summary}</div> : null}
        <DialogFooter className="mt-3 min-w-0 flex-wrap">
          <DialogClose asChild><Button variant="dossier">{cancelLabel}</Button></DialogClose>
          {secondaryConfirmAction ? (
            <DialogClose asChild>
              <Button
                variant="dossier"
                disabled={secondaryConfirmAction.disabled}
                onClick={() => {
                  setOpen(false);
                  secondaryConfirmAction.onSelect?.();
                }}
              >
                {secondaryConfirmAction.label}
              </Button>
            </DialogClose>
          ) : null}
          <DialogClose asChild><Button variant={tone === "critical" ? "critical" : "authorize"} disabled={confirmAction.disabled} onClick={() => {
            setOpen(false);
            confirmAction.onSelect?.();
          }}>{Icon ? <Icon aria-hidden="true" /> : null}{confirmAction.label}</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
