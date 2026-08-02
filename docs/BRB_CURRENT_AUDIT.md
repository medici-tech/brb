# BRB Current-State Audit

**Audit date:** 2026-07-21

**Audited state:** Current working tree after the lean open-source tooling integration; unrelated in-progress changes remain uncommitted.

## Executive assessment

BRB remains correctly classified as **Phase 2: Balance prototype — in progress**. The rules, replay, storage, reporting, simulator, and browser presentation share a strong deterministic foundation. The former offline-build risk is resolved: the existing fonts are self-hosted, their licenses are recorded, and the static export succeeds with network access denied.

The highest-value work is still evidence, not feature breadth. The current rules are reachable and mechanically testable, but the low activation rate, rare Civic Legacy outcome, strategy differences, and defensive-style discoverability have not received an explicit Phase 2 accept-or-change decision.

## Verified quality gate

- `npm test`: 141 passing Vitest tests across 13 files.
- `npm run typecheck`: strict TypeScript validation passes.
- `npm run test:browser`: 13 passing Chromium tests across desktop and 390-pixel narrow projects; one desktop skip is intentional because the assertion is narrow-only.
- The browser suite covers Start → Campaign, consultation, commitment confirmation, attributed consequence, save/resume, Report, same-seed replay, Archive, keyboard navigation, narrow overflow, reduced motion, and axe scans of the requested surfaces.
- `npm run build` succeeds inside a macOS sandbox that denies all network access.
- The static output contains the 13 selected local WOFF2 files and no Google Fonts URLs.
- Desktop and narrow screenshots were reviewed without adding committed visual baselines.

This is an automated delivery gate, not a balance or external-human-playtest sign-off.

## What is solid

### Product and rules architecture

- `src/game` remains pure TypeScript. A source scan found no React, Next.js, DOM, browser-storage, `Math.random`, `Date.now`, or cryptographic-random imports inside the simulation layer.
- The browser tests create deterministic saves through the real engine and versioned serializer. No production-only routes, hidden controls, or second state model were added.
- Replay reports, route provenance, Archive merging, bots, simulation, browser play, and tests continue to use the same rules.
- No TODO, FIXME, TypeScript suppression, or explicit `any` marker was found in the current source scan.

### Lean resource adoption

- Playwright and `@axe-core/playwright` are development-only dependencies. Chromium is the only installed browser target.
- IBM Plex Sans, IBM Plex Mono, and Barlow Condensed are limited to the upright Latin weights already used by the interface.
- Font provenance and OFL 1.1 licenses are recorded in [Third-Party Assets](THIRD_PARTY_ASSETS.md).
- Kenney UI Audio remains deferred to Phase 3; no sound pack or audio library was added.

## Technical-debt findings

### P0 — No ship-stopping defect identified

The audit found no deterministic rule failure, save corruption, invalid route completion, production build failure, or browser-flow blocker.

### P1 — Phase 2 evidence is not yet decision-complete

The latest implemented-rule checkpoint records 1.47% activation and 0.10% Civic Legacy over 3,000 normal-strategy runs. These values establish reachability but do not answer whether the difficulty is intentional or whether one balance lever should change. There is also no completed guided-playtest export and synthesis stored in the repository. This is the main project risk because additional polish could hide an unresolved strategy problem.

### P1 — Monitor the nested Next.js/PostCSS advisory

`npm audit` reports two moderate entries for one underlying PostCSS advisory: a vulnerable PostCSS version nested inside the installed Next.js package and Next.js as the affected direct dependency. The top-level PostCSS dependency is newer, so updating it alone does not remove the nested copy. npm currently proposes an inappropriate Next.js downgrade rather than a safe forward fix. Do not force that change; monitor a compatible Next.js release and re-run the full build/browser gate when one is available.

### P2 — Simulation smoke checks still mutate evidence

`npm run simulate` always appends to `docs/BRB_SIMULATION_LOG.md`. This is correct for accepted experiments but awkward for profiling, audits, and quick smoke checks. A future small improvement could add `--no-log` while keeping logging the default. It is not required before the next guided runs.

### P2 — Complexity is concentrated in a few authority files

The largest current files are `src/game/engine.ts` (~808 lines), `src/game/types.ts` (~635), `src/game/content.ts` (~592), `src/game/validation.ts` (~405), and the facility presentation component (~336). The former monolithic control-room CSS modules were replaced by the orthographic `PixelRoom` pipeline; do not restore layered perspective room CSS. Size alone is not a defect: these files own real domains and their tests are green. Avoid a broad Phase 2 refactor. Extract only when one balance or rules change repeatedly touches unrelated concerns in the same file.

### P2 — The pure-engine boundary is convention-enforced

The boundary is currently clean, but there is no dedicated mechanical test rejecting React, Next.js, or browser imports under `src/game`. The existing Vitest stack could add a small boundary test if contributors begin crossing it. A new dependency such as dependency-cruiser is not justified.

### P3 — Exported-artifact and cross-browser testing remain release work

Playwright currently exercises the Next.js development server, while the production export is verified separately by the offline build. Serving and smoke-testing `out/`, adding Firefox/WebKit, or adding PWA checks should wait until the Phase 4 packaging target makes them concrete requirements.

### P3 — Routine dependency drift is visible but not urgent

`npm outdated` reports several patch updates plus major releases of Vitest, Testing Library, TypeScript, and Node types. None is required for the current prototype gate. Avoid a batch migration during balance work; take compatible patches in a focused maintenance change and evaluate majors only after Phase 2 or when a security fix requires them.

## Recommended order of work

1. Complete or import the first three natural guided runs and their five-commitment same-seed replay samples. Write a preliminary cross-run synthesis before tuning.
2. Complete targeted runs 4–6 and write the final guided-playtest synthesis, including defensive-style discoverability and advisor tension.
3. Use one documented alternate seed block to check whether archetype, strategy, activation, duration, and card-tempo findings survive beyond the fixed `20260715` prefix.
4. Decide whether the current low activation rate is intended. If not, test one balance lever only; do not bundle a defensive-economy, card, and Corporation change.
5. Run the proportionate 3,000- or 5,000-run comparison and record accept/reject evidence in the existing balance documents and automatic simulation log.
6. Defer large-file refactors, dependency expansion, audio, PWA work, and exported-artifact browser testing until their owning phase.

## Exit recommendation

**Remain in Phase 2.** The engineering gate is stronger and the former font-delivery risk is closed. Phase 2 now needs a small amount of disciplined human and alternate-seed evidence, followed by one explicit balance decision—not more systems.
