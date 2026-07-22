"use client";

import { useEffect, useState } from "react";
import { commitAction, consultAdvisor, createGame } from "../../game/engine";
import { createEmptyArchive, createReplayIntent, mergeRunIntoArchive } from "../../game/replay";
import {
  clearActiveRun,
  clearReplayIntent,
  loadActiveRun,
  loadArchive,
  loadLatestReport,
  loadReplayIntent,
  saveActiveRun,
  saveArchive,
  saveLatestReport,
  saveReplayIntent,
} from "../../game/storage";
import type { AdvisorId, ArchetypeId, ArchiveV0, CommitOptions, DeclassifiedReport, GameState, MajorAction, ReplayIntent } from "../../game/types";
import {
  abandonActivePlaytestRun,
  addPlaytestBookmark,
  clearPlaytestJournal,
  completePlaytestRun,
  createEmptyPlaytestJournal,
  getGuidedRunObjective,
  loadPlaytestJournal,
  recordPlaytestDecision,
  savePlaytestJournal,
  savePlaytestRecap,
  startPrimaryPlaytestRun,
  startReplayPlaytestRun,
  type BookmarkInput,
} from "../../playtest/journal";
import type { PlaytestJournalV1, PlaytestRecap } from "../../playtest/types";
import { ArchiveView } from "./ArchiveView";
import { CampaignScreen } from "./CampaignScreen";
import { DeclassifiedReportView } from "./DeclassifiedReportView";
import { PlaytestJournalView } from "./PlaytestJournalView";
import { StartScreen } from "./StartScreen";

type View = "start" | "campaign" | "report" | "archive" | "playtest";

function newRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function randomSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now();
  }
  return Date.now() >>> 0;
}

