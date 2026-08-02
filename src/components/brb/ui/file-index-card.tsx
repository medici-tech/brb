import { FileArchive, FileLock2, FileQuestion, ScanSearch } from "lucide-react";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { RedactedText } from "./dossier";
import { StatusBadge } from "./status-badge";

export type FileIndexState = "discovered" | "classified" | "redacted" | "unavailable";

type FileIndexCardProps = {
  fileId: string;
  state: FileIndexState;
  title?: string;
  metadata?: string;
  hiddenTitle?: ReactNode;
  ariaLabel?: string;
  expandable?: boolean;
  showStatus?: boolean;
  children?: ReactNode;
  className?: string;
};

const stateCopy: Record<FileIndexState, { label: string; icon: typeof FileArchive }> = {
  discovered: { label: "Recovered", icon: ScanSearch },
  classified: { label: "Classified", icon: FileLock2 },
  redacted: { label: "Redacted", icon: FileArchive },
  unavailable: { label: "Unavailable", icon: FileQuestion },
};

export function FileIndexCard({
  fileId,
  state,
  title,
  metadata,
  hiddenTitle,
  ariaLabel,
  expandable = false,
  showStatus = true,
  children,
  className,
}: FileIndexCardProps) {
  const Icon = stateCopy[state].icon;
  const isHidden = state !== "discovered";
  const header = (
    <>
      <div className="flex items-start justify-between gap-4 p-4">
        <div>
          <span className="brb-telemetry text-[9px] tracking-[0.15em] text-muted-foreground uppercase">{fileId}</span>
          <h3 className="brb-display mt-5 mb-0 text-2xl leading-none font-semibold text-foreground">
            {state === "discovered"
              ? title
              : hiddenTitle ?? (state === "redacted"
                ? <RedactedText blocks={2} revealToScreenReaders={false} />
                : "Access denied")}
          </h3>
        </div>
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="mt-auto border-t border-border p-4">
        {showStatus ? <StatusBadge tone={state === "discovered" ? "stable" : "classified"}>{stateCopy[state].label}</StatusBadge> : null}
        <p className={cn("brb-telemetry mb-0 text-[9px] tracking-[0.08em] text-muted-foreground uppercase", showStatus && "mt-3")}>
          {metadata ?? (isHidden ? "No recoverable evidence" : "Evidence indexed")}
        </p>
      </div>
    </>
  );
  const rootClassName = cn(
    "relative flex min-h-44 flex-col overflow-hidden rounded-sm border border-border bg-console",
    isHidden && "brb-console-grid opacity-60",
    state === "discovered" && "border-t-2 border-t-signal",
    className,
  );

  return expandable ? (
    <details aria-label={ariaLabel} className={rootClassName}>
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{header}</summary>
      {children ? <div className="border-t border-border p-4">{children}</div> : null}
    </details>
  ) : (
    <article aria-label={ariaLabel} className={rootClassName}>
      {header}
      {children ? <div className="border-t border-border p-4">{children}</div> : null}
    </article>
  );
}
