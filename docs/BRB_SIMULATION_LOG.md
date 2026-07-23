# BRB Simulation Run Log

Every successful `npm run simulate` invocation made after automatic logging was introduced appends a summary here. Add run-specific context with `--notes`; the log stays in Git so balance decisions have a durable history.

Routine comparisons of common outcomes, duration, and card tempo use 3,000 runs. Use 5,000 when activation or sub-percentage-point movement matters, and use alternate seeds or multiple seed blocks for seed-to-seed robustness. Rare Civic Legacy and individual-strategy results remain imprecise at 5,000 runs. A 10,000-run comparison requires an explicit request.

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

## 2026-07-19T02:55:57.110Z — Requested routine simulator run

- Runs: **1,000**
- Seed: `20260715`
- Source: `9d87626` (clean)

| Outcome | Result |
| --- | ---: |
| Activations | 18 (1.8%) |
| Civic Legacy | 2 |
| State collapse | 468 (46.8%) |
| Corporate capture | 514 (51.4%) |
| Average / median months | 21.48 / 21 |
| Longest campaign | 40 months |
| Cards presented / resolved per run | 11.83 / 8.78 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Routine fixed-seed simulator snapshot requested by the maintainer; no balance values changed.

## 2026-07-19T03:00:44.950Z — Sample-size comparison — 1,000 runs

- Runs: **1,000**
- Seed: `20260715`
- Source: `085b103` (clean)

| Outcome | Result |
| --- | ---: |
| Activations | 18 (1.8%) |
| Civic Legacy | 2 |
| State collapse | 468 (46.8%) |
| Corporate capture | 514 (51.4%) |
| Average / median months | 21.48 / 21 |
| Longest campaign | 40 months |
| Cards presented / resolved per run | 11.83 / 8.78 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> First checkpoint in a fixed-seed 1k/3k/5k convergence comparison; no balance values changed.

## 2026-07-19T03:01:29.345Z — Sample-size comparison — 3,000 runs

- Runs: **3,000**
- Seed: `20260715`
- Source: `085b103` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 41 (1.37%) |
| Civic Legacy | 4 |
| State collapse | 1,402 (46.73%) |
| Corporate capture | 1,557 (51.9%) |
| Average / median months | 21.64 / 21 |
| Longest campaign | 59 months |
| Cards presented / resolved per run | 11.91 / 8.84 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Second checkpoint in a fixed-seed 1k/3k/5k convergence comparison; no balance values changed.

## 2026-07-19T03:02:43.804Z — Sample-size comparison — 5,000 runs

- Runs: **5,000**
- Seed: `20260715`
- Source: `085b103` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 74 (1.48%) |
| Civic Legacy | 6 |
| State collapse | 2,338 (46.76%) |
| Corporate capture | 2,588 (51.76%) |
| Average / median months | 21.61 / 21 |
| Longest campaign | 59 months |
| Cards presented / resolved per run | 11.86 / 8.8 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Final checkpoint in a fixed-seed 1k/3k/5k convergence comparison; no balance values changed.
## 2026-07-19T20:23:53.892Z — Stress collapse threshold human-playtest follow-up

- Runs: **3,000**
- Seed: `20260715`
- Source: `6e57fc8` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 2 (0.07%) |
| Civic Legacy | 1 |
| State collapse | 2,992 (99.73%) |
| Corporate capture | 6 (0.2%) |
| Average / median months | 14.3 / 14 |
| Longest campaign | 26 months |
| Cards presented / resolved per run | 7.9 / 6 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Tested only a terminal Stress threshold after human-playtest feedback. The resulting 99.73% State Collapse rate was rejected, and the nonterminal Stress rule was restored without changing another balance value.
## 2026-07-19T21:12:52.185Z — Loyalty departure experiment