export function BRBApp() {
  const [view, setView] = useState<View>("start");
  const [state, setState] = useState<GameState | null>(null);
  const [savedRun, setSavedRun] = useState<GameState | null>(null);
  const [archive, setArchive] = useState<ArchiveV0>(() => createEmptyArchive());
  const [report, setReport] = useState<DeclassifiedReport | null>(null);
  const [intent, setIntent] = useState<ReplayIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [journal, setJournal] = useState<PlaytestJournalV1>(() => createEmptyPlaytestJournal());

  useEffect(() => {
    const loadedRun = loadActiveRun(window.localStorage);
    const loadedReport = loadLatestReport(window.localStorage);
    const loadedJournal = loadPlaytestJournal(window.localStorage);
    setSavedRun(loadedRun?.phase === "ended" ? null : loadedRun);
    setArchive(loadArchive(window.localStorage) ?? createEmptyArchive());
    setReport(loadedReport);
    setIntent(loadReplayIntent(window.localStorage));
    setJournal(loadedJournal);
    if (loadedReport) {
      const reportSlot = loadedJournal.matrix.find((slot) => slot.primaryRunId === loadedReport.runId);
      if (reportSlot?.status === "awaiting_recap") setView("report");
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [view]);

  function persistJournal(next: PlaytestJournalV1): void {
    savePlaytestJournal(window.localStorage, next);
    setJournal(next);
  }

  function openGame(next: GameState, nextJournal?: PlaytestJournalV1): void {
    saveActiveRun(window.localStorage, next);
    clearReplayIntent(window.localStorage);
    setIntent(null);
    setSavedRun(next);
    setState(next);
    setError(null);
    if (nextJournal) persistJournal(nextJournal);
    setView("campaign");
  }

  function begin(archetypeId: ArchetypeId, replay: ReplayIntent | null = intent): void {
    const seed = replay?.seed ?? randomSeed();
    const next = createGame({
      seed,
      archetypeId: replay?.archetypeId ?? archetypeId,
      runId: newRunId(),
      ...(replay ? { experiment: replay.experiment } : {}),
    });
    openGame(next);
  }

  function startGuidedRun(slotId: string): void {
    const slot = journal.matrix.find((candidate) => candidate.id === slotId);
    if (!slot) return;
    const next = createGame({ seed: randomSeed(), archetypeId: slot.archetypeId, runId: newRunId() });
    openGame(next, startPrimaryPlaytestRun(journal, slotId, next));
  }

  function finish(next: GameState, baseJournal: PlaytestJournalV1 = journal): void {
    if (!next.report) return;
    const tracked = baseJournal.runs.some((run) => run.runId === next.runId);
    if (tracked) persistJournal(completePlaytestRun(baseJournal, next));
    const merged = mergeRunIntoArchive(archive, next);
    saveArchive(window.localStorage, merged);
    saveLatestReport(window.localStorage, next.report);
    clearActiveRun(window.localStorage);
    setArchive(merged);
    setReport(next.report);
    setSavedRun(null);
    setState(next);
    setView("report");
  }

  function handleCommit(action: MajorAction, options: CommitOptions = {}): void {
    if (!state) return;
    const result = commitAction(state, action, options);
    if (!result.accepted) {
      setError(result.error ?? "The action was rejected.");
      return;
    }
    setError(null);
    setState(result.state);
    const tracked = journal.runs.some((run) => run.runId === result.state.runId && run.status === "active");
    const recorded = tracked ? recordPlaytestDecision(journal, result.state) : { journal, checkpointReached: false };
    if (tracked) persistJournal(recorded.journal);
    if (result.state.phase === "ended") finish(result.state, recorded.journal);
    else if (recorded.checkpointReached) {
      clearActiveRun(window.localStorage);
      setSavedRun(null);
      setState(null);
      setView("playtest");
    } else {
      saveActiveRun(window.localStorage, result.state);
      setSavedRun(result.state);
    }
  }

  function handleConsult(advisorId: AdvisorId, useAbility: boolean): void {
    if (!state) return;
    const result = consultAdvisor(state, advisorId, useAbility);
    if (!result.accepted) {
      setError(result.error ?? "The consultation was rejected.");
      return;
    }
    setError(null);
    setState(result.state);
    setSavedRun(result.state);
    saveActiveRun(window.localStorage, result.state);
  }

  function replay(mode: ReplayIntent["mode"]): void {
    if (!report) return;
    const nextIntent = createReplayIntent(report, mode);
    saveReplayIntent(window.localStorage, nextIntent);
    setIntent(nextIntent);
    const next = createGame({
      seed: nextIntent.seed,
      archetypeId: nextIntent.archetypeId,
      runId: newRunId(),
      experiment: nextIntent.experiment,
    });
    const reportSlot = journal.matrix.find((slot) => slot.primaryRunId === report.runId);
    const nextJournal = mode === "same_seed" && reportSlot?.status === "awaiting_replay"
      ? startReplayPlaytestRun(journal, report.runId, next)
      : undefined;
    openGame(next, nextJournal);
  }

  function bookmarkCampaign(input: BookmarkInput): void {
    if (!state || !journal.runs.some((run) => run.runId === state.runId)) return;
    persistJournal(addPlaytestBookmark(journal, state.runId, "campaign", input, state));
  }

  function bookmarkReport(input: BookmarkInput): void {
    if (!report || !journal.runs.some((run) => run.runId === report.runId)) return;
    const matchingState = state?.runId === report.runId ? state : null;
    persistJournal(addPlaytestBookmark(journal, report.runId, "report", input, matchingState));
  }

  function saveRecap(recap: Omit<PlaytestRecap, "recordedAt">): void {
    if (!report) return;
    persistJournal(savePlaytestRecap(journal, report.runId, recap));
  }

  function clearCurrentRun(): void {
    clearActiveRun(window.localStorage);
    persistJournal(abandonActivePlaytestRun(journal));
    setState(null);
    setSavedRun(null);
    setError(null);
    setView("playtest");
  }

  function deleteJournal(): void {
    clearPlaytestJournal(window.localStorage);
    setJournal(createEmptyPlaytestJournal());
  }

  const reportRun = report ? journal.runs.find((run) => run.runId === report.runId && run.kind === "primary") ?? null : null;
  const reportSlot = reportRun ? journal.matrix.find((slot) => slot.id === reportRun.slotId) ?? null : null;

  if (view === "archive") {
    const returnView = state && state.phase !== "ended" ? "campaign" : report ? "report" : "start";
    return (
      <ArchiveView
        archive={archive}
        backLabel={
          returnView === "campaign"
            ? "Return to campaign"
            : returnView === "report"
              ? "Return to report"
              : "Return to opening file"
        }
        onBack={() => setView(returnView)}
      />
    );
  }
  if (view === "campaign" && state) {
    const trackedRun = journal.runs.find((run) => run.runId === state.runId);
    const isTracked = Boolean(trackedRun);
    return (
      <CampaignScreen
        state={state}
        error={error}
        onCommit={handleCommit}
        onConsult={handleConsult}
        onOpenArchive={() => setView("archive")}
        onOpenPlaytest={() => setView("playtest")}
        guidedObjective={trackedRun ? getGuidedRunObjective(trackedRun.slotId) : null}
        {...(isTracked ? { onBookmark: bookmarkCampaign } : {})}
      />
    );
  }
  if (view === "report" && report) {
    return (
      <DeclassifiedReportView
        report={report}
        onTestTheory={() => replay("same_seed")}
        onOpenNewFile={() => replay("fresh_seed")}
        onArchive={() => setView("archive")}
        onOpenPlaytest={() => setView("playtest")}
        playtestRun={reportRun}
        guidedReplayRequired={Boolean(reportSlot?.replayRequired)}
        {...(reportRun ? { onBookmark: bookmarkReport, onSaveRecap: saveRecap } : {})}
      />
    );
  }
  if (view === "playtest") {
    return (
      <PlaytestJournalView
        journal={journal}
        hasActiveRun={Boolean(savedRun)}
        hasLatestReport={Boolean(report)}
        onBack={() => setView(savedRun ? "campaign" : "start")}
        onStartSlot={startGuidedRun}
        onResumeActiveRun={() => {
          if (savedRun) {
            setState(savedRun);
            setView("campaign");
          }
        }}
        onOpenLatestReport={() => {
          if (report) setView("report");
        }}
        onClearActiveRun={clearCurrentRun}
        onDeleteJournal={deleteJournal}
      />
    );
  }
  return (
    <StartScreen
      savedRun={savedRun}
      replayIntent={intent}
      onStart={(archetypeId) => begin(archetypeId)}
      onResume={() => {
        if (savedRun) {
          setState(savedRun);
          setView("campaign");
        }
      }}
      onOpenArchive={() => setView("archive")}
      onOpenPlaytest={() => setView("playtest")}
      newRunBlocked={Boolean(savedRun)}
    />
  );
}
