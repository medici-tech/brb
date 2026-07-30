# BRB Current-State Audit

**Audit date:** 2026-07-30

**Audited state:** `feat/art-integration` tip after Pass 3 animated pixel staff; working tree clean aside from this audit document.

**Scope:** Technical debt, delivery risk, and maintainability. Balance accept/reject decisions remain Phase 2 product work and are summarized only where they create engineering risk.

## Executive assessment

BRB remains correctly classified as **Phase 2: Balance prototype — in progress**. The pure simulation, replay, storage, reporting, simulator, and browser presentation still share one deterministic foundation. Since the 2026-07-21 audit, the engine was split into smaller authority modules, a mechanical import-boundary test landed, and the LimeZu pixel-art pipeline was wired with safe CSS fallbacks.

The highest-value work is still evidence, not feature breadth or large refactors. Guided-playtest journals and synthesis are still absent from the repository. The new art pipeline is intentionally incomplete for a public repo, but a configured-yet-stub deploy injector can silently ship placeholders. Parallel styling stacks (legacy campaign CSS, control-room modules, and the design-system/`brb/ui` layer) raise the cost of presentation changes.

## Verified quality gate

- `npm test`: **172** passing Vitest tests across **17** files.
- `npm run typecheck`: strict TypeScript validation passes.
- `npm run build`: static export succeeds; `prebuild` inject-art no-ops when `BRB_ART_SOURCE` is unset and no local curated art is present.
- `tests/game/import-boundary.test.ts` mechanically rejects React, Next.js, browser storage globals, `Math.random`, `Date.now`, and `crypto` under `src/game`.
- No TypeScript suppression (`@ts-ignore` / `@ts-expect-error`) or explicit `any` marker was found in `src/`.
- Browser Playwright suite exists (`tests/browser/`, Chromium desktop + 390px narrow) but was not re-run in this audit pass; treat its prior green status as something to reconfirm before a packaging gate.

This is an automated delivery snapshot, not a balance or external-human-playtest sign-off.

## What is solid

### Product and rules architecture

- `src/game` remains pure TypeScript for React/Next/DOM imports and non-deterministic globals (enforced by the import-boundary test).
- Replay reports, route provenance, Archive merging, bots, simulation, browser play, and tests continue to use the same rules.
- Content stays in typed definitions (`core-content.ts` for baseline economy/advisors/archetypes; `content.ts` for Situation Cards and routes) rather than JSX.
- Control-room presentation derives visuals through `presentationStateResolver.ts` and explicit thresholds; those thresholds do not mutate gameplay.
- Campaign composition remains split: `CampaignScreen.tsx` (~272 lines) delegates to focused subpanels rather than re-growing a monolith.

### Lean tooling and art fallback posture

- Playwright and axe remain development-only; Chromium is the only declared browser target.
- Fonts remain self-hosted; the static export does not require Google Fonts network access.
- Purchased LimeZu binaries stay gitignored. The app builds and runs without curated PNGs because `PixelSprite` falls back to CSS silhouettes.
- Kenney UI Audio remains deferred to Phase 3; no sound pack was added.

## Changes since 2026-07-21

| Prior claim | Current reality |
| --- | --- |
| 141 tests / 13 files | **172** / **17** |
| No import-boundary test | Boundary test exists and passes |
| No TODO/FIXME in source | Documented `TODO(art-pipeline)` in `scripts/inject-art.ts` |
| `engine.ts` 1,203 / control-room CSS 1,159 / `content.ts` 758 / `types.ts` 739 / `validation.ts` 546 | **787 / 1,079 / 592 / 613 / 374** after domain extractionsctions |
| Nested PostCSS “moderate / monitor only” | `npm audit` reports **3 high** findings (Next, nested PostCSS, sharp); Next **16.2.12** patch is available |
| Art pipeline absent | Manifest, curator, contact sheets, injector stub, and animated staff wiring are present |

## Technical-debt findings

### P0 — No ship-stopping defect identified

The audit found no deterministic rule failure, save corruption, invalid route completion, production build failure, or browser-flow blocker in the verified gate above.

### P1 — Phase 2 evidence is not yet decision-complete

Automated reachability for the accepted Corporation cadence is recorded, but the six-run guided matrix still has no completed journal export or cross-run synthesis in the repository. This remains the main project risk: presentation and art polish can outrun an unresolved fairness/replay question. Owner: product evidence, not a code refactor.

### P1 — Art injector fails open when configured

`scripts/inject-art.ts` correctly no-ops when `BRB_ART_SOURCE` is unset. When the env var **is** set, it logs a TODO and still exits 0 without copying or fetching assets. A deploy can believe art is configured while shipping CSS placeholders. Documented in [BRB Art Pipeline](BRB_ART_PIPELINE.md); implement the fetch/copy before any release that must show real pixel art.

### P1 — Three presentation stacks raise change cost

Live campaign chrome still relies on legacy classes in `src/app/globals.css` (~567 lines). The living control room uses a large CSS module (~1,079 lines). A parallel design-system / shadcn / `src/components/brb/ui` stack powers `/design-system` and a few dialogs, but `CampaignScreen` does not consume `brb/ui`. Visual work therefore spans three languages. Prefer extending the stack already owning a surface; do not migrate wholesale during Phase 2.

### P1 — Next.js forward patch available

