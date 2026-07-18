# BRB Solo Guided Playtest

This round is a structured self-play audit. It can validate rules defects, pacing, balance feel, consequence clarity, save behavior, and replay behavior. It cannot prove that a brand-new player understands the game; that remains a later external playtest gate.

## Before starting

1. Run `npm test`, `npm run build`, then `npm run typecheck`.
2. Open the app and choose **Playtest Journal**.
3. Complete matrix runs in order. Do not tune balance during a run or between the first three natural-play runs.
4. Use **Bookmark this moment** immediately when something feels confusing, broken, abrupt, exploitable, or especially satisfying.

## Six-run matrix

| Run | Archetype | Intent | Replay sample |
| --- | --- | --- | --- |
| 1 | Technocrat | Play naturally without targeting an ending | Five commitments, same seed |
| 2 | Populist | Play naturally without targeting an ending | Five commitments, same seed |
| 3 | Operator | Play naturally without targeting an ending | Five commitments, same seed |
| 4 | Technocrat | Favor Standard Deposits, protect Institutions, recover endangered resources, consult before countering, and avoid rushing while Panic or Corporation Threat is high | None |
| 5 | Populist | Favor coalition actions and Legitimacy, protect Trust, choose public-facing responses, and avoid opaque shortcuts | None |
| 6 | Operator | Favor Access and direct counters, preserve Intel and Influence for the forecast Posture, and decide when Fixer Leverage is worth the help | None |

Finish each primary run, read its Declassified Report, and save the recap. For the first three runs, select **Test This Theory** after the recap; the journal automatically stops the sample after five accepted commitments. Consultations and rejected actions do not count.

## Evaluation rules

- Stop and fix any blocker, save-loss defect, or invalid journal export before continuing.
- Treat an issue appearing in two or more runs as recurring.
- Review the first three natural runs together before changing balance.
- After all six runs, sort findings into rules/balance, interface clarity, pacing, replay motivation, and defects.
- Change one balance lever per follow-up experiment and record it in the simulation log.

The journal is stored only in this browser. Export it after each run or whenever a note would be expensive to lose. **Clear active run** preserves completed journal data; **Delete journal** permanently removes matrix progress, run captures, bookmarks, and recaps.
