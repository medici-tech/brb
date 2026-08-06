"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const INPUT_ID = "playtest-marker-input";

type Props = {
  onSave: (note: string) => void;
  /** Shown back in the confirmation so a saved marker is placeable at a glance. */
  momentLabel?: string;
};

/**
 * A marker is a single line dropped the moment something confuses you, without
 * leaving the campaign. It replaces a modal that asked for a category and a
 * severity before you could type — three decisions between noticing a problem
 * and recording it. Triage assigns those afterwards, with the board state the
 * journal captured alongside the note.
 *
 * This component owns the whole feature: the shortcut listener, the open state,
 * the input, the visible fallback, and the confirmation. One owner means one
 * listener and no cross-component coordination about whether the bar is open.
 * It is deliberately mounted only where marking means something — the campaign
 * and the report — rather than app-wide.
 */
export function PlaytestMarkerBar({ onSave, momentLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const openBar = useCallback(() => {
    setConfirmation("");
    setOpen(true);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.defaultPrevented || event.repeat) return;
      // Leave every browser and OS chord alone; the shortcut is a bare key.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() !== "m") return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      // Radix marks its own open content; both checks are needed because focus
      // may sit inside the dialog or on the body behind it.
      if (target?.closest?.('[role="dialog"]')) return;
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;

      event.preventDefault();
      openBar();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openBar]);

  function close(): void {
    setOpen(false);
    setNote("");
    toggleRef.current?.focus();
  }

  function save(): void {
    const trimmed = note.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setConfirmation(momentLabel ? `Marker saved at ${momentLabel}.` : "Marker saved.");
    close();
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    save();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // Stop both keys before any dialog ancestor can act on them.
    if (event.key === "Escape") {
      event.stopPropagation();
      event.preventDefault();
      setConfirmation("");
      close();
      return;
    }
    if (event.key !== "Enter") return;
    // Handled here rather than left to implicit form submission, which does not
    // fire reliably for a single-field form across every browser and input
    // method. preventDefault keeps it from also submitting and saving twice.
    event.stopPropagation();
    event.preventDefault();
    save();
  }

  return (
    <>
      <button
        ref={toggleRef}
        className="text-button internal-tool-button"
        type="button"
        aria-expanded={open}
        aria-controls={INPUT_ID}
        onClick={() => (open ? close() : openBar())}
      >
        Drop marker (M)
      </button>
      {open ? (
        <form className="playtest-marker-form" onSubmit={submit}>
          <label className="sr-only" htmlFor={INPUT_ID}>One-line playtest marker</label>
          <input
            ref={inputRef}
            id={INPUT_ID}
            className="playtest-marker-input"
            type="text"
            value={note}
            maxLength={200}
            autoComplete="off"
            placeholder="What just confused you?"
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button className="text-button" type="submit" disabled={!note.trim()}>Save</button>
        </form>
      ) : null}
      {/*
        Permanently mounted: a live region has to exist before its text changes
        or assistive technology misses the update.
      */}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{confirmation}</p>
    </>
  );
}
