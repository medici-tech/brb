// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ConfirmActionDialog,
  DecisionOption,
  FileIndexCard,
  GuidedObjective,
  Hero,
  JournalSlot,
  ProgressTrack,
  RedactedText,
  ReportMetadata,
  ReportOutcomeSummary,
  ReportSection,
  ReportStat,
  ReportStatGrid,
  StatusBadge,
  TurnBeat,
  TurnBeatSequence,
} from "../../src/components/brb/ui/index.js";
import { Button } from "../../src/components/ui/button.js";

describe("BRB design system", () => {
  it("exposes visible and non-color status information", () => {
    render(<StatusBadge tone="critical">Severe threat</StatusBadge>);
    const badge = screen.getByText("Severe threat");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge.querySelector("svg")).toBeInTheDocument();
  });

  it("emits decision callbacks and blocks disabled decisions", () => {
    const select = vi.fn();
    const blocked = vi.fn();
    render(
      <>
        <DecisionOption title="Preserve authority" selected onSelect={select} />
        <DecisionOption title="Unavailable route" disabled onSelect={blocked} />
      </>,
    );

    const available = screen.getByRole("button", { name: /preserve authority/i });
    expect(available).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(available);
    fireEvent.click(screen.getByRole("button", { name: /unavailable route/i }));
    expect(select).toHaveBeenCalledOnce();
    expect(blocked).not.toHaveBeenCalled();
  });

  it("publishes progress semantics for assistive technology", () => {
    render(<ProgressTrack label="Engineering" value={38} maximum={50} status="Nominal" />);
    const progress = screen.getByRole("progressbar", { name: /engineering: 38 of 50/i });
    expect(progress).toHaveAttribute("aria-valuenow", "76");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders archive states without exposing hidden file titles", () => {
    render(
      <>
        <FileIndexCard fileId="FILE 01" state="discovered" title="Recovered Charter" />
        <FileIndexCard fileId="FILE 02" state="classified" title="Hidden Title" />
        <FileIndexCard fileId="FILE 03" state="redacted" title="Another Hidden Title" />
      </>,
    );
    expect(screen.getByText("Recovered Charter")).toBeInTheDocument();
    expect(screen.queryByText("Hidden Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Another Hidden Title")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Redacted text")).toBeInTheDocument();
  });

  it("gives redactions an explicit screen-reader label", () => {
    render(<RedactedText>Contractor identity withheld</RedactedText>);
    expect(screen.getByLabelText("Contractor identity withheld")).toBeInTheDocument();
  });

  it("opens the confirmation dialog and closes it with Escape", () => {
    const confirm = vi.fn();
    render(
      <ConfirmActionDialog
        trigger={<Button>Open confirmation</Button>}
        title="Activate the BRB?"
        description="This action cannot be reversed."
        tone="critical"
        confirmAction={{ label: "Activate BRB", onSelect: confirm }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open confirmation" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activate the BRB?" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("renders the production surface vocabulary with semantic landmarks", () => {
    render(
      <>
        <Hero eyebrow="Operational brief" title="Build the machine." summary="Decide what it costs." />
        <GuidedObjective eyebrow="Month one" title="Assess the file" description="Consult, then commit." />
        <TurnBeatSequence>
          <TurnBeat label="01 · Improvement" title="The position improved" tone="improvement" />
        </TurnBeatSequence>
        <JournalSlot order="01" eyebrow="Technocrat · Pending" title="Natural run">
          <p>Follow the current strategy.</p>
        </JournalSlot>
        <ReportOutcomeSummary
          result={<span>Result · Victory</span>}
          reasonTitle="Why this run ended"
          reason="The BRB was activated."
          rule="Public control survived."
          nextTitle="Try this instead"
          nextStep="Spend less leverage."
        />
        <ReportStatGrid>
          <ReportStat label="Stress" value="40 / 100" />
        </ReportStatGrid>
        <ReportMetadata items={[{ label: "Doctrine", value: "Technocrat" }]} />
        <ReportSection eyebrow="Turning point" title="A decision was made." />
      </>,
    );

    expect(screen.getByRole("heading", { name: "Build the machine." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assess the file" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The position improved" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Natural run" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Campaign result explained" })).toBeInTheDocument();
    expect(screen.getByText("Technocrat")).toBeInTheDocument();
  });
});
