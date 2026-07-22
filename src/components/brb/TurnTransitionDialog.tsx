"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCampaignTime } from "../../game/progression";
import type { EchoType, TurnResolution } from "../../game/types";
import { LastTurnResult } from "./LastTurnResult";

type Props = {
  echoTypes: EchoType[];
  nextTurn: number;
  onContinue: () => void;
  open: boolean;
  resolution: TurnResolution | null;
};

export function TurnTransitionDialog({
  echoTypes,
  nextTurn,
  onContinue,
  open,
  resolution,
}: Props) {
  if (!resolution) return null;

  return (
    <Dialog open={open}>
      <DialogContent
        className="brb-paper-texture max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto rounded-sm border-dossier-ink/60 bg-dossier text-dossier-ink shadow-[10px_10px_0_rgba(0,0,0,0.5)]"
        showCloseButton={false}
      >
        <DialogHeader>
          <p className="file-label text-destructive">
            COMMITMENT RESOLVED · MONTH {resolution.month}
          </p>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">
            Read the consequences before the next move.
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-dossier-ink/70">
            Your commitment, advisor reactions, Corporation response, and automatic
            pressure are separated below so every change has a visible source.
          </DialogDescription>
        </DialogHeader>
        <LastTurnResult
          echoTypes={echoTypes}
          heading="ACTION-TO-CONSEQUENCE RECORD"
          resolution={resolution}
        />
        <DialogFooter className="mt-2">
          <Button variant="dossier" size="lg" onClick={onContinue}>
            Continue to {formatCampaignTime(nextTurn)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
