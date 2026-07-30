// @vitest-environment happy-dom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchiveView } from "../../src/components/brb/ArchiveView.js";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { CreditsDialog } from "../../src/components/brb/CreditsDialog.js";
import { DeclassifiedReportView } from "../../src/components/brb/DeclassifiedReportView.js";
import { EndingTableauView } from "../../src/components/brb/EndingTableauView.js";
import { PlaytestJournalView } from "../../src/components/brb/PlaytestJournalView.js";
import { StartScreen } from "../../src/components/brb/StartScreen.js";
import {
  ART_PACK_IDS,
  getRepresentedLimeZuPacks,
  LIMEZU_PACK_CATALOG,
} from "../../src/game-art/credits.js";
import { ART } from "../../src/game-art/manifest.js";
import { createEmptyArchive, createGame } from "../../src/game/index.js";
import { createEmptyPlaytestJournal } from "../../src/playtest/journal.js";
import type { DeclassifiedReport } from "../../src/game/types.js";

function reportFixture(): DeclassifiedReport {
  const pivot = {
    decisionId: "D4-1",
    turn: 4,
    summary: "The audit trail was closed.",
    score: 80,
    echoHints: ["A classified follow-up left the deck."],
  };
  return {
    rulesVersion: 2,
    runId: "report-run",
    seed: 42,
    archetypeId: "technocrat",
    legacyDirective: {
      equippedId: null,
      used: false,
      usedOnDecisionId: null,
    },
    ending: {
      id: "compromised_activation",
      title: "The Necessary Regime",
      description: "The machine worked, and the emergency remained.",
      victory: true,
      reason: "Test",
      variationId: "perfect_machine_empty_state",
      variationTitle: "Perfect Machine, Empty State",
    },
    pivotalDecision: pivot,
    narrativePivot: pivot,
    strategicPivot: { ...pivot, summary: "A large Engineering deposit was committed.", score: 72 },
    finalTurningPoint: { ...pivot, turn: 17, summary: "The last counter-operation failed.", score: 64 },
    completedRoute: null,
    unseenRouteHint: {
      routeId: "corporate_exposure",
      label: "Corporate Exposure",
      message: "A payment trail ended too soon.",
      visibility: "partial",
    },
    suggestedExperiment: "Follow the audit discrepancy instead of closing it.",
    finalSnapshot: null,
  };
}

describe("LimeZu credits", () => {
  it("credits only LimeZu packs represented by the runtime manifest", () => {
    const packs = getRepresentedLimeZuPacks();
    const packIds = packs.map((pack) => pack.id);

    expect(Object.keys(ART_PACK_IDS).sort()).toEqual(Object.keys(ART).sort());
    expect(packIds).toEqual([
      "modern_interiors",
      "modern_exteriors",
      "character_generator",
    ]);
    expect(LIMEZU_PACK_CATALOG.some((pack) => pack.id === "modern_exteriors")).toBe(true);
  });

  it("opens a contained credits dialog with external LimeZu source links", () => {
    render(<CreditsDialog />);

    fireEvent.click(screen.getByRole("button", { name: /^credits$/i }));
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveTextContent(/limezu/i);
    expect(dialog).toHaveTextContent(/modern interiors \(full version\)/i);
    expect(dialog).toHaveTextContent(/modern exteriors \(full version\)/i);
    expect(dialog).toHaveTextContent(/character generator \(full version\)/i);

    const links = within(dialog).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
      expect(link.getAttribute("href")).toMatch(/^https:\/\/limezu\.itch\.io/);
    }
  });

  it("reaches credits from every player-facing view", () => {
    const state = createGame(30);

    const { unmount: unmountStart } = render(
      <StartScreen
        savedRun={null}
        replayIntent={null}
        onStart={vi.fn()}
        onResume={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
    unmountStart();

    const { unmount: unmountCampaign } = render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={vi.fn()}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
    unmountCampaign();

    const { unmount: unmountReport } = render(
      <DeclassifiedReportView
        report={reportFixture()}
        onTestTheory={vi.fn()}
        onOpenNewFile={vi.fn()}
        onArchive={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
    unmountReport();

    const endingState = createGame(31);
    endingState.phase = "ended";
    endingState.ending = reportFixture().ending;
    const { unmount: unmountEnding } = render(
      <EndingTableauView state={endingState} onOpenReport={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
    unmountEnding();

    const { unmount: unmountArchive } = render(
      <ArchiveView archive={createEmptyArchive()} onBack={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
    unmountArchive();

    render(
      <PlaytestJournalView
        journal={createEmptyPlaytestJournal()}
        hasActiveRun={false}
        hasLatestReport={false}
        onBack={vi.fn()}
        onStartSlot={vi.fn()}
        onResumeActiveRun={vi.fn()}
        onOpenLatestReport={vi.fn()}
        onClearActiveRun={vi.fn()}
        onDeleteJournal={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /^credits$/i })).toBeInTheDocument();
  });
});
