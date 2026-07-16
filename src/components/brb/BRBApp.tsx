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
import type { AdvisorId, ArchetypeId, ArchiveV0, DeclassifiedReport, GameState, MajorAction, ReplayIntent } from "../../game/types";
import { ArchiveView } from "./ArchiveView";
import { CampaignScreen } from "./CampaignScreen";
import { DeclassifiedReportView } from "./DeclassifiedReportView";
import { StartScreen } from "./StartScreen";

type View = "start" | "campaign" | "report" | "archive";

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

  useEffect(() => {
    const loadedRun = loadActiveRun(window.localStorage);
    const loadedReport = loadLatestReport(window.localStorage);
    setSavedRun(loadedRun?.phase === "ended" ? null : loadedRun);
    setArchive(loadArchive(window.localStorage) ?? createEmptyArchive());
    setReport(loadedReport);
    setIntent(loadReplayIntent(window.localStorage));
  }, []);

  function begin(archetypeId: ArchetypeId, replay: ReplayIntent | null = intent): void {
    const seed = replay?.seed ?? randomSeed();
    const next = createGame({
      seed,
      archetypeId: replay?.archetypeId ?? archetypeId,
      runId: newRunId(),
      ...(replay ? { experiment: replay.experiment } : {}),
    });
    saveActiveRun(window.localStorage, next);
    clearReplayIntent(window.localStorage);
    setIntent(null);
    setSavedRun(next);
    setState(next);
    setError(null);
    setView("campaign");
  }

  function finish(next: GameState): void {
    if (!next.report) return;
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

  function handleCommit(action: MajorAction): void {
    if (!state) return;
    const result = commitAction(state, action);
    if (!result.accepted) {
      setError(result.error ?? "The action was rejected.");
      return;
    }
    setError(null);
    setState(result.state);
    if (result.state.phase === "ended") finish(result.state);
    else {
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
    begin(nextIntent.archetypeId, nextIntent);
  }

  if (view === "archive") {
    return (
      <ArchiveView
        archive={archive}
        onBack={() => setView(state && state.phase !== "ended" ? "campaign" : report ? "report" : "start")}
      />
    );
  }
  if (view === "campaign" && state) {
    return <CampaignScreen state={state} error={error} onCommit={handleCommit} onConsult={handleConsult} onOpenArchive={() => setView("archive")} />;
  }
  if (view === "report" && report) {
    return <DeclassifiedReportView report={report} onTestTheory={() => replay("same_seed")} onOpenNewFile={() => replay("fresh_seed")} onArchive={() => setView("archive")} />;
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
    />
  );
}
