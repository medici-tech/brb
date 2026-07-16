// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ConfirmActionDialog,
  DecisionOption,
  FileIndexCard,
  ProgressTrack,
  RedactedText,
  StatusBadge,
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
});
