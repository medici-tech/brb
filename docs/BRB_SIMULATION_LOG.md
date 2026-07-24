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
## 2026-07-23T22:44:58.686Z — Legacy Directive baseline

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `none`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 453 (9.06%) |
| Civic Legacy | 41 |
| State collapse | 2,026 (40.52%) |
| Corporate capture | 2,521 (50.42%) |
| Average / median months | 22.64 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.42 / 8.51 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,464 |
| Activation attempts | 453 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 453 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,536 |
| panic_before_activation | 351 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 660 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 60 |
| rush | 417 | 36 |
| defensive | 417 | 27 |
| fixer | 417 | 44 |
| institutionalist | 417 | 53 |
| command | 417 | 26 |
| coalition | 417 | 17 |
| engineering_first | 417 | 28 |
| legitimacy_first | 416 | 57 |
| stability_first | 416 | 43 |
| access_first | 416 | 29 |
| delayed_deposit | 416 | 33 |

### Notes

> No Legacy Directive equipped. Fixed-seed comparison baseline for the six isolated Directive experiments.

## 2026-07-23T22:46:11.190Z — Legacy Directive: Emergency Appropriation

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `emergency_appropriation`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 569 (11.38%) |
| Civic Legacy | 69 |
| State collapse | 1,958 (39.16%) |
| Corporate capture | 2,473 (49.46%) |
| Average / median months | 22.53 / 22 |
| Longest campaign | 59 months |
| Cards presented / resolved per run | 12.36 / 8.48 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,645 |
| Activation attempts | 569 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 569 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,355 |
| panic_before_activation | 381 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 695 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 70 |
| rush | 417 | 39 |
| defensive | 417 | 35 |
| fixer | 417 | 44 |
| institutionalist | 417 | 89 |
| command | 417 | 26 |
| coalition | 417 | 29 |
| engineering_first | 417 | 49 |
| legitimacy_first | 416 | 75 |
| stability_first | 416 | 48 |
| access_first | 416 | 28 |
| delayed_deposit | 416 | 37 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:47:28.571Z — Legacy Directive: Coalition Whip

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `coalition_whip`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 606 (12.12%) |
| Civic Legacy | 34 |
| State collapse | 1,957 (39.14%) |
| Corporate capture | 2,437 (48.74%) |
| Average / median months | 22.12 / 22 |
| Longest campaign | 53 months |
| Cards presented / resolved per run | 12.15 / 8.4 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,735 |
| Activation attempts | 606 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 606 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,265 |
| panic_before_activation | 372 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 757 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 90 |
| rush | 417 | 63 |
| defensive | 417 | 39 |
| fixer | 417 | 71 |
| institutionalist | 417 | 45 |
| command | 417 | 22 |
| coalition | 417 | 22 |
| engineering_first | 417 | 30 |
| legitimacy_first | 416 | 77 |
| stability_first | 416 | 54 |
| access_first | 416 | 57 |
| delayed_deposit | 416 | 36 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:50:22.208Z — Legacy Directive: Protected Channel

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `protected_channel`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 494 (9.88%) |
| Civic Legacy | 36 |
| State collapse | 2,066 (41.32%) |
| Corporate capture | 2,440 (48.8%) |
| Average / median months | 21.97 / 21 |
| Longest campaign | 55 months |
| Cards presented / resolved per run | 12.04 / 8.32 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,447 |
| Activation attempts | 494 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 494 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,553 |
| panic_before_activation | 338 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 615 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 72 |
| rush | 417 | 49 |
| defensive | 417 | 33 |
| fixer | 417 | 67 |
| institutionalist | 417 | 57 |
| command | 417 | 16 |
| coalition | 417 | 18 |
| engineering_first | 417 | 41 |
| legitimacy_first | 416 | 38 |
| stability_first | 416 | 53 |
| access_first | 416 | 22 |
| delayed_deposit | 416 | 28 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:51:36.038Z — Legacy Directive: Public Confidence Reserve

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `public_confidence_reserve`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 450 (9%) |
| Civic Legacy | 32 |
| State collapse | 1,905 (38.1%) |
| Corporate capture | 2,645 (52.9%) |
| Average / median months | 22.48 / 22 |
| Longest campaign | 54 months |
| Cards presented / resolved per run | 12.32 / 8.46 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,468 |
| Activation attempts | 450 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 450 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,532 |
| panic_before_activation | 343 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 675 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 48 |
| rush | 417 | 34 |
| defensive | 417 | 19 |
| fixer | 417 | 44 |
| institutionalist | 417 | 54 |
| command | 417 | 27 |
| coalition | 417 | 19 |
| engineering_first | 417 | 23 |
| legitimacy_first | 416 | 75 |
| stability_first | 416 | 35 |
| access_first | 416 | 35 |
| delayed_deposit | 416 | 37 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:52:42.344Z — Legacy Directive: Industrial Surge

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `industrial_surge`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 604 (12.08%) |
| Civic Legacy | 37 |
| State collapse | 1,948 (38.96%) |
| Corporate capture | 2,448 (48.96%) |
| Average / median months | 22.14 / 21 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.15 / 8.35 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,683 |
| Activation attempts | 604 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 604 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,317 |
| panic_before_activation | 395 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 684 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 73 |
| rush | 417 | 46 |
| defensive | 417 | 47 |
| fixer | 417 | 86 |
| institutionalist | 417 | 52 |
| command | 417 | 23 |
| coalition | 417 | 27 |
| engineering_first | 417 | 42 |
| legitimacy_first | 416 | 71 |
| stability_first | 416 | 52 |
| access_first | 416 | 46 |
| delayed_deposit | 416 | 39 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:53:45.098Z — Legacy Directive: Continuity Freeze Order

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `continuity_freeze_order`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 389 (7.78%) |
| Civic Legacy | 16 |
| State collapse | 2,253 (45.06%) |
| Corporate capture | 2,358 (47.16%) |
| Average / median months | 22.27 / 22 |
| Longest campaign | 49 months |
| Cards presented / resolved per run | 12.24 / 8.39 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,368 |
| Activation attempts | 389 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 389 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,632 |
| panic_before_activation | 380 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 599 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 58 |
| rush | 417 | 30 |
| defensive | 417 | 24 |
| fixer | 417 | 41 |
| institutionalist | 417 | 23 |
| command | 417 | 21 |
| coalition | 417 | 14 |
| engineering_first | 417 | 27 |
| legitimacy_first | 416 | 53 |
| stability_first | 416 | 39 |
| access_first | 416 | 29 |
| delayed_deposit | 416 | 30 |

