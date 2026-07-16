import { FileArchive, FileLock2, FileQuestion, ScanSearch } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RedactedText } from "./dossier";
import { StatusBadge } from "./status-badge";

export type FileIndexState = "discovered" | "classified" | "redacted" | "unavailable";

type FileIndexCardProps = {
  fileId: string;
  state: FileIndexState;
  title?: string;
  metadata?: string;
  className?: string;
};

const stateCopy: Record<FileIndexState, { label: string; icon: typeof FileArchive }> = {
  discovered: { label: "Recovered", icon: ScanSearch },
  classified: { label: "Classified", icon: FileLock2 },
  redacted: { label: "Redacted", icon: FileArchive },
  unavailable: { label: "Unavailable", icon: FileQuestion },
};

export function FileIndexCard({ fileId, state, title, metadata, className }: FileIndexCardProps) {
  const Icon = stateCopy[state].icon;
  const isHidden = state !== "discovered";
  return (
    <Card className={cn("relative min-h-44 gap-0 overflow-hidden rounded-sm border-border bg-console py-0", isHidden && "brb-console-grid", state === "discovered" && "border-t-2 border-t-signal", className)}>
      <CardHeader className="flex-row items-start justify-between gap-4 p-4">
        <div>
          <span className="brb-telemetry text-[9px] tracking-[0.15em] text-muted-foreground uppercase">{fileId}</span>
          <h3 className="brb-display mt-5 mb-0 text-2xl leading-none font-semibold text-foreground">
            {state === "discovered" ? title : state === "redacted" ? <RedactedText blocks={2} revealToScreenReaders={false} /> : "Access denied"}
          </h3>
        </div>
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="mt-auto border-t border-border p-4">
        <StatusBadge tone={state === "discovered" ? "stable" : "classified"}>{stateCopy[state].label}</StatusBadge>
        <p className="brb-telemetry mt-3 mb-0 text-[9px] tracking-[0.08em] text-muted-foreground uppercase">{metadata ?? (isHidden ? "No recoverable evidence" : "Evidence indexed")}</p>
      </CardContent>
    </Card>
  );
}
