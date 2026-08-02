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
        <button className="text-button" type="button">Field Manual</button>
      </DialogTrigger>
      <DialogContent className="brb-design-system brb-console-grid max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto rounded-sm border-border bg-console text-foreground shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
        <DialogHeader>
          <p className="file-label text-signal">OPERATING BRIEF</p>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">Build the BRB without losing the state.</DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
            Raise all four BRB tracks to 50, then activate before the Corporation or
            political collapse ends the campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="guide-grid">
          <section>
            <strong>1 · Assess</strong>
            <p>Read the active Situation, resources, Panic, Institutions, and Corporation Progress.</p>
          </section>
          <section>
            <strong>2 · Consult optionally</strong>
            <p>One advisor can help before you commit. Consultation costs Intel and gives that advisor Leverage.</p>
          </section>
          <section>
            <strong>3 · Commit</strong>
            <p>Choose exactly one commitment and confirm the month. Another action ignores the active Situation and applies its consequence first.</p>
          </section>
          <section>
            <strong>4 · Review and adapt</strong>
            <p>Read the attributed aftermath, then adjust. Deposited resources stay spent even if a later event damages a BRB track.</p>
          </section>
          <section>
            <strong>5 · Activate</strong>
            <p>Every track must reach 50. Activation ends the run; Corporation control and political safeguards determine the outcome.</p>
          </section>
          <section>
            <strong>6 · Build Clearance</strong>
            <p>Completed runs earn 1 Clearance; victories earn 3. At 3, choose one permanent Legacy Directive unlock from a seeded draft.</p>
          </section>
        </div>
        <div className="glossary-grid" aria-label="BRB field glossary">
          <section>
            <strong>Corporation Watch</strong>
            <p><b>Progress</b> reaches defeat at 100. <b>Posture</b> is the hidden move being prepared—consult an advisor to forecast it before you counter. <b>Threat</b> controls how soon and how severely the Corporation responds.</p>
          </section>
          <section>
            <strong>State pressure</strong>
            <p><b>Stress</b> drains Trust at 80 but does not directly end the campaign. <b>Panic</b> ends the campaign at 100. <b>Institutions</b> end the campaign at 0.</p>
          </section>
          <section>
            <strong>Advisor file</strong>
            <p><b>Alignment</b> affects advice quality. <b>Loyalty</b> is willingness to remain and has an advisor-specific breaking point. <b>Leverage</b> is their hold over you: one advisor at 85 seizes control, and two at 50 or more govern without you. Leverage at 50+ also creeps up each month, and you can only manage one advisor per month.</p>
          </section>
          <section>
            <strong>Delayed Echo</strong>
            <p>A decision has altered a future Situation, relationship, operating doctrine, or final record. The category is visible; the exact consequence stays classified.</p>
          </section>
          <section>
            <strong>Legacy Directive</strong>
            <p>An optional reward card equipped before a run. It modifies one accepted commitment, applies its listed drawback, and remains permanently unlocked.</p>
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
        <p className="guide-note">Loss conditions: Corporation Progress 100, Panic 100, Institutions 0, or every advisor departed. Stress is not a direct loss condition.</p>
      </DialogContent>
    </Dialog>
  );
}