### Notes

> Changed only the equipped Directive. Bots use it once on their first non-activation commitment; comparing activation and archetype outcomes with the no-Directive baseline.

## 2026-07-23T22:57:06.611Z — Legacy Directive retune: Coalition Whip +8

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `coalition_whip`
- Source: `905d935` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 586 (11.72%) |
| Civic Legacy | 27 |
| State collapse | 1,999 (39.98%) |
| Corporate capture | 2,415 (48.3%) |
| Average / median months | 22.1 / 21 |
| Longest campaign | 48 months |
| Cards presented / resolved per run | 12.15 / 8.36 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,678 |
| Activation attempts | 586 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 586 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,322 |
| panic_before_activation | 384 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 708 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 81 |
| rush | 417 | 55 |
| defensive | 417 | 39 |
| fixer | 417 | 70 |
| institutionalist | 417 | 41 |
| command | 417 | 21 |
| coalition | 417 | 26 |
| engineering_first | 417 | 36 |
| legitimacy_first | 416 | 78 |
| stability_first | 416 | 58 |
| access_first | 416 | 44 |
| delayed_deposit | 416 | 37 |

### Notes

> Retuned only Coalition Whip Influence from +10 to +8 after the +10 version reached 12.12% activation, above the 12% ceiling. Panic +5 and every other rule are unchanged.

