"use client";

import { ARCHETYPES, ENDING_COPY } from "../../game/content";
import { serializePlaytestJournal, summarizePlaytestJournal } from "../../playtest/journal";
import type { PlaytestJournalV1 } from "../../playtest/types";
import { ConfirmActionDialog } from "./ui/decisions";

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
        <button className="text-button" type="button" onClick={onBack}>Return</button>
      </header>

      <section className="paper-panel journal-intro">
        <p className="file-label">SOLO TEST PROTOCOL</p>
        <h1>Play consistently. Record the moments that matter.</h1>
        <p>Finish the three natural runs before tuning balance. The final three runs deliberately probe alternative strategies.</p>
        <button className="primary-button" type="button" onClick={download}>Export playtest journal</button>
      </section>

      <section className="journal-matrix" aria-labelledby="matrix-title">
        <div className="section-heading"><p className="file-label">SIX-RUN MATRIX</p><h2 id="matrix-title">Current test sequence</h2></div>
        {journal.matrix.map((slot, index) => {
          const locked = firstIncompleteIndex >= 0 && index > firstIncompleteIndex;
          return (
            <article className="journal-slot" key={slot.id}>
              <span className="journal-order">0{slot.order}</span>
              <div>
                <p className="file-label">{ARCHETYPES[slot.archetypeId].name} · {STATUS_LABELS[slot.status]}</p>
                <h3>{slot.label}</h3>
                <p>{slot.strategy}</p>
                {slot.replayRequired ? <small>Includes a five-commitment same-seed replay · {slot.replayCommitments} / 5 recorded</small> : null}
              </div>
              <div className="journal-slot-action">
                {slot.status === "pending" ? (
                  <button className="primary-button" type="button" disabled={locked || hasActiveRun} onClick={() => onStartSlot(slot.id)}>
                    {locked ? "Complete prior run" : "Start guided run"}
                  </button>
                ) : null}
                {(slot.status === "active" || slot.status === "replay_active") && hasActiveRun ? (
                  <button className="primary-button" type="button" onClick={onResumeActiveRun}>Resume run</button>
                ) : null}
                {(slot.status === "awaiting_recap" || slot.status === "awaiting_replay") && hasLatestReport ? (
                  <button className="primary-button" type="button" onClick={onOpenLatestReport}>Open report</button>
                ) : null}
                {slot.status === "completed" ? <strong className="complete-mark">✓ Complete</strong> : null}
              </div>
            </article>
          );
        })}
      </section>

      <section className="journal-summary" aria-labelledby="summary-title">
        <div className="section-heading"><p className="file-label">ROLLING SUMMARY</p><h2 id="summary-title">What the journal has observed</h2></div>
        <div className="summary-grid">
          <article><span>Average campaign</span><strong>{summary.averageCampaignMonths === null ? "—" : `${summary.averageCampaignMonths.toFixed(1)} months`}</strong></article>
          <article><span>Bookmarks</span><strong>{journal.bookmarks.length}</strong></article>
          <article><span>Recurring high-severity categories</span><strong>{summary.recurringHighSeverityCategories.join(", ") || "None"}</strong></article>
        </div>
        <div className="summary-columns">
          <article>
            <h3>Endings</h3>
            {Object.entries(summary.endings).length === 0 ? <p>No completed runs yet.</p> : Object.entries(summary.endings).map(([endingId, count]) => <p key={endingId}>{ENDING_COPY[endingId as keyof typeof ENDING_COPY].title}: {count}</p>)}
          </article>
          <article>
            <h3>Bookmark categories</h3>
            {Object.entries(summary.bookmarkCategories).length === 0 ? <p>No bookmarks yet.</p> : Object.entries(summary.bookmarkCategories).map(([category, count]) => <p key={category}>{category.replaceAll("_", " ")}: {count}</p>)}
          </article>
          <article>
            <h3>Replay divergence</h3>
            {journal.matrix.filter((slot) => slot.replayRequired).map((slot) => {
              const divergence = summary.replayDivergence[slot.id];
              return <p key={slot.id}>{ARCHETYPES[slot.archetypeId].name}: {divergence ? `decision ${divergence}` : "not recorded"}</p>;
            })}
          </article>
        </div>
      </section>

      <section className="journal-danger-zone">
        <p className="file-label">LOCAL DATA CONTROLS</p>
        <div>
          <ConfirmActionDialog
            trigger={<button className="secondary-button" type="button" disabled={!hasActiveRun}>Clear active run</button>}
            title="Clear only the active run?"
            description="The current browser save will be removed. Completed journal entries and prior notes remain available."
            confirmAction={{ label: "Clear active run", disabled: !hasActiveRun, onSelect: onClearActiveRun }}
          />
          <ConfirmActionDialog
            trigger={<button className="secondary-button" type="button">Delete journal</button>}
            title="Permanently delete the playtest journal?"
            description="All matrix progress, run captures, bookmarks, and recaps will be removed from this browser. Export first if you need a copy."
            tone="critical"
            confirmAction={{ label: "Delete journal", onSelect: onDeleteJournal }}
          />
        </div>
      </section>
    </main>
  );
}
