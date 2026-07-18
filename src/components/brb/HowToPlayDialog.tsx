"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export function HowToPlayDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-button" type="button">How to Play</button>
      </DialogTrigger>
      <DialogContent className="brb-design-system brb-console-grid max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto rounded-sm border-border bg-console text-foreground shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
        <DialogHeader>
          <p className="file-label text-signal">OPERATING BRIEF</p>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">Build the BRB without losing the state.</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
            Each month gives you one optional consultation and one commitment. The commitment advances time.
          </DialogDescription>
        </DialogHeader>
        <div className="guide-grid">
          <section>
            <strong>1 · Read the pressure</strong>
            <p>Watch Panic, Institutions, advisor leverage, and Corporation progress. Any one of them can reshape or end the campaign.</p>
          </section>
          <section>
            <strong>2 · Consult if useful</strong>
            <p>An advisor can forecast the Corporation, but reliance builds leverage and each advisor has an agenda.</p>
          </section>
          <section>
            <strong>3 · Make one commitment</strong>
            <p>Resolve the active Situation Card or choose another action. Ignoring a card applies its shown consequence first.</p>
          </section>
          <section>
            <strong>4 · Build, then activate</strong>
            <p>Standard and Large Deposits permanently advance the four BRB tracks and permanently spend resources. Every track must reach 50 before activation.</p>
          </section>
        </div>
        <div className="glossary-grid" aria-label="BRB field glossary">
          <section>
            <strong>Corporation Watch</strong>
            <p><b>Progress</b> reaches defeat at 100. <b>Posture</b> names the move being prepared. <b>Threat</b> controls how soon and how severely the Corporation responds.</p>
          </section>
          <section>
            <strong>State pressure</strong>
            <p><b>Stress</b> drains Trust at 80. <b>Panic</b> ends the campaign at 100. <b>Institutions</b> end the campaign at 0.</p>
          </section>
          <section>
            <strong>Advisor file</strong>
            <p><b>Alignment</b> is agreement with your policy. <b>Loyalty</b> is willingness to remain. <b>Leverage</b> is power accumulated over you.</p>
          </section>
          <section>
            <strong>Delayed Echo</strong>
            <p>A decision has altered a future Situation, relationship, operating doctrine, or final record. The category is visible; the exact consequence stays classified.</p>
          </section>
          <section>
            <strong>Standard Deposit</strong>
            <p>The lower-cost commitment. It makes moderate permanent progress and applies the selected track’s exposure.</p>
          </section>
          <section>
            <strong>Large Deposit</strong>
            <p>Costs 175% of the Standard Deposit, rounded up. It makes substantially more permanent progress and doubles the track’s exposure.</p>
          </section>
        </div>
        <p className="guide-note">The dossier language is part of the game. Every term above maps to a rule you can inspect and plan around.</p>
      </DialogContent>
    </Dialog>
  );
}
