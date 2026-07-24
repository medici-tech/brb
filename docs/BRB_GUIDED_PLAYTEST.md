# BRB Solo Guided Playtest

This round is a structured self-play audit. It can validate rules defects, pacing, balance feel, consequence clarity, save behavior, and replay behavior. It cannot prove that a brand-new player understands the game; that remains a later external playtest gate.

## Before starting

1. Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:browser`. On a new machine, run `npm run test:browser:install` once before the browser suite.
2. Open the app and choose **Internal Playtest**.
3. Complete matrix runs in order. Do not tune balance during a run or between the first three natural-play runs.
4. Use **Bookmark this moment** immediately when something feels confusing, broken, abrupt, exploitable, or especially satisfying.

## Six-run matrix

| Run | Archetype | Legacy Directive | Intent | Replay sample |
| --- | --- | --- | --- | --- |
| 1 | Technocrat | Emergency Appropriation | Play naturally without targeting an ending | Five commitments, same seed and Directive |
| 2 | Populist | Coalition Whip | Play naturally without targeting an ending | Five commitments, same seed and Directive |
| 3 | Operator | Protected Channel | Play naturally without targeting an ending | Five commitments, same seed and Directive |
| 4 | Technocrat | Public Confidence Reserve | Favor Standard Deposits, protect Institutions, recover endangered resources, consult before countering, and avoid rushing while Panic or Corporation Threat is high | None |
| 5 | Populist | Industrial Surge | Favor coalition actions and Legitimacy, protect Trust, choose public-facing responses, and avoid opaque shortcuts | None |
| 6 | Operator | Continuity Freeze Order | Favor Access and direct counters, preserve Intel and Influence for the forecast Posture, and decide when Fixer Leverage is worth the help | None |

Finish each primary run, read its Declassified Report, and save the recap. For the first three runs, select **Test This Theory** after the recap; the journal automatically stops the sample after five accepted commitments. Consultations and rejected actions do not count.

The Journal displays the next required step at the top. Recap ratings use explicit endpoints: 1 means poor or unclear, while 5 means excellent or clear.
Every recap records the Directive use month (or that it was held), why that timing was chosen,
whether the drawback felt meaningful, and whether the ignored-Situation → Directive →
commitment order was understood.

## Evaluation rules

- Stop and fix any blocker, save-loss defect, or invalid journal export before continuing.
- After Month 3, verify the player can state the objective, four loss conditions, permanent-deposit rule, advisor departure thresholds, and the cause of the last month's changes without opening documentation.
- After a route, doctrine, relationship, or archetype connection appears, ask the player to explain which earlier choice combined with the current one. Record a clarity issue if the answer requires opening the exact audit.
- After a milestone, ask the player what improved, what pressure the success created, and what the next commitment should address. Record whether the milestone felt satisfying without breaking the severe control-room tone.
- When a Directive is available, record why it was held or spent. After use, identify whether its drawback changed the next decision or merely read as flavor.
- After confirming an ignored Situation, ask the player to state which effect resolves first and whether the selected commitment remains affordable.
- Treat an issue appearing in two or more runs as recurring.
- Review the first three natural runs together before changing balance.
- After all six runs, sort findings into rules/balance, interface clarity, pacing, replay motivation, and defects.
- Change one balance lever per follow-up experiment and record it in the simulation log.

The journal is stored only in this browser. Export it after each run or whenever a note would be expensive to lose. A bookmark captures the current turn, active Situation, resources, tracks, pressures, Corporation state, and advisor Leverage even before the first commitment; the run entry supplies its seed, archetype, and Directive. Journal V1 remains backward compatible: older matrices load with their original no-Directive assignments instead of receiving new loadouts mid-test, while invalid Directive IDs fail closed. Decision-specific bookmark fields are `null` until a commitment exists. **Clear active run** preserves completed journal data; **Delete journal** permanently removes matrix progress, run captures, bookmarks, and recaps.

The Chromium and axe checks verify that the documented controls work mechanically. They do not measure whether the rules feel understandable, fair, tense, or worth replaying; record those judgments in the journal rather than treating automation as a substitute.
