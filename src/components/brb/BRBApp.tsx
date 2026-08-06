"use client";

import { useEffect, useState } from "react";
import { commitAction, consultAdvisor, createGame } from "../../game/engine";
import {
  claimLegacyDirective,
  consumePendingScar,
  createEmptyArchive,
  createReplayIntent,
  mergeRunIntoArchive,
} from "../../game/replay";
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
import type {
  AdvisorId,
  ArchetypeId,
  ArchiveV1,
  CommitOptions,
  DeclassifiedReport,
  GameState,
  LegacyDirectiveId,
  MajorAction,
  ReplayIntent,
} from "../../game/types";
import {
  abandonActivePlaytestRun,
  addPlaytestMarker,
  adoptUntrackedRun,
  clearPlaytestJournal,
  completePlaytestRun,
  createEmptyPlaytestJournal,
  loadPlaytestJournal,
  normalizePlaytestCommitOptions,
  recordPlaytestStep,
  savePlaytestJournal,
  startPlaytestRun,
} from "../../playtest/journal";
import type {
  PlaytestActionStep,
  PlaytestJournalV2,
  PlaytestRunKind,
} from "../../playtest/types";
import { ArchiveView } from "./ArchiveView";
import { CampaignScreen } from "./CampaignScreen";
import { DeclassifiedReportView } from "./DeclassifiedReportView";
import { EndingTableauView } from "./EndingTableauView";
import { PlaytestJournalView } from "./PlaytestJournalView";
import { StartScreen } from "./StartScreen";