## 2026-07-23T22:58:22.955Z — Legacy Directive retune: Industrial Surge +8

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `industrial_surge`
- Source: `c7de2fa` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 590 (11.8%) |
| Civic Legacy | 42 |
| State collapse | 1,962 (39.24%) |
| Corporate capture | 2,448 (48.96%) |
| Average / median months | 22.28 / 22 |
| Longest campaign | 50 months |
| Cards presented / resolved per run | 12.22 / 8.38 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,687 |
| Activation attempts | 590 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 590 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,313 |
| panic_before_activation | 414 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 683 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 68 |
| rush | 417 | 47 |
| defensive | 417 | 41 |
| fixer | 417 | 76 |
| institutionalist | 417 | 60 |
| command | 417 | 23 |
| coalition | 417 | 25 |
| engineering_first | 417 | 41 |
| legitimacy_first | 416 | 73 |
| stability_first | 416 | 56 |
| access_first | 416 | 45 |
| delayed_deposit | 416 | 35 |

### Notes

> Retuned only Industrial Surge Capacity from +10 to +8 after the +10 version reached 12.08% activation, above the 12% ceiling. Institutions -5 and every other rule are unchanged.

## 2026-07-23T22:59:30.027Z — Legacy Directive corrected usage: Continuity Freeze Order

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `continuity_freeze_order`
- Source: `c7de2fa` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 489 (9.78%) |
| Civic Legacy | 20 |
| State collapse | 2,217 (44.34%) |
| Corporate capture | 2,294 (45.88%) |
| Average / median months | 22.39 / 22 |
| Longest campaign | 52 months |
| Cards presented / resolved per run | 12.29 / 8.41 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,571 |
| Activation attempts | 489 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 489 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,429 |
| panic_before_activation | 420 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 662 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 74 |
| rush | 417 | 34 |
| defensive | 417 | 23 |
| fixer | 417 | 58 |
| institutionalist | 417 | 29 |
| command | 417 | 28 |
| coalition | 417 | 23 |
| engineering_first | 417 | 42 |
| legitimacy_first | 416 | 61 |
| stability_first | 416 | 52 |
| access_first | 416 | 36 |
| delayed_deposit | 416 | 29 |

### Notes

> Changed only the bot timing policy for this Directive: hold the Freeze Order until a Corporation response is due. Card effects remain response suppression, Institutions -10, and Panic +6.

## 2026-07-23T23:15:40.791Z — Post-rules-audit baseline

- Runs: **3,000**
- Seed: `20260715`
- Legacy Directive: `none`
- Source: `c7de2fa` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 255 (8.5%) |
| Civic Legacy | 25 |
| State collapse | 1,209 (40.3%) |
| Corporate capture | 1,536 (51.2%) |
| Average / median months | 22.87 / 22 |
| Longest campaign | 54 months |
| Cards presented / resolved per run | 12.61 / 8.85 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 795 |
| Activation attempts | 255 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 255 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,205 |
| panic_before_activation | 203 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 337 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 34 |
| rush | 250 | 22 |
| defensive | 250 | 19 |
| fixer | 250 | 20 |
| institutionalist | 250 | 35 |
| command | 250 | 17 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 34 |
| stability_first | 250 | 18 |
| access_first | 250 | 15 |
| delayed_deposit | 250 | 14 |

### Notes

> Rules/logic audit checkpoint. Fixed only sequential affordability after ignored Situation consequences and reconciled Legacy Directive documentation; no balance values or bot policies changed.

## 2026-07-23T23:18:04.869Z — Post-bot-audit no-Directive comparison

