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
    rulesVersion: 2,
    runId: "report-run",
    seed: 42,
    archetypeId: "technocrat",
    legacyDirective: {
      equippedId: null,
      used: false,
      usedOnDecisionId: null,
    },
    openingAftermath: null,
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
    finalSnapshot: {
      resources: {
        money: 20,
        influence: 18,
        intelligence: 14,
        trust: 24,
        capacity: 19,
      },
      pressures: { stress: 68, panic: 52 },
      tracks: { engineering: 50, access: 50, legitimacy: 50, stability: 50 },
      institutions: 48,
      corporation: { progress: 72, threat: 66 },
      advisors: {
        analyst: { active: true, alignment: 52, loyalty: 44, leverage: 36 },
        fixer: { active: true, alignment: 60, loyalty: 42, leverage: 62 },
        steward: { active: true, alignment: 48, loyalty: 38, leverage: 28 },
      },
    },
  };
}

describe("campaign replay UI", () => {
  it("sends card decisions to the pure engine boundary", () => {
    const state = createGame(12);
    state.activeCardId = "budget_shortfall";
    const onCommit = vi.fn();
    render(<CampaignScreen state={state} error={null} onCommit={onCommit} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);
    expect(screen.getAllByText("Campaign Month 1 · Year 1").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /cut public programs/i }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/ends Month 1/i);
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /authorize and end month 1/i }));
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
    expect(screen.getByRole("dialog")).toHaveTextContent(/selected commitment.*recover money/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/money \+30/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/stress \+7/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/corporation progress \+3/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/resolves as ignored before this commitment/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(/money −7 · stress \+5/i);
    expect(screen.getByRole("dialog")).toHaveTextContent(
      /ignored situation effect → optional legacy directive → selected commitment/i,
    );
    expect(screen.getByRole("dialog")).not.toHaveTextContent(/neglect entered the record/i);
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /return to briefing/i }));
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /recover money/i }));
    fireEvent.click(screen.getByRole("button", { name: /ignore file and end month 1/i }));
    expect(onCommit).toHaveBeenCalledWith(
      { type: "recover_resource", resource: "money" },
      { confirmCardAbandonment: true },
    );
  });

  it("shows containment instead of ignored damage", () => {
    const state = createGame(12);
    state.activeCardId = "budget_shortfall";
    state.suppressNextIgnoredCard = true;
    render(<CampaignScreen state={state} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /recover money/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/fixer prevents its immediate damage/i);
    expect(dialog).toHaveTextContent(/no ignored-file effects apply/i);
    expect(dialog).not.toHaveTextContent(/money −7/i);
  });

  it("shows when ignored damage blocks a commitment and a Directive restores it", () => {
    const blocked = createGame(75);
    blocked.activeCardId = "budget_shortfall";
    blocked.resources.money = 12;
    blocked.resources.trust = 20;
    const { unmount } = render(
      <CampaignScreen state={blocked} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />,
    );

    const blockedButton = screen.getByRole("button", { name: /protect institutions/i });
    expect(blockedButton).toBeDisabled();
    expect(blockedButton).toHaveTextContent(/requires 6 Money and 4 Trust/i);
    unmount();

    const restored = createGame({
      seed: 75,
      legacyDirectiveId: "emergency_appropriation",
    });
    restored.activeCardId = "budget_shortfall";
    restored.resources.money = 12;
    restored.resources.trust = 20;
    render(<CampaignScreen state={restored} error={null} onCommit={vi.fn()} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);

    const restoredButton = screen.getByRole("button", { name: /protect institutions/i });
    expect(restoredButton).toBeEnabled();
    fireEvent.click(restoredButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/money −7 · stress \+5/i);
    expect(screen.getByRole("button", { name: /use legacy directive/i })).toBeEnabled();
  });

  it("explains that activation expires an active card without resolving its ignored outcome", () => {
    const state = createGame(13);
    state.activeCardId = "budget_shortfall";
    state.tracks = {
      engineering: 50,
      access: 50,
      legitimacy: 50,
      stability: 50,
    };
    const onCommit = vi.fn();
    render(<CampaignScreen state={state} error={null} onCommit={onCommit} onConsult={vi.fn()} onOpenArchive={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /activate brb/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/expires unresolved when the brb activates/i);
    expect(dialog).toHaveTextContent(/ignored consequence and delayed echo do not resolve/i);
    expect(dialog).not.toHaveTextContent(/resolves as ignored before this commitment/i);

    fireEvent.click(screen.getByRole("button", { name: /expire file and activate/i }));
    expect(onCommit).toHaveBeenCalledWith(
      { type: "activate_brb" },
      { confirmCardAbandonment: true },
    );
  });

  it("shows exact immediate changes while keeping delayed details classified", () => {
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
    const result = screen.getByLabelText(/last month’s result/i);
    expect(result).toHaveTextContent(/missing appropriation/i);
    expect(result).toHaveTextContent(/money \+12/i);
    expect(result).toHaveTextContent(/trust −8/i);
    expect(result).toHaveTextContent(/delayed echo registered/i);
    expect(result).not.toHaveTextContent(/austerity entered the historical record/i);
  });

  it("discloses and sends a one-use Legacy Directive with the commitment", () => {
    const state = createGame({
      seed: 12,
      legacyDirectiveId: "emergency_appropriation",
    });
    state.activeCardId = null;
    const onCommit = vi.fn();
    render(
      <CampaignScreen
        state={state}
        error={null}
        onCommit={onCommit}
        onConsult={vi.fn()}
        onOpenArchive={vi.fn()}
      />,
    );

    expect(screen.getByText(/money \+12 · stress \+4 · available once/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /recover intel/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/optional legacy directive · common/i);
    expect(dialog).toHaveTextContent(/emergency appropriation: money \+12.*cost: stress \+4/i);
    fireEvent.click(screen.getByRole("button", { name: /use legacy directive/i }));

    expect(onCommit).toHaveBeenCalledWith(
      { type: "recover_resource", resource: "intelligence" },
      { useLegacyDirective: true },
    );
  });

  it("renders undiscovered Archive entries as silhouettes", () => {
    render(<ArchiveView archive={createEmptyArchive()} onBack={vi.fn()} />);
    expect(screen.getAllByLabelText(/classified card silhouette/i)).toHaveLength(15);
    expect(screen.queryByText("The Missing Appropriation")).not.toBeInTheDocument();
    expect(
      document.querySelector(
        'img[src="/assets/brb/control-room/rooms/records-office.png"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelectorAll('[data-room-object="evidence-shelf"]'),
    ).toHaveLength(0);
  });

  it("physically fills records shelves as recovered run knowledge grows", () => {
    const archive = createEmptyArchive();
    archive.processedRunIds = ["run-one", "run-two"];

    render(<ArchiveView archive={archive} onBack={vi.fn()} />);

    expect(
      document.querySelectorAll('[data-room-object="evidence-shelf"]'),
    ).toHaveLength(2);
    expect(
      document.querySelector(
        'img[src="/assets/brb/control-room/environment/records-shelf-sparse.png"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        'img[src="/assets/brb/control-room/environment/records-shelf-full.png"]',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        'img[src="/assets/brb/control-room/environment/records-shelf-overflow.png"]',
      ),
    ).toBeNull();
  });

  it("reveals only witnessed Archive choice labels and encounter counts", () => {
    const archive = createEmptyArchive();
    archive.cards.budget_shortfall = {
      encounters: 3,
      choices: { cut: 2, ignored: 1 },
      outcomes: ["budget_shortfall:cut", "budget_shortfall:ignored"],
    };

    render(<ArchiveView archive={archive} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText("The Missing Appropriation"));

    expect(screen.getByText(/3 encounters/i)).toBeInTheDocument();
    expect(screen.getByText("Cut public programs")).toBeInTheDocument();
    expect(screen.getByText("Ignored and escalated")).toBeInTheDocument();
    expect(screen.queryByText(/austerity entered/i)).not.toBeInTheDocument();
  });

  it("renders the report and wires both replay actions", () => {
    const theory = vi.fn();
    const fresh = vi.fn();
    render(<DeclassifiedReportView report={reportFixture()} onTestTheory={theory} onOpenNewFile={fresh} onArchive={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Perfect Machine, Empty State" })).toBeInTheDocument();
    expect(screen.getByLabelText(/campaign result explained/i)).toHaveTextContent(/result · victory/i);
    expect(screen.getByRole("heading", { name: /why this run ended/i })).toBeInTheDocument();
    expect(screen.getByText(/the three choices below are not a grade/i)).toBeInTheDocument();
    expect(screen.getByText(/story-defining choice/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /the ending in numbers/i })).toBeInTheDocument();
    expect(screen.getByText("72 / 100")).toBeInTheDocument();
    expect(screen.queryByText(/narrative weight/i)).not.toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-room-object="evidence-load"]'),
    ).toHaveLength(3);
    expect(
      document.querySelectorAll('[data-room-object="evidence-shelf"]'),
    ).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: /test this theory/i }));
    fireEvent.click(screen.getByRole("button", { name: /open a new file/i }));
    expect(theory).toHaveBeenCalledOnce();
    expect(fresh).toHaveBeenCalledOnce();
  });

  it("renders a deterministic reward draft and claims one Directive", () => {
    const archive = createEmptyArchive();
    archive.pendingDirectiveDraft = {
      candidateIds: [
        "emergency_appropriation",
        "coalition_whip",
        "continuity_freeze_order",
      ],
    };
    const claim = vi.fn();
    render(
      <DeclassifiedReportView
        report={reportFixture()}
        archive={archive}
        onClaimDirective={claim}
        onTestTheory={vi.fn()}
        onOpenNewFile={vi.fn()}
        onArchive={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /choose one authorization/i })).toBeInTheDocument();
    expect(screen.getByText(/this seeded draft is fixed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /preserve continuity freeze order/i }));
    expect(claim).toHaveBeenCalledWith("continuity_freeze_order");
  });

  it("marks reports from older rules without rewriting their recorded ending", () => {
    const legacy = reportFixture();
    legacy.rulesVersion = 0;
    legacy.finalSnapshot = null;
    legacy.ending.reason = "Stress reached the breaking point.";

    render(
      <DeclassifiedReportView
        report={legacy}
        onTestTheory={vi.fn()}
        onOpenNewFile={vi.fn()}
        onArchive={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/older rules build/i);
    expect(screen.getByRole("status")).toHaveTextContent(/stress no longer causes state collapse/i);
    expect(screen.getByRole("heading", { name: /recorded reason in that build/i })).toBeInTheDocument();
    expect(screen.getByText("Stress reached the breaking point.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /the ending in numbers/i })).not.toBeInTheDocument();
  });
});
