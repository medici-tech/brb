import { Menu, Shield } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { BrbAction } from "./types";

function ActionButtons({ actions }: { actions: BrbAction[] }) {
  return actions.map((action) => {
    const Icon = action.icon;
    return (
      <Button
        key={action.label}
        variant="quiet"
        disabled={action.disabled}
        onClick={action.onSelect}
      >
        {Icon ? <Icon aria-hidden="true" /> : null}
        {action.label}
      </Button>
    );
  });
}

type BriefingShellProps = {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
};

export function BriefingShell({ children, header, sidebar, className }: BriefingShellProps) {
  return (
    <main className={cn("brb-design-system", className)}>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        {header}
        <div className={cn("mt-8", sidebar && "grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]")}>
          <div className="min-w-0">{children}</div>
          {sidebar ? <div>{sidebar}</div> : null}
        </div>
      </div>
    </main>
  );
}

type BriefingHeaderProps = {
  eyebrow: string;
  title: string;
  metadata?: string;
  actions?: BrbAction[];
};

export function BriefingHeader({ eyebrow, title, metadata, actions = [] }: BriefingHeaderProps) {
  return (
    <header className="flex min-h-20 flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.18em] text-signal uppercase">{eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="brb-display m-0 text-4xl leading-none font-semibold tracking-[-0.02em] text-foreground sm:text-5xl">
            {title}
          </h1>
          {metadata ? <span className="brb-telemetry text-[11px] text-muted-foreground">{metadata}</span> : null}
        </div>
      </div>
      {actions.length > 0 ? <div className="flex flex-wrap gap-2"><ActionButtons actions={actions} /></div> : null}
    </header>
  );
}

type CommandSidebarProps = {
  title: string;
  description?: string;
  children: ReactNode;
  triggerLabel?: string;
};

export function CommandSidebar({ title, description, children, triggerLabel = "Open command panel" }: CommandSidebarProps) {
  return (
    <>
      <aside className="brb-console-grid hidden border border-border bg-console p-5 shadow-[4px_4px_0_rgba(0,0,0,0.32)] lg:block">
        <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
          <Shield className="size-4 text-signal" aria-hidden="true" />
          <div>
            <h2 className="brb-display m-0 text-2xl leading-none font-semibold">{title}</h2>
            {description ? <p className="mt-1 mb-0 text-xs text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {children}
      </aside>
      <div className="fixed right-4 bottom-4 z-40 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="command"><Menu aria-hidden="true" />{triggerLabel}</Button>
          </SheetTrigger>
          <SheetContent className="brb-design-system brb-console-grid w-[min(92vw,380px)] border-l-border bg-console p-0">
            <SheetHeader className="border-b border-border p-5 text-left">
              <SheetTitle className="brb-display text-3xl">{title}</SheetTitle>
              {description ? <SheetDescription>{description}</SheetDescription> : null}
            </SheetHeader>
            <div className="overflow-y-auto p-5">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  titleId?: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, titleId, description, action }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="brb-telemetry m-0 text-[10px] tracking-[0.16em] text-signal uppercase">{eyebrow}</p>
        <h2 id={titleId} className="brb-display mt-2 mb-0 text-3xl leading-none font-semibold sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 mb-0 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