- Runs: **3,000**
- Seed: `20260715`
- Source: `6e57fc8` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 44 (1.47%) |
| Civic Legacy | 3 |
| State collapse | 1,425 (47.5%) |
| Corporate capture | 1,531 (51.03%) |
| Average / median months | 21.03 / 20 |
| Longest campaign | 56 months |
| Cards presented / resolved per run | 11.59 / 7.98 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Changed only advisor reactions and departure: approved commitments give +4 Alignment/+1 Loyalty; disapproved commitments give -2 Alignment/-2 Loyalty; departure uses Loyalty below the existing threshold or Leverage at 90. Stress remains nonterminal; no compensating balance value changed.

## 2026-07-19T21:15:30.767Z — Logic trustworthiness integrated checkpoint

- Runs: **5,000**
- Seed: `20260715`
- Source: `6e57fc8` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 70 (1.4%) |
| Civic Legacy | 6 |
| State collapse | 2,379 (47.58%) |
| Corporate capture | 2,551 (51.02%) |
| Average / median months | 20.99 / 20 |
| Longest campaign | 56 months |
| Cards presented / resolved per run | 11.49 / 7.93 |
| Over 5 / 10 years | 0 / 0 |

### Notes

> Integrated checkpoint after mandatory card affordability, independent Corporation jitter, Loyalty and memory forecast effects, and deterministic downstream doctrine rules. This establishes reachability and tempo under the accepted mechanics; it is not final balance approval.
## 2026-07-23T05:41:47.448Z — Activation reachability cadence experiment

- Runs: **5,000**
- Seed: `20260715`
- Source: `332c0e0` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 417 (8.34%) |
| Civic Legacy | 41 |
| State collapse | 2,019 (40.38%) |
| Corporate capture | 2,564 (51.28%) |
| Average / median months | 22.78 / 22 |
| Longest campaign | 55 months |
| Cards presented / resolved per run | 12.49 / 8.54 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,351 |
| Activation attempts | 417 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 417 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,649 |
| panic_before_activation | 342 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 592 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 60 |
| rush | 417 | 36 |
| defensive | 417 | 27 |
| fixer | 417 | 8 |
| institutionalist | 417 | 53 |
| command | 417 | 26 |
| coalition | 417 | 17 |
| engineering_first | 417 | 28 |
| legitimacy_first | 416 | 57 |
| stability_first | 416 | 43 |
| access_first | 416 | 29 |
| delayed_deposit | 416 | 33 |

### Notes

> Changed only the base Corporation response cadence from Quiet/Watched/Contested/Severe/Critical 4/3/2/1/1 to 5/4/3/2/1. Deposit costs and progress, recovery, starting resources, cards, activation requirements, direct completion-pressure surcharges, loss thresholds, and bot decisions are unchanged. Evaluation target: 8-12% completed activations, with all-track readiness more common than activation and both loss modes remaining credible.

## 2026-07-23T05:42:29.266Z — Activation reachability alternate-seed audit

- Runs: **5,000**
- Seed: `20260716`
- Source: `332c0e0` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 401 (8.02%) |
| Civic Legacy | 39 |
| State collapse | 2,038 (40.76%) |
| Corporate capture | 2,561 (51.22%) |
| Average / median months | 22.77 / 22 |
| Longest campaign | 57 months |
| Cards presented / resolved per run | 12.44 / 8.5 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,386 |
| Activation attempts | 401 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 401 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,614 |
| panic_before_activation | 385 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 600 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 53 |
| rush | 417 | 31 |
| defensive | 417 | 27 |
| fixer | 417 | 11 |
| institutionalist | 417 | 51 |
| command | 417 | 9 |
| coalition | 417 | 22 |
| engineering_first | 417 | 38 |
| legitimacy_first | 416 | 64 |
| stability_first | 416 | 40 |
| access_first | 416 | 35 |
| delayed_deposit | 416 | 20 |

### Notes

> Robustness check for the isolated 5/4/3/2/1 base Corporation response cadence using alternate seed 20260716. No gameplay values changed after the 20260715 experiment. Acceptance requires activation to remain near the 8-12% evaluation band, all-track readiness to exceed activation, both loss modes to remain credible, and no single normal strategy to own the result.
