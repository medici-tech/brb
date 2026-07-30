"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  PLAYTEST_BOOKMARK_CATEGORIES,
  PLAYTEST_SEVERITIES,
  type PlaytestBookmarkCategory,
  type PlaytestSeverity,
} from "../../playtest/types";
import type { BookmarkInput } from "../../playtest/journal";

const CATEGORY_LABELS: Record<PlaytestBookmarkCategory, string> = {
  bug: "Bug",
  confusion: "Confusion",
  pacing: "Pacing",
  balance: "Balance",
  consequence_clarity: "Consequence clarity",
  replay_idea: "Replay idea",
  delight: "Delight",
};

type Props = {
  onSave: (input: BookmarkInput) => void;
};

const fieldClassName = "grid gap-2 text-xs font-bold tracking-[0.04em] uppercase";
const controlClassName = "w-full rounded-none border border-border bg-raised p-3 font-sans text-sm leading-5 font-normal text-foreground normal-case [&>option]:bg-raised";

export function PlaytestBookmarkDialog({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<PlaytestBookmarkCategory>("confusion");
  const [severity, setSeverity] = useState<PlaytestSeverity>("medium");
  const [note, setNote] = useState("");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!note.trim()) return;
    onSave({ category, severity, note });
    setNote("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-button" type="button">Bookmark this moment</button>
      </DialogTrigger>
      <DialogContent className="brb-design-system brb-console-grid rounded-sm border-border bg-console text-foreground shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
        <DialogHeader>
          <p className="file-label text-signal">PLAYTEST NOTE</p>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">Capture what just happened.</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
            The journal automatically attaches the current seed, turn, meters, card, and latest commitment.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2" onSubmit={submit}>
          <label className={fieldClassName}>
            Category
            <select className={controlClassName} value={category} onChange={(event) => setCategory(event.target.value as PlaytestBookmarkCategory)}>
              {PLAYTEST_BOOKMARK_CATEGORIES.map((value) => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}
            </select>
          </label>
          <label className={fieldClassName}>
            Severity
            <select className={controlClassName} value={severity} onChange={(event) => setSeverity(event.target.value as PlaytestSeverity)}>
              {PLAYTEST_SEVERITIES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className={`${fieldClassName} sm:col-span-2`}>
            Short note
            <textarea className={`${controlClassName} resize-y`} required rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What felt wrong, surprising, or worth repeating?" />
          </label>
          <Button className="min-h-11 sm:col-span-2" variant="command" type="submit" disabled={!note.trim()}>Save bookmark</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
