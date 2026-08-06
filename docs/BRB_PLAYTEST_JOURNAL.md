# BRB Playtest Journal

Free play with a recorder. Play the game as you actually want to play it, mark
the moments that confuse you, and triage afterwards against the exact board
state that produced them.

This replaces the six-run guided matrix, which is preserved for historical
context in [the archive](archive/BRB_GUIDED_PLAYTEST.md). That protocol assigned
archetypes and Directives, interrupted runs with comprehension checks, and asked
for a ten-field recap at the end. It existed to capture things the journal now
captures by itself.

## Playing a session

1. Start a campaign from the opening file. Pick any archetype and any Legacy
   Directive, or none. Nothing is assigned and nothing is required.
2. Play. The moment something confuses you, breaks, or lands especially well,
   press **M** and type one line. Enter saves it, Escape discards it. There is a
   **Drop marker (M)** button in the masthead if you would rather click.
3. Keep playing. A marker never interrupts a run and never asks a follow-up
   question — that is the whole point of it being one line.
4. Markers work on the Declassified Report too. "Why did I get *that* ending" is
   exactly the kind of confusion worth recording.

Do not tune balance during a run. Review at least three natural runs together
before changing a lever, and change one lever at a time.

## What the journal records

Every campaign is recorded automatically; there is no separate playtest mode.
For each run the journal stores its seed, archetype, Directive, every card the
deck drew, and an **input log** — the exact arguments each engine call received.

Markers carry a full board capture: turn, resources, tracks, pressures,
Institutions, Corporation strategy and progress, advisor Leverage, the active
Situation card, and the last commitment. A note like "Panic spiked and I could
not tell why" is answerable months later because the board that produced it is
attached to it.

The **Playtest Journal** screen shows coverage across archetypes, Directives,
endings, Situation files, and campaign length; a log of every recorded run; and
the marker notes themselves. Coverage is information, not a requirement — a gap
tells you what these sessions have not reached yet, and nothing is withheld
because of one.

Everything lives in this browser only. **Export playtest journal** writes a JSON
file; export whenever a session would be expensive to lose. **Delete journal**
is permanent.

## Replaying a session

Because runs are seeded and the input log is complete, any recorded run can be
reproduced outside the browser:

```bash
npm run replay -- ~/Downloads/brb-playtest-journal-2026-08-05.json --list
npm run replay -- ~/Downloads/brb-playtest-journal-2026-08-05.json --run <runId>
```

Useful flags: `--through <n>` stops after step *n*, `--at-turn <n>` also prints
the state at the first step ending on that turn, and `--state` includes the full
final `GameState`. The command reads a journal and writes nothing — unlike
`npm run simulate`, it is not a mutating evidence command.

### Reading the result

**REPRODUCED** (exit 0) — the run plays out identically under current rules. It
may carry a warning that `latestDecisionId` shifted; decision IDs are positional
(`D{turn}-{n}`), so an engine change that writes one extra `DecisionRecord`
anywhere renumbers them. That is a labelling shift, not a reproduction failure.

**DIVERGENCE** (exit 1) — the engine accepted every recorded input but landed
somewhere else. The report names the first mismatched field, the last step that
still agreed, and the two causes: an engine change altered how many random draws
an action consumes, or an input went unrecorded. The second is a recorder bug —
an unrecorded consultation advances the RNG twice on a forecast miss.

**REJECTED** (exit 1) — the rules no longer permit something the player actually
did. Expected after a balance change, and not a determinism failure.

**INCOMPLETE** (exit 2) — the run has no usable input log, because the journal
was reset or replaced while the campaign was under way. The replayer refuses it
rather than reporting a divergence that says nothing about the engine. The run
log marks these "partially recorded".

## Triage

Export the journal, then work through the markers. For each one, read the note
against its captured board state, and use `npm run replay` when you need to step
around the moment rather than just look at it. Sort findings into rules and
balance, interface clarity, pacing, replay motivation, and defects. Treat a
problem that appears in two or more runs as recurring.

## Notes on storage

Journals written by earlier builds are discarded rather than migrated — the
matrix they recorded no longer exists. Free play removes the six-run cap, so the
newest 25 completed runs keep a full input log and older ones degrade to their
summary, coverage, and markers; export before that matters to you. A failed
write never costs a turn: the campaign save is the source of truth and always
lands first.
