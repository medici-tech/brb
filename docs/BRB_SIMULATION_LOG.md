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
## 2026-07-23T05:55:58.317Z — Requested 3,000-run baseline

- Runs: **3,000**
- Seed: `20260715`
- Source: `ed6c65a` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 249 (8.3%) |
| Civic Legacy | 26 |
| State collapse | 1,202 (40.07%) |
| Corporate capture | 1,549 (51.63%) |
| Average / median months | 22.83 / 22 |
| Longest campaign | 55 months |
| Cards presented / resolved per run | 12.58 / 8.61 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 793 |
| Activation attempts | 249 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 249 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,207 |
| panic_before_activation | 199 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 345 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 37 |
| rush | 250 | 26 |
| defensive | 250 | 17 |
| fixer | 250 | 4 |
| institutionalist | 250 | 35 |
| command | 250 | 16 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 18 |
| access_first | 250 | 16 |
| delayed_deposit | 250 | 16 |

### Notes

> User-requested current-state baseline; no balance values changed.

## 2026-07-23T06:05:09.659Z — Fixer consultation policy experiment

- Runs: **3,000**
- Seed: `20260715`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 266 (8.87%) |
| Civic Legacy | 26 |
| State collapse | 1,211 (40.37%) |
| Corporate capture | 1,523 (50.77%) |
| Average / median months | 22.67 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.51 / 8.58 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 860 |
| Activation attempts | 266 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 266 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,140 |
| panic_before_activation | 206 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 388 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 37 |
| rush | 250 | 26 |
| defensive | 250 | 17 |
| fixer | 250 | 21 |
| institutionalist | 250 | 35 |
| command | 250 | 16 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 18 |
| access_first | 250 | 16 |
| delayed_deposit | 250 | 16 |

### Notes

> Changed only the Fixer bot consultation policy: consult for immediate containment or an affordable counter at 70+ Corporation Progress with leverage at or below 45. No gameplay values changed. Testing whether the prior 1.6% mixed-baseline Fixer activation rate was caused by routine over-consultation and repeated advisor management.

## 2026-07-23T08:59:04.800Z — Post-Fixer policy confirmation rerun

- Runs: **3,000**
- Seed: `20260715`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 266 (8.87%) |
| Civic Legacy | 26 |
| State collapse | 1,211 (40.37%) |
| Corporate capture | 1,523 (50.77%) |
| Average / median months | 22.67 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.51 / 8.58 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 860 |
| Activation attempts | 266 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 266 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,140 |
| panic_before_activation | 206 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 388 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 37 |
| rush | 250 | 26 |
| defensive | 250 | 17 |
| fixer | 250 | 21 |
| institutionalist | 250 | 35 |
| command | 250 | 16 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 18 |
| access_first | 250 | 16 |
| delayed_deposit | 250 | 16 |

### Notes

> Confirmation rerun after the Fixer immediate-value consultation policy change; no additional code or balance values changed.

## 2026-07-23T09:01:42.598Z — Five-seed robustness 1/5

- Runs: **3,000**
- Seed: `20260715`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 266 (8.87%) |
| Civic Legacy | 26 |
| State collapse | 1,211 (40.37%) |
| Corporate capture | 1,523 (50.77%) |
| Average / median months | 22.67 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.51 / 8.58 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 860 |
| Activation attempts | 266 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 266 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,140 |
| panic_before_activation | 206 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 388 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 37 |
| rush | 250 | 26 |
| defensive | 250 | 17 |
| fixer | 250 | 21 |
| institutionalist | 250 | 35 |
| command | 250 | 16 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 18 |
| access_first | 250 | 16 |
| delayed_deposit | 250 | 16 |

### Notes

> Block 1 of a user-requested five-seed robustness audit after the Fixer consultation policy correction. No code or balance values changed.

## 2026-07-23T09:02:02.525Z — Five-seed robustness 2/5

