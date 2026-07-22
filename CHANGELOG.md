# Changelog

All notable changes to BRB are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
BRB is still a prototype, so changes remain under **Unreleased** until a release is cut.

## [Unreleased]

### Added

- Deterministic downstream effects for relationship memories and system modifiers.
- Mandatory Situation choice costs with affordability checks.
- Versioned Declassified Reports with final-state snapshots and safe legacy loading.
- Runtime validation for saved campaigns, reports, replay intent, and Archive data.
- A turn-transition explanation that attributes the latest consequences to their causes.
- Deterministic Chromium coverage for the campaign, reports, replay, Archive, keyboard use,
  narrow layouts, reduced motion, and automated accessibility scans.
- Self-hosted IBM Plex Sans, IBM Plex Mono, and Barlow Condensed fonts with OFL licenses.

### Changed

- Advisor departure now follows visible Loyalty thresholds; Alignment continues to affect
  ordinary consultation accuracy.
- Campaign commitments and reports expose clearer costs, known changes, ending reasons,
  advisor thresholds, and next-run experiments.
- The production export loads its existing font families locally and no longer depends on
  Google Fonts during a build.

### Fixed

- Situation choices cannot resolve when their mandatory resource costs are unaffordable.
- Corporation strategy tie-breaking consumes independent seeded random values.
- Invalid nested persisted data fails closed instead of being trusted after a shallow cast.
- Low-contrast text and keyboard access for horizontally scrollable mobile status strips.

### Security

- Persisted browser data receives strict runtime validation before it can affect a run.

### Internal

- Playwright and axe-core are development-only dependencies and do not ship in the game bundle.
- Simulation experiment results remain in `docs/BRB_SIMULATION_LOG.md`; routine refactors and
  test-only work belong here only when they affect players, compatibility, or delivery safety.

## Changelog policy

- Every feature or fix pull request updates **Unreleased** when it changes player-visible
  behavior, saved-data compatibility, security, or release/build requirements.
- Refactors, file moves, formatting, and test maintenance are omitted unless they change one
  of those contracts.
- Balance experiments keep their detailed hypothesis and results in the simulation log and
  balance targets. The changelog records only an accepted player-visible rule change.
- When a release is cut, move the relevant entries into a dated version section and start a
  fresh **Unreleased** section.
