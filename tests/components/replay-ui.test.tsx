// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArchiveView } from "../../src/components/brb/ArchiveView.js";
import { CampaignScreen } from "../../src/components/brb/CampaignScreen.js";
import { DeclassifiedReportView } from "../../src/components/brb/DeclassifiedReportView.js";
import { commitAction, createEmptyArchive, createGame } from "../../src/game/index.js";
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
    runId: "report-run",
    seed: 42,
    archetypeId: "technocrat",
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
  };
}

describe("campaign replay UI", () => {
  it("sends card decisions to the pure engine boundary", () => {
    const state = createGame(12);
    state.activeCardId = "budget_shortfall";
    const onCommit = vi.fn();
    render(<CampaignScreen state={state} error={null} onCommit={onCommit} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByText("Month 1 · Year 1, Month 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cut public programs/i }));
    expect(onCommit).toHaveBeenCalledWith({ type: "resolve_card", choiceId: "cut" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirms an active card abandonment before sending a non-card action", () => {
    const state = createGame(12);
    state.activeCardId = "budget_shortfall";
    const onCommit = vi.fn();
    render(<CampaignScreen state={state} error={null} onCommit={onCommit} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /recover money/i }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/missing appropriation/i);
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /return to briefing/i }));
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /recover money/i }));
    fireEvent.click(screen.getByRole("button", { name: /ignore card and recover money/i }));
    expect(onCommit).toHaveBeenCalledWith(
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    );
  });

  it("shows an immediate consequence while keeping its delayed echo collapsed", () => {
    const state = createGame(12);
    state.activeCardId = "budget_shortfall";
    state.cardHistory.push({
      cardId: "budget_shortfall",
      turn: 1,
      choiceId: null,
      outcomeId: null,
      causedByDecisionId: null,
      status: "presented",
    });
    const resolved = commitAction(state, { type: "resolve_card", choiceId: "cut" }).state;
    render(<CampaignScreen state={resolved} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getByLabelText(/latest consequence/i)).toHaveTextContent(/missing appropriation/i);
    const details = screen.getByText(/delayed echo detected/i).closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("renders undiscovered Archive entries as silhouettes", () => {
    render(<ArchiveView archive={createEmptyArchive()} onBack={vi.fn()} />);
    expect(screen.getAllByLabelText(/classified card silhouette/i)).toHaveLength(15);
    expect(screen.queryByText("The Missing Appropriation")).not.toBeInTheDocument();
  });

  it("renders the report and wires both replay actions", () => {
    const theory = vi.fn();
    const fresh = vi.fn();
    render(<DeclassifiedReportView report={reportFixture()} onTestTheory={theory} onOpenNewFile={fresh} onArchive={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Perfect Machine, Empty State" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /test this theory/i }));
    fireEvent.click(screen.getByRole("button", { name: /open a new file/i }));
    expect(theory).toHaveBeenCalledOnce();
    expect(fresh).toHaveBeenCalledOnce();
  });
});