- Runs: **3,000**
- Seed: `20260716`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 265 (8.83%) |
| Civic Legacy | 21 |
| State collapse | 1,233 (41.1%) |
| Corporate capture | 1,502 (50.07%) |
| Average / median months | 22.65 / 22 |
| Longest campaign | 53 months |
| Cards presented / resolved per run | 12.38 / 8.46 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 926 |
| Activation attempts | 265 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 265 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,074 |
| panic_before_activation | 256 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 405 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 30 |
| rush | 250 | 19 |
| defensive | 250 | 16 |
| fixer | 250 | 27 |
| institutionalist | 250 | 33 |
| command | 250 | 5 |
| coalition | 250 | 14 |
| engineering_first | 250 | 22 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 30 |
| access_first | 250 | 19 |
| delayed_deposit | 250 | 13 |

### Notes

> Block 2 of a user-requested five-seed robustness audit after the Fixer consultation policy correction. No code or balance values changed.

## 2026-07-23T09:02:21.394Z — Five-seed robustness 3/5

- Runs: **3,000**
- Seed: `20260717`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 296 (9.87%) |
| Civic Legacy | 25 |
| State collapse | 1,241 (41.37%) |
| Corporate capture | 1,463 (48.77%) |
| Average / median months | 22.68 / 22 |
| Longest campaign | 57 months |
| Cards presented / resolved per run | 12.48 / 8.56 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 883 |
| Activation attempts | 296 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 296 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,117 |
| panic_before_activation | 222 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 365 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 24 |
| rush | 250 | 20 |
| defensive | 250 | 18 |
| fixer | 250 | 41 |
| institutionalist | 250 | 38 |
| command | 250 | 15 |
| coalition | 250 | 14 |
| engineering_first | 250 | 26 |
| legitimacy_first | 250 | 37 |
| stability_first | 250 | 30 |
| access_first | 250 | 18 |
| delayed_deposit | 250 | 15 |

### Notes

> Block 3 of a user-requested five-seed robustness audit after the Fixer consultation policy correction. No code or balance values changed.

## 2026-07-23T09:02:50.385Z — Five-seed robustness 4/5

- Runs: **3,000**
- Seed: `20260718`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 289 (9.63%) |
| Civic Legacy | 22 |
| State collapse | 1,192 (39.73%) |
| Corporate capture | 1,519 (50.63%) |
| Average / median months | 22.66 / 22 |
| Longest campaign | 53 months |
| Cards presented / resolved per run | 12.36 / 8.47 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 932 |
| Activation attempts | 289 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 289 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,068 |
| panic_before_activation | 220 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 423 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 32 |
| rush | 250 | 26 |
| defensive | 250 | 13 |
| fixer | 250 | 35 |
| institutionalist | 250 | 32 |
| command | 250 | 12 |
| coalition | 250 | 5 |
| engineering_first | 250 | 22 |
| legitimacy_first | 250 | 42 |
| stability_first | 250 | 28 |
| access_first | 250 | 17 |
| delayed_deposit | 250 | 25 |

### Notes

> Block 4 of a user-requested five-seed robustness audit after the Fixer consultation policy correction. No code or balance values changed.

## 2026-07-23T09:03:07.881Z — Five-seed robustness 5/5

- Runs: **3,000**
- Seed: `20260719`
- Source: `921a9c4` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 307 (10.23%) |
| Civic Legacy | 25 |
| State collapse | 1,198 (39.93%) |
| Corporate capture | 1,495 (49.83%) |
| Average / median months | 22.46 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.24 / 8.37 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 974 |
| Activation attempts | 307 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 307 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,026 |
| panic_before_activation | 246 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 421 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 36 |
| rush | 250 | 28 |
| defensive | 250 | 13 |
| fixer | 250 | 31 |
| institutionalist | 250 | 36 |
| command | 250 | 11 |
| coalition | 250 | 12 |
| engineering_first | 250 | 26 |
| legitimacy_first | 250 | 48 |
| stability_first | 250 | 30 |
| access_first | 250 | 25 |
| delayed_deposit | 250 | 11 |

### Notes

> Block 5 of a user-requested five-seed robustness audit after the Fixer consultation policy correction. No code or balance values changed.
