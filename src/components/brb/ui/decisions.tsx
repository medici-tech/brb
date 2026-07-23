"use client";

import { ChevronRight, MessageSquareQuote, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";

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
  index?: string;
  title: string;
  description?: string;
  metadata?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
};

export function DecisionOption({ index, title, description, metadata, selected = false, disabled = false, onSelect }: DecisionOptionProps) {
  return (
    <Button
      type="button"
      variant="dossier"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group h-auto min-h-20 w-full justify-start gap-4 rounded-sm px-4 py-4 text-left normal-case tracking-normal whitespace-normal",
        selected && "bg-dossier-ink text-dossier",
      )}
    >
      {index ? <span className="brb-telemetry self-start text-[10px] opacity-55">{index}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-sm font-semibold">{title}</span>
        {description ? <span className="mt-1.5 block font-sans text-xs leading-5 opacity-65">{description}</span> : null}
        {metadata ? <span className="brb-telemetry mt-2 block text-[9px] tracking-[0.08em] uppercase opacity-55">{metadata}</span> : null}
      </span>
      <ChevronRight className="mt-0.5 size-4 shrink-0 opacity-45 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Button>
  );
}

type AdvisorPanelProps = {
  name: string;
  role: string;
  status?: string;
  tone?: BrbTone;
  quote?: string;
  stats?: BrbStat[];
  portrait?: ReactNode;
  action?: BrbAction;
};

export function AdvisorPanel({ name, role, status = "Available", tone = "stable", quote, stats = [], portrait, action }: AdvisorPanelProps) {
  const ActionIcon = action?.icon;
  return (
    <Card className="gap-0 overflow-hidden rounded-sm border-border bg-console py-0 shadow-[4px_4px_0_rgba(0,0,0,0.28)]">
      <CardHeader className="grid grid-cols-[72px_1fr] gap-4 border-b border-border p-4">
        {portrait ?? <ArtworkPlaceholder aspect="square" icon={UserRound} label={`${name} portrait placeholder`} className="size-[72px]" />}
        <div className="min-w-0">
          <StatusBadge tone={tone}>{status}</StatusBadge>
          <h3 className="brb-display mt-3 mb-0 text-3xl leading-none font-semibold">{name}</h3>
          <p className="brb-telemetry mt-1 mb-0 text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{role}</p>
        </div>
      </CardHeader>
      {quote ? <CardContent className="border-b border-border p-4"><blockquote className="m-0 flex gap-3 text-sm leading-6 text-muted-foreground"><MessageSquareQuote className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" /><span>“{quote}”</span></blockquote></CardContent> : null}
      {stats.length > 0 ? <CardContent className="grid grid-cols-2 gap-px bg-border p-0">{stats.map((stat) => <div key={stat.label} className="bg-console p-3"><span className="brb-telemetry block text-[8px] tracking-[0.12em] text-muted-foreground uppercase">{stat.label}</span><strong className="brb-telemetry mt-2 block text-sm">{stat.value}</strong></div>)}</CardContent> : null}
      {action ? <CardFooter className="border-t border-border p-4"><Button className="w-full" variant="command" disabled={action.disabled} onClick={action.onSelect}>{ActionIcon ? <ActionIcon aria-hidden="true" /> : null}{action.label}</Button></CardFooter> : null}
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
      <DialogContent className="brb-design-system brb-console-grid max-h-[calc(100dvh-2rem)] min-w-0 overflow-x-hidden overflow-y-auto rounded-sm border-border bg-console shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
        <DialogHeader className="min-w-0">
          <StatusBadge tone={tone} className="mb-3">Confirmation required</StatusBadge>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">{title}</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        {summary ? <div className="confirmation-summary">{summary}</div> : null}
        <DialogFooter className="mt-3 min-w-0 flex-wrap">
          <DialogClose asChild><Button variant="quiet">{cancelLabel}</Button></DialogClose>
          {secondaryConfirmAction ? (
            <DialogClose asChild>
              <Button
                variant="command"
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
          <DialogClose asChild><Button variant={tone === "critical" ? "critical" : "command"} disabled={confirmAction.disabled} onClick={() => {
            setOpen(false);
            confirmAction.onSelect?.();
          }}>{Icon ? <Icon aria-hidden="true" /> : null}{confirmAction.label}</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
