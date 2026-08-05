"use client";

import { ARCHETYPES, ENDING_COPY, SITUATION_CARDS } from "../../game/content";
import { LEGACY_DIRECTIVES } from "../../game/directives";
import { formatCampaignTime } from "../../game/progression";
import { summarizePlaytestCoverage } from "../../playtest/coverage";
import { serializePlaytestJournal } from "../../playtest/journal";
import type { PlaytestJournalV2, PlaytestRunEntry } from "../../playtest/types";
import { Button } from "../ui/button";
import { ConfirmActionDialog } from "./ui/decisions";
import { CreditsDialog } from "./CreditsDialog";
import {
  ConsolePanel,
  DossierPanel,
  JournalSlot,
  MetricStrip,
  SectionHeading,
} from "./ui";

type Props = {
  journal: PlaytestJournalV2;
  activeRunId: string | null;
  reportRunId: string | null;
  onBack: () => void;
  onResumeActiveRun: () => void;
  onOpenLatestReport: () => void;
  onDeleteJournal: () => void;
};

const STATUS_LABELS = {
  active: "In progress",
  completed: "Complete",
  abandoned: "Abandoned",
} as const;

/** Older runs stay in the export; the view stops listing them. */
const VISIBLE_RUNS = 20;

function pluralize(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function directiveTitle(run: PlaytestRunEntry): string {
  return run.legacyDirectiveId ? LEGACY_DIRECTIVES[run.legacyDirectiveId].title : "No Directive";
}

function runTitle(run: PlaytestRunEntry): string {
  if (run.endingId) return ENDING_COPY[run.endingId].title;
  return run.status === "abandoned" ? "Abandoned before an ending" : "In progress";
}

export function PlaytestJournalView({
  journal,
  activeRunId,
  reportRunId,
  onBack,
  onResumeActiveRun,
  onOpenLatestReport,
  onDeleteJournal,
}: Props) {
  const coverage = summarizePlaytestCoverage(journal);
  const runs = [...journal.runs].reverse();
  const visibleRuns = runs.slice(0, VISIBLE_RUNS);
  const markers = [...journal.markers].reverse();

  const notYetObserved = [
    ...coverage.archetypes.missing.map((id) => ARCHETYPES[id].name),
    ...coverage.directives.missing.map((id) => (id === "none" ? "a run with no Directive" : LEGACY_DIRECTIVES[id].title)),
    ...(coverage.endings.missing.length > 0 ? [`${coverage.endings.missing.length} endings`] : []),
    ...(coverage.cards.missing.length > 0 ? [`${coverage.cards.missing.length} Situation files`] : []),
  ];

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
          <p className="eyebrow">PLAYTEST JOURNAL · {journal.buildId}</p>
          <strong>{pluralize(coverage.runs.total, "run")} recorded · {pluralize(coverage.markers.total, "marker")}</strong>
        </div>
        <div className="header-actions">
          <CreditsDialog />
          <button className="text-button" type="button" onClick={onBack}>Return</button>
        </div>
      </header>

      <DossierPanel
        eyebrow="FREE PLAY"
        title="Play as you like. The journal records what you covered."
        headingLevel="h1"
        summary="Every campaign is recorded automatically. Press M during a run to drop a one-line marker the moment something confuses you; coverage below is information, not a requirement."
      >
        <Button variant="command" type="button" onClick={download}>Export playtest journal</Button>
      </DossierPanel>

      <section className="mt-12" aria-labelledby="coverage-title">
        <SectionHeading eyebrow="COVERAGE" title="What these sessions have reached" titleId="coverage-title" />
        <MetricStrip
          columns={4}
          stats={[
            { label: "Archetypes", value: `${coverage.archetypes.covered} / ${coverage.archetypes.total}` },
            { label: "Directives", value: `${coverage.directives.covered} / ${coverage.directives.total}` },
            { label: "Endings", value: `${coverage.endings.covered} / ${coverage.endings.total}` },
            { label: "Situation files", value: `${coverage.cards.covered} / ${coverage.cards.total}` },
          ]}
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <ConsolePanel>
            <h3>Endings seen</h3>
            {coverage.endings.covered === 0
              ? <p>No completed runs yet.</p>
              : Object.entries(coverage.endings.counts).map(([endingId, count]) => (
                <p key={endingId}>{ENDING_COPY[endingId as keyof typeof ENDING_COPY].title}: {count}</p>
              ))}
          </ConsolePanel>
          <ConsolePanel>
            <h3>Directives used</h3>
            {Object.entries(coverage.directives.counts).map(([id, count]) => (
              <p key={id}>{id === "none" ? "No Directive" : LEGACY_DIRECTIVES[id as keyof typeof LEGACY_DIRECTIVES].title}: {count}</p>
            ))}
            {coverage.runs.total === 0 ? <p>No runs yet.</p> : null}
          </ConsolePanel>
          <ConsolePanel>
            <h3>Campaign length</h3>
            {coverage.months.median === null
              ? <p>No completed runs yet.</p>
              : (
                <>
                  <p>Shortest {coverage.months.shortest} · median {coverage.months.median} · longest {coverage.months.longest} months</p>
                  {coverage.months.histogram.map((bucket) => (
                    <p key={bucket.label}>{bucket.label} months: {bucket.runs}</p>
                  ))}
                </>
              )}
          </ConsolePanel>
        </div>
        {notYetObserved.length > 0 ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Not yet observed: {notYetObserved.join(" · ")}.
          </p>
        ) : null}
      </section>

      <section className="mt-14" aria-labelledby="run-log-title">
        <SectionHeading eyebrow="RUN LOG" title="Every campaign this browser recorded" titleId="run-log-title" />
        {visibleRuns.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No runs yet. Start a campaign from the opening file and it will appear here.
          </p>
        ) : null}
        {visibleRuns.map((run, index) => (
          <JournalSlot
            key={run.runId}
            order={`${runs.length - index}`}
            eyebrow={`${ARCHETYPES[run.archetypeId].name} · ${STATUS_LABELS[run.status]}${run.kind === "replay" ? " · replay" : ""}`}
            title={runTitle(run)}
            action={(
              <>
                {run.runId === activeRunId ? (
                  <Button variant="command" type="button" onClick={onResumeActiveRun}>Resume run</Button>
                ) : null}
                {run.runId === reportRunId ? (
                  <Button variant="command" type="button" onClick={onOpenLatestReport}>Open report</Button>
                ) : null}
              </>
            )}
          >
            <p>
              Seed {run.seed} · {directiveTitle(run)}
              {run.months === null ? null : ` · ${formatCampaignTime(run.months)}`}
            </p>
            <small>
              {pluralize(run.steps.length, "recorded input")} ·{" "}
              {run.cardsSeen.length} of {SITUATION_CARDS.length} Situation files ·{" "}
              {pluralize(journal.markers.filter((marker) => marker.runId === run.runId).length, "marker")}
            </small>
            {run.replayComplete ? null : (
              <small>Partially recorded — this run cannot be replayed.</small>
            )}
          </JournalSlot>
        ))}
        {runs.length > VISIBLE_RUNS ? (
          <p className="mt-4 text-sm text-muted-foreground">
            + {runs.length - VISIBLE_RUNS} earlier runs in the export.
          </p>
        ) : null}
      </section>

      <section className="mt-14" aria-labelledby="markers-title">
        <SectionHeading eyebrow="MARKERS" title="What you flagged while playing" titleId="markers-title" />
        {markers.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No markers yet. Press M during a campaign to record one without leaving the run.
          </p>
        ) : (
          <div className="grid gap-2.5">
            {markers.map((marker) => (
              <ConsolePanel key={marker.id}>
                <p className="file-label">
                  {marker.location === "report" ? "REPORT" : "CAMPAIGN"}
                  {marker.snapshot ? ` · ${formatCampaignTime(marker.snapshot.turn)}` : null}
                </p>
                <p>{marker.note}</p>
                {marker.snapshot ? (
                  <small>
                    Panic {marker.snapshot.pressures.panic} · Stress {marker.snapshot.pressures.stress} ·
                    Corporation {marker.snapshot.corporation.strategy.replaceAll("_", " ")} at{" "}
                    {marker.snapshot.corporation.progress}
                    {marker.snapshot.summary ? ` · after: ${marker.snapshot.summary}` : null}
                  </small>
                ) : null}
              </ConsolePanel>
            ))}
          </div>
        )}
      </section>

      <ConsolePanel className="mt-14 border-[color:#5d403e]" label="Local data controls">
        <p className="file-label">LOCAL DATA CONTROLS</p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <ConfirmActionDialog
            trigger={<Button variant="quiet" type="button">Delete journal</Button>}
            title="Permanently delete the playtest journal?"
            description="Every recorded run, marker, and coverage figure will be removed from this browser. Export first if you need a copy."
            tone="critical"
            confirmAction={{ label: "Delete journal", onSelect: onDeleteJournal }}
          />
        </div>
      </ConsolePanel>
    </main>
  );
}
