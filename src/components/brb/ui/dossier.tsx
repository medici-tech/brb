import { Aperture, FileWarning } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import type { BrbTone } from "./types";

type ClassificationStampProps = {
  children: ReactNode;
  tone?: "critical" | "classified";
  className?: string;
};

export function ClassificationStamp({ children, tone = "critical", className }: ClassificationStampProps) {
  return (
    <span
      className={cn(
        "brb-telemetry inline-flex rotate-[-2deg] border-2 px-3 py-1.5 text-xs font-bold tracking-[0.16em] uppercase",
        tone === "critical" ? "border-destructive text-destructive" : "border-dossier-ink/65 text-dossier-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

type RedactedTextProps = {
  children?: string;
  blocks?: number;
  revealToScreenReaders?: boolean;
};

export function RedactedText({ children = "Classified information", blocks = 3, revealToScreenReaders = true }: RedactedTextProps) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={revealToScreenReaders ? children : "Redacted text"}>
      {Array.from({ length: blocks }, (_, index) => (
        <span
          aria-hidden="true"
          className="inline-block h-[0.82em] bg-current opacity-90"
          key={index}
          style={{ width: `${2.4 + (index % 3) * 1.25}em` }}
        />
      ))}
    </span>
  );
}

type ArtworkPlaceholderProps = {
  label?: string;
  icon?: LucideIcon;
  aspect?: "landscape" | "portrait" | "square";
  className?: string;
};

export function ArtworkPlaceholder({ label = "Placeholder intelligence artwork", icon: Icon = Aperture, aspect = "landscape", className }: ArtworkPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "brb-console-grid relative grid overflow-hidden border border-border bg-raised text-phosphor",
        aspect === "landscape" && "aspect-[16/9]",
        aspect === "portrait" && "aspect-[4/5]",
        aspect === "square" && "aspect-square",
        className,
      )}
    >
      <div className="absolute inset-4 border border-phosphor/20" />
      <div className="absolute top-1/2 left-0 h-px w-full bg-phosphor/15" />
      <div className="absolute top-0 left-1/2 h-full w-px bg-phosphor/15" />
      <div className="z-10 m-auto grid justify-items-center gap-3 p-6 text-center">
        <Icon className="size-9 stroke-1" aria-hidden="true" />
        <span className="brb-telemetry text-[9px] tracking-[0.16em] uppercase">{label}</span>
      </div>
    </div>
  );
}

type DossierPanelProps = {
  eyebrow: string;
  title: string;
  summary?: string;
  classification?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DossierPanel({ eyebrow, title, summary, classification, children, footer, className }: DossierPanelProps) {
  return (
    <article className={cn("brb-paper-texture relative overflow-hidden border border-dossier text-dossier-ink shadow-[6px_6px_0_rgba(0,0,0,0.3)]", className)}>
      <div className="absolute top-0 left-7 h-3 w-20 bg-destructive/75" aria-hidden="true" />
      <div className="p-6 sm:p-8 lg:p-12">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="brb-telemetry m-0 text-[10px] tracking-[0.18em] uppercase opacity-65">{eyebrow}</p>
            <h2 className="brb-display mt-3 mb-0 text-4xl leading-[0.92] font-semibold tracking-[-0.02em] sm:text-6xl">{title}</h2>
            {summary ? <p className="mt-5 mb-0 max-w-2xl text-base leading-7 opacity-75 sm:text-lg">{summary}</p> : null}
          </div>
          {classification ? <ClassificationStamp>{classification}</ClassificationStamp> : null}
        </header>
        {children ? <div className="mt-8 border-t border-dossier-ink/25 pt-7">{children}</div> : null}
      </div>
      {footer ? <footer className="border-t border-dossier-ink/25 bg-dossier-ink/5 px-6 py-4 sm:px-8 lg:px-12">{footer}</footer> : null}
    </article>
  );
}

type DossierCardProps = {
  fileId: string;
  title: string;
  summary?: string;
  tone?: BrbTone;
  artwork?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DossierCard({ fileId, title, summary, tone = "classified", artwork, footer, className }: DossierCardProps) {
  return (
    <Card className={cn("brb-paper-texture gap-0 overflow-hidden rounded-sm border-dossier py-0 text-dossier-ink shadow-[4px_4px_0_rgba(0,0,0,0.28)]", className)}>
      {artwork}
      <CardHeader className="gap-4 border-b border-dossier-ink/20 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="brb-telemetry text-[10px] tracking-[0.15em] uppercase opacity-60">{fileId}</span>
          <StatusBadge tone={tone} className="border-dossier-ink/25 bg-dossier-ink/5 text-dossier-ink">
            {tone}
          </StatusBadge>
        </div>
        <h3 className="brb-display m-0 text-3xl leading-none font-semibold">{title}</h3>
      </CardHeader>
      {summary ? <CardContent className="px-5 py-5 text-sm leading-6 opacity-75">{summary}</CardContent> : null}
      {footer ? <CardFooter className="border-t border-dossier-ink/20 px-5 py-4">{footer}</CardFooter> : null}
    </Card>
  );
}

export function MissingFileArtwork() {
  return <ArtworkPlaceholder icon={FileWarning} label="Evidence image unavailable" />;
}