Installed `next@16.2.10` nests `postcss@8.4.31`. Top-level `postcss@8.5.19` does not replace that nested copy. `npm outdated` reports a wanted `16.2.12`. Most listed advisories target Middleware, Server Actions, or image optimization; this app is a static export with `images.unoptimized`, so player-facing runtime exposure is low. Still prefer a focused forward bump over leaving the audit at “monitor indefinitely,” and re-run the full build/browser gate after upgrading.

### P2 — Art pipeline is partial and placeholder-geometry dependent

- Manifest keys for monitors and environment tiles exist, but only staff keys are wired through `AmbientStaff` / `PixelSprite`; monitors remain CSS-only.
- Frame geometry and curation crops are documented as best-guess placeholders pending local LimeZu confirmation.
- `PixelSprite` probes for 404s; while pending it can briefly paint a missing `backgroundImage` before falling back.
- Public CI/builds intentionally ship without curated art; that is correct for the public repo and a release risk only when real art is required.

### P2 — Complexity remains concentrated, but healthier than before

Largest current files:

| File | Lines | Role |
| --- | ---: | --- |
| `ControlRoomPresentation.module.css` | 1,079 | Living-room visuals |
| `src/game/engine.ts` | 787 | Turn resolution |
| `src/game/simulator.ts` | 643 | Aggregate simulation |
| `src/game/types.ts` | 613 | Canonical IDs and shapes |
| `src/game/content.ts` | 592 | Situation Cards and routes |
| `src/app/globals.css` | 567 | Campaign chrome |
| `src/playtest/journal.ts` | 553 | Guided-playtest persistence |
| `src/game/bots.ts` | 527 | Bot strategies |
| `src/components/brb/BRBApp.tsx` | 341 | Screen and persistence orchestration |

Size alone is not a defect. Avoid a broad Phase 2 refactor. Extract only when one change repeatedly touches unrelated concerns. Growth magnets to watch: `BRBApp.tsx`, `playtest/journal.ts`, and the control-room CSS module.

### P2 — Platform adapter still lives under `src/game`

`game-persistence.ts` owns serialize/migrate logic; `storage.ts` still accepts DOM `Storage` and is re-exported from the game barrel. The import-boundary test does not catch the DOM `Storage` type surface. Acceptable for now; move browser I/O out of the simulation package only if contributors start treating `storage.ts` as UI-adjacent state.

### P2 — Simulation smoke checks still mutate evidence

`npm run simulate` always appends to `docs/BRB_SIMULATION_LOG.md`. Correct for accepted experiments; awkward for profiling and audits. A future `--no-log` (default remains log) would help. Not required before guided runs.

### P2 — Import-boundary coverage is shallow by design

The boundary test scans only top-level `src/game/*.ts` with string/`from` regexes. It does not cover subfolders (none today), dynamic imports, presentation→simulation coupling, or `game-art` imports. A heavier dependency-cruiser setup is still not justified; extend the existing Vitest check if the tree gains nested game modules.

### P2 — No in-repo CI workflow

There is no `.github/workflows` gate. Local scripts exist (`test`, `typecheck`, `build`, `test:browser`), but contributors must remember to run them. Add a minimal CI workflow when packaging or multi-contributor cadence makes missed gates likely.

### P2 — Design-system route ships in the static export

`/design-system` and `/dev/control-room` are prerendered into `out/`. The production webpack replacement still nulls the control-room preview import, which is correct. The design-system page is a showcase for primitives the live campaign mostly does not use; decide later whether it stays public, becomes dev-only, or is excluded from the export.

### P3 — Exported-artifact and cross-browser testing remain release work

Playwright exercises the Next.js development server. Serving and smoke-testing `out/`, adding Firefox/WebKit, or adding PWA checks should wait until the Phase 4 packaging target makes them concrete.

### P3 — Routine dependency drift

Compatible patches exist for Next, PostCSS, Playwright, Tailwind, React, and related packages. Major jumps (Vitest 4, Testing Library jest-dom 7, TypeScript 7, Node types 26) are unnecessary during balance work. `vitest.game.config.ts` exists but is unused by `package.json` scripts.

### P3 — Dual content/validation file names are clarity cost only

`content.ts` / `core-content.ts` and `validation.ts` / `validation-primitives.ts` / `persisted-data-validation.ts` are intentional splits, not duplication. Naming discovery cost is low; leave them unless a rules change keeps landing in the wrong file.

## Recommended order of work

1. Finish or import the six-run guided matrix and write the cross-run synthesis before tuning another balance lever.
2. Before any art-required deploy: implement `inject-art` fetch/copy when `BRB_ART_SOURCE` is set, or fail the build instead of exiting 0.
3. Take a focused Next.js forward patch (`16.2.10` → current patched 16.2.x), then re-run `npm test`, `typecheck`, `build`, and browser tests.
4. Keep presentation changes on the owning stack (legacy campaign, control-room module, or design-system). Do not unify the three stacks during Phase 2.
5. Optionally add `--no-log` to simulate and a minimal CI workflow when they start costing real mistakes.
6. Defer large-file refactors, major dependency migrations, exported-`out/` Playwright, audio, and PWA work until their owning phase.

## Exit recommendation

**Remain in Phase 2.** The engineering gate is green and prior font-delivery risk stays closed. New technical debt is concentrated in the incomplete art deploy path and parallel presentation stacks. Neither should displace guided-playtest evidence or a single explicit balance decision.