- Runs: **3,000**
- Seed: `20260715`
- Legacy Directive: `none`
- Source: `c7de2fa` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 255 (8.5%) |
| Civic Legacy | 25 |
| State collapse | 1,209 (40.3%) |
| Corporate capture | 1,536 (51.2%) |
| Average / median months | 22.87 / 22 |
| Longest campaign | 54 months |
| Cards presented / resolved per run | 12.61 / 8.85 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 795 |
| Activation attempts | 255 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 255 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 2,205 |
| panic_before_activation | 203 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 337 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 250 | 34 |
| rush | 250 | 22 |
| defensive | 250 | 19 |
| fixer | 250 | 20 |
| institutionalist | 250 | 35 |
| command | 250 | 17 |
| coalition | 250 | 10 |
| engineering_first | 250 | 17 |
| legitimacy_first | 250 | 34 |
| stability_first | 250 | 18 |
| access_first | 250 | 15 |
| delayed_deposit | 250 | 14 |

### Notes

> Same seed block and no-Directive loadout as the post-rules-audit baseline. Bot candidate validation now accounts for an intended equipped Directive; no no-Directive policy values or gameplay balance levers changed.

## 2026-07-23T23:30:46.039Z — Corrected Directive-aware baseline

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `none`
- Source: `5afd35ba3` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 428 (8.56%) |
| Civic Legacy | 38 |
| State collapse | 2,039 (40.78%) |
| Corporate capture | 2,533 (50.66%) |
| Average / median months | 22.83 / 22 |
| Longest campaign | 54 months |
| Cards presented / resolved per run | 12.52 / 8.77 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,368 |
| Activation attempts | 428 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 428 |
| activation_corporate_capture | 0 |
| tracks_never_ready | 3,632 |
| panic_before_activation | 349 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 591 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 55 |
| rush | 417 | 31 |
| defensive | 417 | 29 |
| fixer | 417 | 41 |
| institutionalist | 417 | 52 |
| command | 417 | 27 |
| coalition | 417 | 17 |
| engineering_first | 417 | 25 |
| legitimacy_first | 416 | 52 |
| stability_first | 416 | 42 |
| access_first | 416 | 25 |
| delayed_deposit | 416 | 32 |

### Notes

> No Legacy Directive equipped. Fresh isolated baseline after ignored-Situation sequential affordability and Directive-aware bot candidate validation; individual 250-run strategy rates are diagnostic only.

## 2026-07-23T23:31:19.868Z — Emergency Appropriation corrected comparison

- Runs: **5,000**
- Seed: `20260715`
- Legacy Directive: `emergency_appropriation`
- Source: `5afd35ba3` with uncommitted changes

| Outcome | Result |
| --- | ---: |
| Activations | 524 (10.48%) |
| Civic Legacy | 65 |
| State collapse | 1,971 (39.42%) |
| Corporate capture | 2,505 (50.1%) |
| Average / median months | 22.72 / 22 |
| Longest campaign | 59 months |
| Cards presented / resolved per run | 12.45 / 8.74 |
| Over 5 / 10 years | 0 / 0 |
| All tracks ready | 1,531 |
| Activation attempts | 526 |

### Activation funnel

| Result | Runs |
| --- | ---: |
| activated | 524 |
| activation_corporate_capture | 2 |
| tracks_never_ready | 3,469 |
| panic_before_activation | 363 |
| institutions_before_activation | 0 |
| advisors_before_activation | 0 |
| corporation_capture_before_activation | 642 |
| corporation_unsafe_before_activation | 0 |
| strategy_delayed_after_readiness | 0 |

### Activations by strategy

| Strategy | Runs | Activations |
| --- | ---: | ---: |
| balanced | 417 | 63 |
| rush | 417 | 35 |
| defensive | 417 | 32 |
| fixer | 417 | 40 |
| institutionalist | 417 | 83 |
| command | 417 | 27 |
| coalition | 417 | 29 |
| engineering_first | 417 | 43 |
| legitimacy_first | 416 | 68 |
| stability_first | 416 | 47 |
| access_first | 416 | 22 |
| delayed_deposit | 416 | 35 |

### Notes

> Changed only the equipped Legacy Directive against the corrected no-Directive baseline. Directive-aware bot candidate validation is active; individual 250-run strategy rates are diagnostic only.

