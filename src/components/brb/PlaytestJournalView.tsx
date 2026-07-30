"use client";

import { ARCHETYPES, ENDING_COPY } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { serializePlaytestJournal, summarizePlaytestJournal } from "../../playtest/journal";
import type { PlaytestJournalV1 } from "../../playtest/types";
import { Button } from "../ui/button";
import { ConfirmActionDialog } from "./ui/decisions";
import { CreditsDialog } from "./CreditsDialog";
import {
  ConsolePanel,
  DossierPanel,
  GuidedObjective,
  JournalSlot,
  MetricStrip,
  SectionHeading,
} from "./ui";

type Props = {
  journal: PlaytestJournalV1;
  hasActiveRun: boolean;
  hasLatestReport: boolean;
  onBack: () => void;
  onStartSlot: (slotId: string) => void;
  onResumeActiveRun: () => void;
  onOpenLatestReport: () => void;
  onClearActiveRun: () => void;
  onDeleteJournal: () => void;
};

const STATUS_LABELS = {
  pending: "Pending",
  active: "Run in progress",
  awaiting_recap: "Recap required",
  awaiting_replay: "Replay sample required",
  replay_active: "Replay in progress",
  completed: "Complete",
} as const;

export function PlaytestJournalView({
  journal,
  hasActiveRun,
  hasLatestReport,
  onBack,
  onStartSlot,
  onResumeActiveRun,
  onOpenLatestReport,
  onClearActiveRun,
  onDeleteJournal,
}: Props) {
  const summary = summarizePlaytestJournal(journal);
  const firstIncompleteIndex = journal.matrix.findIndex((slot) => slot.status !== "completed");
  const nextSlot = firstIncompleteIndex >= 0 ? journal.matrix[firstIncompleteIndex] : null;
  const nextStep = !nextSlot
    ? "All six guided runs are complete. Export the journal for review."
    : nextSlot.status === "pending"
      ? `Start ${ARCHETYPES[nextSlot.archetypeId].name}: ${nextSlot.label}.`
      : nextSlot.status === "active" || nextSlot.status === "replay_active"
        ? `Resume ${ARCHETYPES[nextSlot.archetypeId].name}: ${nextSlot.label}.`
        : nextSlot.status === "awaiting_recap"
          ? "Open the latest report and save its recap."
          : "Open the latest report and begin the required five-commitment same-seed replay.";

  function download(): void {
    const blob = new Blob([serializePlaytestJournal(journal)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `brb-playtest-journal-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell journal-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">GUIDED INTERNAL PLAYTEST · {journal.buildId}</p>
          <strong>{summary.completedSlots} / {summary.totalSlots} matrix runs complete</strong>
        </div>
        <div className="header-actions">
          <CreditsDialog />
          <button className="text-button" type="button" onClick={onBack}>Return</button>
        </div>
      </header>

      <DossierPanel
        eyebrow="SOLO TEST PROTOCOL"
        title="Play consistently. Record the moments that matter."
        headingLevel="h1"
        summary="Finish the three natural runs before tuning balance. The final three runs deliberately probe alternative strategies."
      >
        <Button variant="command" type="button" onClick={download}>Export playtest journal</Button>
      </DossierPanel>
      <GuidedObjective
        className="mt-6"
        eyebrow="NEXT REQUIRED STEP"
        title={nextStep}
        description=""
        compact
      />

      <section className="mt-12" aria-labelledby="matrix-title">
        <SectionHeading eyebrow="SIX-RUN MATRIX" title="Current test sequence" titleId="matrix-title" />
        {journal.matrix.map((slot, index) => {
          const locked = firstIncompleteIndex >= 0 && index > firstIncompleteIndex;
          return (
            <JournalSlot
              order={`0${slot.order}`}
              eyebrow={`${ARCHETYPES[slot.archetypeId].name} · ${STATUS_LABELS[slot.status]}`}
              title={slot.label}
              action={(
                <>
                  {slot.status === "pending" ? (
                    <Button variant="command" type="button" disabled={locked || hasActiveRun} onClick={() => onStartSlot(slot.id)}>
                      {locked ? "Complete prior run" : "Start guided run"}
                    </Button>
                  ) : null}
                  {(slot.status === "active" || slot.status === "replay_active") && hasActiveRun ? (
                    <Button variant="command" type="button" onClick={onResumeActiveRun}>Resume run</Button>
                  ) : null}
                  {(slot.status === "awaiting_recap" || slot.status === "awaiting_replay") && hasLatestReport ? (
                    <Button variant="command" type="button" onClick={onOpenLatestReport}>Open report</Button>
                  ) : null}
                  {slot.status === "completed" ? <strong className="brb-telemetry text-phosphor">✓ Complete</strong> : null}
                </>
              )}
              key={slot.id}
            >
                <p>{slot.strategy}</p>
                <small>
                  Directive: {slot.legacyDirectiveId
                    ? LEGACY_DIRECTIVES[slot.legacyDirectiveId].title
                    : "No Directive (legacy matrix)"}
                </small>
                {slot.replayRequired ? <small>Includes a five-commitment same-seed replay · {slot.replayCommitments} / 5 recorded</small> : null}
            </JournalSlot>
          );
        })}
      </section>

      <section className="mt-14" aria-labelledby="summary-title">
        <SectionHeading eyebrow="ROLLING SUMMARY" title="What the journal has observed" titleId="summary-title" />
        <MetricStrip
          columns={3}
          stats={[
            { label: "Average campaign", value: summary.averageCampaignMonths === null ? "—" : `${summary.averageCampaignMonths.toFixed(1)} months` },
            { label: "Bookmarks", value: journal.bookmarks.length },
            { label: "Recurring high-severity categories", value: summary.recurringHighSeverityCategories.join(", ") || "None" },
          ]}
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <ConsolePanel>
            <h3>Endings</h3>
            {Object.entries(summary.endings).length === 0 ? <p>No completed runs yet.</p> : Object.entries(summary.endings).map(([endingId, count]) => <p key={endingId}>{ENDING_COPY[endingId as keyof typeof ENDING_COPY].title}: {count}</p>)}
          </ConsolePanel>
          <ConsolePanel>
            <h3>Bookmark categories</h3>
            {Object.entries(summary.bookmarkCategories).length === 0 ? <p>No bookmarks yet.</p> : Object.entries(summary.bookmarkCategories).map(([category, count]) => <p key={category}>{category.replaceAll("_", " ")}: {count}</p>)}
          </ConsolePanel>
          <ConsolePanel>
            <h3>Replay divergence</h3>
            {journal.matrix.filter((slot) => slot.replayRequired).map((slot) => {
              const divergence = summary.replayDivergence[slot.id];
              return <p key={slot.id}>{ARCHETYPES[slot.archetypeId].name}: {divergence ? `decision ${divergence}` : "not recorded"}</p>;
            })}
          </ConsolePanel>
        </div>
      </section>

      <ConsolePanel className="mt-14 border-[color:#5d403e]" label="Local data controls">
        <p className="file-label">LOCAL DATA CONTROLS</p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <ConfirmActionDialog
            trigger={<Button variant="quiet" type="button" disabled={!hasActiveRun}>Clear active run</Button>}
            title="Clear only the active run?"
            description="The current browser save will be removed. Completed journal entries and prior notes remain available."
            confirmAction={{ label: "Clear active run", disabled: !hasActiveRun, onSelect: onClearActiveRun }}
          />
          <ConfirmActionDialog
            trigger={<Button variant="quiet" type="button">Delete journal</Button>}
            title="Permanently delete the playtest journal?"
            description="All matrix progress, run captures, bookmarks, and recaps will be removed from this browser. Export first if you need a copy."
            tone="critical"
            confirmAction={{ label: "Delete journal", onSelect: onDeleteJournal }}
          />
        </div>
      </ConsolePanel>
    </main>
  );
}
