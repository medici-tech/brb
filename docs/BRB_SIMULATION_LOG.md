# BRB Simulation Run Log

Every successful `npm run simulate` invocation made after automatic logging was introduced appends a summary here. Add run-specific context with `--notes`; the log stays in Git so balance decisions have a durable history.

Routine balance checks use 1,000–5,000 runs. A 10,000-run comparison requires an explicit request.

Earlier pre-logging baselines and controlled experiments remain documented chronologically in [BRB Balance Targets](BRB_BALANCE_TARGETS.md), with the post-replay machine-readable baseline preserved in [BRB Replay Baseline](BRB_REPLAY_BASELINE.json). This file does not attempt to reconstruct runs that occurred before the logger existed.

## 2026-07-17T01:38:20.275Z — Run log smoke test

- Runs: **3**
- Seed: `314159`
- Source: `1c83636` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 0 (0%) |
| Civic Legacy | 0 |
| State collapse | 2 (66.67%) |
| Corporate capture | 1 (33.33%) |
| Average / median months | 30 / 24 |
| Longest campaign | 44 months |
| Cards presented / resolved per run | 17 / 12.67 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Verified automatic logging after the run-log feature was added; no balance values changed.
## 2026-07-18T03:06:50.680Z — Corporation Threat clarity experiment

- Runs: **10,000**
- Seed: `20260715`
- Source: `1c83636` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 152 (1.52%) |
| Civic Legacy | 10 |
| State collapse | 4,640 (46.4%) |
| Corporate capture | 5,208 (52.08%) |
| Average / median months | 21.58 / 21 |
| Longest campaign | 59 months |
| Cards presented / resolved per run | 11.87 / 8.81 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Threat now modifies Corporation cadence and adverse move severity by visible tier. No unrelated balance values changed.
