# BRB Current-State Audit

**Audit date:** 2026-07-18
**Audited revision:** `0b00ae1` (`feat: add living control room presentation`)

## Executive assessment

BRB has a coherent, unusually well-documented logic and replay prototype. The pure TypeScript engine, seeded replay model, browser persistence, automated strategies, simulator, playtest journal, and static Next.js interface are all represented in code and targeted tests. The project is correctly described as **Phase 2: Balance prototype — in progress** rather than as a human-playtest-ready build.

The highest-value next step is not adding more surface area. It is closing the evidence gap around balance and human comprehension while preserving the now-green automated gates. The remaining release-engineering risk is that the production build uses Google-hosted fonts and is not yet proven reproducible without network access or a warm cache.

## What is solid

### Product and rules architecture

- The game rules remain separated from React under `src/game`, with deterministic state transitions, seeded randomness, replay reporting, route provenance, storage adapters, bots, and simulation reporting.
- The implemented scope matches the design documents: 15 Situation Cards, three archetypes, advisor consultation, Corporation responses, two replay routes, multiple ending families, and knowledge-only Archive persistence.
- UI responsibilities are separated into campaign, report, Archive, playtest-journal, and control-room presentation components rather than concentrated in the route entry point.

### Validation assets

- The repository contains 108 passing Vitest tests across 13 files covering the engine, replay, simulator, storage, guidance, playtest journal, scripts, and interface.
- TypeScript validation passes with `tsc --noEmit`.
- The static Next.js production build completes and exports all application routes.
- The documentation clearly distinguishes completed Phase 1/1.5 architecture from unresolved Phase 2 balance questions and preserves historical baselines instead of overwriting them.
- The guided six-run playtest matrix and local journal provide a concrete bridge from automated evidence to qualitative human evidence.

## Findings and risks

### P0 — No ship-stopping rules defect identified

This audit did not uncover evidence of a deterministic rules failure, corrupt persistence path, or invalid route completion. `npm test`, `npm run typecheck`, and `npm run build` all completed successfully during the final documentation review. This is a clean automated gate, not a human-playtest or release sign-off.

### P2 — Keep simulator-test runtime visible

An earlier audit run reported timeouts in two simulator-heavy cases. The final review did not reproduce them:

- `exercises neglected systems and preserves Corporate Exposure choice tension`
- `keeps the long-horizon diagnostic out of normal runs and proves five-year reachability`

Both completed under Vitest's five-second per-test default, and the complete 108-test suite passed. These cases still perform hundreds of campaigns, so future slowdowns should be investigated rather than hidden with an arbitrary timeout increase.

### P1 — The static build is not proven offline

`npm run build` succeeds in the current environment, but `next/font/google` may retrieve Barlow Condensed, IBM Plex Mono, and IBM Plex Sans when they are not cached. A static export intended for itch.io should build reproducibly without a live third-party request. Vendor the font files and licenses, or deliberately adopt a checked-in/system-font stack, before calling the build release-ready.

### P1 — Phase 2 has automated evidence but not human validation

The current documented baseline shows roughly equal terminal collapse/capture outcomes, a low activation rate, a very low Civic Legacy rate, and strong strategy-dependent variation. Those are useful diagnostics, not proof that the game is learnable, fair, or satisfying. The existing guided playtest plan should now produce completed journal exports and a written synthesis before further broad feature work.

### P2 — Simulation logging is intentionally mutating

The simulation CLI always appends to `docs/BRB_SIMULATION_LOG.md`; there is no dry-run flag. That is appropriate for accepted experiments, but awkward for smoke checks and audits because merely running the documented command dirties the tree. Add an explicit `--no-log`/`--dry-run` path, or document a separate non-mutating smoke command.

### P2 — Phase 3 polish should wait on comprehension evidence

The control-room presentation is visually ambitious, and a basic first-three-month guide plus How to Play dialog already exist. Their comprehension and responsive behavior still need human validation; portraits, audio, activation presentation, and a feedback channel remain Phase 3 work. Before investing further, validate whether players can explain deposits, advisor tension, Corporation threat, consequence provenance, and their reason to replay.

## Recommended order of work

1. **Preserve green gates:** keep the simulator tests within their documented budget and make the static build independent of live font downloads.
2. **Run the six guided human sessions:** preserve exports, note confusion and decision rationale, and synthesize cross-run findings.
3. **Tune one variable at a time:** prioritize defensive-strategy discoverability, archetype parity, activation/premium-ending rates, card tempo, and late-game pressure.
4. **Re-run the 1,000–5,000 campaign evidence set:** record the seed, revision, hypothesis, and result in the existing simulation log.
5. **Only then enter Phase 3:** scope tutorial and feedback improvements from observed player failures rather than anticipated ones.

## Exit recommendation

**Remain in Phase 2.** The automated gates are green and the architecture is strong enough to support focused validation, but the project should not be labeled human-playtest-ready until the guided evidence has been collected or release-ready until the offline build risk is resolved.