type View =
  | "start"
  | "campaign"
  | "ending"
  | "report"
  | "archive"
  | "playtest";

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
  const [archive, setArchive] = useState<ArchiveV1>(() => createEmptyArchive());
  const [report, setReport] = useState<DeclassifiedReport | null>(null);
  const [intent, setIntent] = useState<ReplayIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [journal, setJournal] = useState<PlaytestJournalV2>(() => createEmptyPlaytestJournal());

  useEffect(() => {
    const loadedRun = loadActiveRun(window.localStorage);
    const loadedReport = loadLatestReport(window.localStorage);
    const activeRun = loadedRun?.phase === "ended" ? null : loadedRun;
    let loadedJournal = loadPlaytestJournal(window.localStorage);

    // A campaign can outlive its journal entry when the journal is reset or
    // written by an earlier build. Adopt it as unreproducible rather than
    // opening a step log mid-campaign, which would replay as a divergence that
    // says nothing about the engine.
    if (activeRun && !loadedJournal.runs.some((run) => run.runId === activeRun.runId)) {
      loadedJournal = adoptUntrackedRun(loadedJournal, activeRun);
      savePlaytestJournal(window.localStorage, loadedJournal);
    }

    setSavedRun(activeRun);
    setArchive(loadArchive(window.localStorage) ?? createEmptyArchive());
    setReport(loadedReport);
    setIntent(loadReplayIntent(window.localStorage));
    setJournal(loadedJournal);
    if (loadedReport && !activeRun) setView("report");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [view]);

  function persistJournal(next: PlaytestJournalV2): void {
    // A failed write means the origin quota is exhausted. The journal is a
    // record, never the source of truth, so play continues either way.
    savePlaytestJournal(window.localStorage, next);
    setJournal(next);
  }

  function openGame(next: GameState, kind: PlaytestRunKind = "primary"): void {
    saveActiveRun(window.localStorage, next);
    clearReplayIntent(window.localStorage);
    setIntent(null);
    setSavedRun(next);
    setState(next);
    setError(null);
    persistJournal(startPlaytestRun(journal, next, kind));
    setView("campaign");
  }

  function applyArchiveAftermathToOptions(
    options: Parameters<typeof createGame>[0] & object,
  ): Parameters<typeof createGame>[0] {
    const openingAftermath = archive.pendingScar;
    if (openingAftermath) {
      const cleared = consumePendingScar(archive);
      saveArchive(window.localStorage, cleared);
      setArchive(cleared);
    }
    return { ...options, openingAftermath };
  }

  function begin(
    archetypeId: ArchetypeId,
    legacyDirectiveId: LegacyDirectiveId | null = null,
    replay: ReplayIntent | null = intent,
  ): void {
    const seed = replay?.seed ?? randomSeed();
    const next = createGame(applyArchiveAftermathToOptions({
      seed,
      archetypeId: replay?.archetypeId ?? archetypeId,
      runId: newRunId(),
      ...(replay ? { experiment: replay.experiment } : {}),
      legacyDirectiveId: replay?.legacyDirectiveId ?? legacyDirectiveId,
    }));
    openGame(next, replay ? "replay" : "primary");
  }

  function finish(next: GameState, baseJournal: PlaytestJournalV2 = journal): void {
    if (!next.report) return;
    persistJournal(completePlaytestRun(baseJournal, next));
    const merged = mergeRunIntoArchive(archive, next);
    saveArchive(window.localStorage, merged);
    saveLatestReport(window.localStorage, next.report);
    clearActiveRun(window.localStorage);
    setArchive(merged);
    setReport(next.report);
    setSavedRun(null);
    setState(next);
    setView("ending");
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

    const step: PlaytestActionStep = {
      kind: "commit",
      action,
      options: normalizePlaytestCommitOptions(options),
    };

    if (result.state.phase === "ended") {
      finish(result.state, recordPlaytestStep(journal, step, result.state));
      return;
    }

    // The campaign save is the source of truth and has to land before the
    // journal: a failed journal write must never cost the player a turn.
    saveActiveRun(window.localStorage, result.state);
    setSavedRun(result.state);
    persistJournal(recordPlaytestStep(journal, step, result.state));
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
    // A consultation writes no DecisionRecord but still advances the RNG, so
    // the log has to carry it or the run stops being reproducible.
    persistJournal(recordPlaytestStep(
      journal,
      { kind: "consult", advisorId, useArchetypeAbility: useAbility },
      result.state,
    ));
  }

  function replay(mode: ReplayIntent["mode"]): void {
    if (!report) return;
    const nextIntent = createReplayIntent(report, mode);
    saveReplayIntent(window.localStorage, nextIntent);
    setIntent(nextIntent);
    const next = createGame(applyArchiveAftermathToOptions({
      seed: nextIntent.seed,
      archetypeId: nextIntent.archetypeId,
      runId: newRunId(),
      experiment: nextIntent.experiment,
      legacyDirectiveId: nextIntent.legacyDirectiveId,
    }));
    openGame(next, "replay");
  }

  function claimDirective(directiveId: LegacyDirectiveId): void {
    const next = claimLegacyDirective(archive, directiveId);
    saveArchive(window.localStorage, next);
    setArchive(next);
  }

  function markCampaign(note: string): void {
    if (!state || !journal.runs.some((run) => run.runId === state.runId)) return;
    persistJournal(addPlaytestMarker(journal, state.runId, "campaign", note, state));
  }

  function markReport(note: string): void {
    if (!report || !journal.runs.some((run) => run.runId === report.runId)) return;
    const matchingState = state?.runId === report.runId ? state : null;
    persistJournal(addPlaytestMarker(journal, report.runId, "report", note, matchingState));
  }

  function abandonActiveRun(): void {
    clearActiveRun(window.localStorage);
    persistJournal(abandonActivePlaytestRun(journal));
    setState(null);
    setSavedRun(null);
    setError(null);
  }

  function deleteJournal(): void {
    clearPlaytestJournal(window.localStorage);
    setJournal(createEmptyPlaytestJournal());
  }

  const reportRun = report ? journal.runs.find((run) => run.runId === report.runId) ?? null : null;

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
    return (
      <CampaignScreen
        state={state}
        error={error}
        onCommit={handleCommit}
        onConsult={handleConsult}
        onOpenArchive={() => setView("archive")}
        onOpenPlaytest={() => setView("playtest")}
        onMark={markCampaign}
      />
    );
  }
  if (view === "ending" && state?.ending) {
    return (
      <EndingTableauView
        state={state}
        onOpenReport={() => setView("report")}
      />
    );
  }
  if (view === "report" && report) {
    return (
      <DeclassifiedReportView
        report={report}
        archive={archive}
        onClaimDirective={claimDirective}
        onTestTheory={() => replay("same_seed")}
        onOpenNewFile={() => replay("fresh_seed")}
        onArchive={() => setView("archive")}
        onOpenPlaytest={() => setView("playtest")}
        onMark={markReport}
      />
    );
  }
  if (view === "playtest") {
    return (
      <PlaytestJournalView
        journal={journal}
        activeRunId={savedRun?.runId ?? null}
        reportRunId={report?.runId ?? null}
        onBack={() => setView(savedRun ? "campaign" : "start")}
        onResumeActiveRun={() => {
          if (savedRun) {
            setState(savedRun);
            setView("campaign");
          }
        }}
        onOpenLatestReport={() => {
          if (report) setView("report");
        }}
        onDeleteJournal={deleteJournal}
      />
    );
  }
  return (
    <StartScreen
      savedRun={savedRun}
      replayIntent={intent}
      unlockedDirectiveIds={archive.unlockedDirectiveIds}
      pendingScar={archive.pendingScar}
      onStart={(archetypeId, directiveId) => begin(archetypeId, directiveId)}
      onResume={() => {
        if (savedRun) {
          setState(savedRun);
          setView("campaign");
        }
      }}
      onOpenArchive={() => setView("archive")}
      onOpenPlaytest={() => setView("playtest")}
      onAbandonSavedRun={abandonActiveRun}
      newRunBlocked={Boolean(savedRun)}
    />
  );
}
