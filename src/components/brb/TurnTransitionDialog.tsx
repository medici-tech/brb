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
import type { EchoType, TurnBeat, TurnResolution } from "../../game/types";
import { LastTurnResult } from "./LastTurnResult";

const BEAT_LABELS: Record<TurnBeat["kind"], string> = {
  improvement: "01 · IMPROVEMENT",
  discovery: "02 · STRATEGIC CONNECTION",
  milestone: "03 · MILESTONE",
  problem: "04 · NEW PROBLEM",
};

type Props = {
  beats: TurnBeat[];
  echoTypes: EchoType[];
  nextTurn: number;
  onContinue: () => void;
  open: boolean;
  resolution: TurnResolution | null;
};

function TurnBeatSequence({ beats }: { beats: TurnBeat[] }) {
  if (beats.length === 0) return null;
  return (
    <section
      className="turn-beat-sequence"
      aria-label="Commitment outcome"
      aria-live="polite"
    >
      {beats.map((beat) => (
        <article
          className={`turn-beat turn-beat-${beat.kind}`}
          data-beat-kind={beat.kind}
          key={`${beat.kind}-${beat.title}-${beat.linkedDecisionIds.join("-")}`}
        >
          <p className="turn-beat-label">{BEAT_LABELS[beat.kind]}</p>
          <h3>{beat.title}</h3>
          <p>{beat.explanation}</p>
          {beat.exactChanges.length > 0 ? (
            <ul>
              {beat.exactChanges.map((change) => <li key={change}>{change}</li>)}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export function TurnTransitionDialog({
  beats,
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
        className="turn-transition-dialog brb-paper-texture max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] min-w-0 max-w-3xl overflow-x-hidden overflow-y-auto rounded-sm border-dossier-ink/60 bg-dossier text-dossier-ink shadow-[10px_10px_0_rgba(0,0,0,0.5)]"
        showCloseButton={false}
      >
        <DialogHeader className="min-w-0">
          <p className="file-label text-destructive">
            COMMITMENT RESOLVED · MONTH {resolution.month}
          </p>
          <DialogTitle className="brb-display break-words text-4xl leading-none font-semibold">
            The campaign moved. Now it pushes back.
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-dossier-ink/70">
            Follow the sequence from improvement to the problem your next commitment
            may need to solve.
          </DialogDescription>
        </DialogHeader>
        <TurnBeatSequence beats={beats} />
        <details className="exact-turn-audit">
          <summary>Open exact action-to-consequence record</summary>
          <LastTurnResult
            echoTypes={echoTypes}
            heading="ACTION-TO-CONSEQUENCE RECORD"
            resolution={resolution}
          />
        </details>
        <DialogFooter className="mt-2">
          <Button variant="dossier" size="lg" onClick={onContinue}>
            Continue to {formatCampaignTime(nextTurn)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
