# BRB Current-State Audit

**Audit date:** 2026-08-04

**Audited state:** `main` at `cea0e4d` (merge of PR #9, "advisor ending presentation, 3× camera tier, EndingId exhaustiveness"), plus two uncommitted documentation edits in the working tree (`CHANGELOG.md`, this file). No source file is modified.

This audit supersedes the 2026-08-03 pass, re-verifies its findings against today's tree, and adds a documentation-debt review that the previous pass did not perform.

## Executive assessment

BRB remains correctly classified as **Phase 2: Balance prototype — in progress**. Engineering health is good and improving: 323 unit tests across 27 files, a strict typecheck that passes, a mechanically enforced pure-engine boundary, and zero suppression markers or explicit `any` anywhere in `src`, `tests`, or `scripts`.

Three things need attention before the next round of feature work, in this order:

1. **Dependency advisories.** `npm audit` reports three high-severity chains (Next.js, PostCSS, sharp) and `npm audit fix` resolves all three with a forward patch bump and no downgrade. This is still open from yesterday's pass.
2. **Documentation drift.** The instruction and onboarding documents have not kept pace with the two largest subsystems added since late July. `AGENTS.md` contradicts itself about font loading, and `README.md`'s project map is 115 commits stale.
3. **Phase 2 evidence.** Unchanged and still the binding constraint: there is no completed guided-playtest export or cross-run synthesis in the repository.

The changelog gap raised yesterday is now **closed**, and part of that finding is withdrawn as a misreading; see the Closed section below.

## Verified quality gate

All commands below were re-run today against the audited tree:

- `npm test`: **323 passing** across **27 files**, 11.4s. No failures, no skips.
- `npm run typecheck`: strict TypeScript validation passes with no output.
- `npm run test:browser`: **40 passing**, **12 intentionally skipped** (desktop/narrow-only complementary specs plus the strict art-manifest QA spec that only runs against the full licensed asset set), 59.1s. No failures.
- `npm run build`: succeeds. Static export generates six routes; the development control-room preview correctly ships as a 6 KB stub, confirming the `next.config.ts` null-component swap still works.
- `npm audit`: **3 high-severity** advisories. `npm audit fix --dry-run` confirms a clean forward fix (see P1).
- `npm outdated`: patch-level drift plus four major releases available; see P3.
- Documentation link integrity: **0 broken** relative Markdown links across all 18 tracked Markdown files, and **0** backtick-quoted `.ts`/`.tsx`/`.css`/`.json` path references that do not resolve to a tracked file. Both checks were scripted, not sampled.
- Debt-marker scan across `src`, `tests`, and `scripts`: **0** occurrences of TODO, FIXME, XXX, HACK, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `: any`, `as any`, or `<any>`.

This is an automated delivery gate, not a balance or external-human-playtest sign-off.

## What is solid

### Product and rules architecture

- `src/game` remains pure TypeScript, and the boundary is no longer convention-only: `tests/game/import-boundary.test.ts` mechanically rejects `react`, `react-dom`, `next`, `next/*`, and `@/components` imports plus `window`/`document`/`localStorage`/`sessionStorage`/`Math.random`/`Date.now`/`crypto` globals anywhere under `src/game`. This closes a P2 from the 2026-07-21 audit.
- The development-only control-room preview is still excluded from production through the `NormalModuleReplacementPlugin` swap in `next.config.ts`; `ControlRoomPreview.production.tsx` is present and wired.
- Replay reports, route provenance, Archive merging, bots, simulation, browser play, and tests continue to run against the same rules.

### Content and documentation agree on the numbers

Spot-checked the counts that the design documents assert, against `src/game/content.ts` at runtime rather than by reading prose: **15** Situation Cards, split **6 Crisis / 4 Advisor / 5 Corporation** and **10 Common / 5 Rare**. These match `BRB_PHASE_PLAN.md` and `BRB_CORE_DESIGN.md` exactly. No numeric drift found between implemented content and the current design documents.

### Test growth is real, not padded

Unit and component tests more than doubled since the July audit (141 → 323), with genuinely new surface area: camera-tier breakpoints, ending-tableau presentation, control-room CSS ownership, control-room state resolution, narrative scenes, and sprite motion. The `ENDING_IDS` tuple refactor (`src/game/types.ts:272`) converts a whole class of omission — an ending shipping without lighting, CSS, or aftermath — into a compile error.

## Technical-debt findings

### P0 — No ship-stopping defect identified

No deterministic rule failure, save corruption, invalid route completion, build failure, or browser-flow blocker.

### P1 — Three high-severity advisories, with a confirmed clean fix

`npm audit` reports high-severity chains for Next.js (middleware/proxy bypass, Server Action DoS and SSRF, two cache-confusion advisories, unbounded Edge Server Action payload, rewrites SSRF, Image Optimization DoS via SVG, unauthenticated Server Function disclosure), the PostCSS copy nested inside Next.js (stringify XSS plus three `sourceMappingURL` path-traversal/disclosure advisories), and `sharp`'s bundled libvips (CVE-2026-33327, -33328, -35590, -35591).

Most of the Next.js advisories describe server-side attack surface that a static export does not deploy, so **runtime exposure for the published prototype is low**. The advisories still matter for the local development server and the build toolchain, and the fix is cheap.

`npm audit fix --dry-run` proposes a forward move with no downgrade — materially better than the 2026-07-21 situation, where npm proposed an inappropriate Next.js downgrade that was correctly declined:

```
change next     16.2.10 => 16.3.0
change postcss  8.5.19  => 8.5.23
change sharp    0.34.5  => 0.35.3
remove postcss  8.4.31            (the nested copy inside next)
add    @img/sharp-wasm32 0.35.3
(plus matching @next/env, @next/swc-darwin-arm64, @img/sharp-* companions)
```

`16.3.0` is already `npm outdated`'s "Wanted" version, so this is an ordinary patch bump. Run `npm audit fix` followed by the full gate (`npm test`, `npm run typecheck`, `npm run test:browser`, `npm run build`). Not applied here so this audit stays read-only.

**Impact 2 · Risk 4 · Effort 1** → priority 30.

### P1 — Instruction and onboarding documents have drifted from the code

This is the finding the previous pass missed. Link integrity is perfect, but *content* accuracy is not. Four concrete items:

**a. `AGENTS.md` contradicts itself about font loading.** Line 134 states: "The current `next/font/google` setup may need network access when font files are not cached." Line 317 states the opposite and correct fact: "Fonts load via `next/font/local`, so `npm run build` does not need network access for fonts." The code agrees with line 317 — `src/app/layout.tsx:2` imports `localFont` from `next/font/local`, and `next/font/google` appears nowhere in `src`. Line 134 is a leftover from before the self-hosting change and instructs agents to treat a resolved risk as live. Delete or rewrite it. This is the single highest-value doc fix in the audit: `AGENTS.md` is declared the single source of truth, so a wrong line in it propagates.

**b. `README.md`'s project map predates the art and narrative subsystems.** README was last touched 2026-07-23, 115 commits ago. Its "Project map" lists no entry for `src/game-art/` (the 513-line asset manifest), `scripts/inject-art.ts` / `curate-art.ts` / `room-recipes.ts` (1,609 lines of pipeline), `src/components/brb/control-room/` (the living control room), or `src/components/brb/narrative/` (12 files, ~4,700 lines — now the largest single area of the codebase). Its "Run it" block omits every `art:*` script and `test:browser:art`. A new contributor following README alone would not know the art pipeline exists, and `predev`/`prebuild` would run `inject-art.ts` on them unexplained.

**c. `AGENTS.md` § "Technical Architecture" has no boundary entry for the narrative layer.** The "Important boundaries" list carefully names `types.ts`, `engine.ts`, `cards.ts`, `routes.ts`, `progression.ts`, `replay.ts`, `guidance.ts`, `bots.ts`, `simulator.ts`, `BRBApp.tsx`, `CampaignScreen.tsx`, the presentation resolver, the control-room component, and the dev preview page — but says nothing about `src/components/brb/narrative/`, despite it being the largest area added this cycle and the one most likely to be edited by mistake (three near-identically named `sceneCatalogCards{1,2,3}.ts` files, plus a registry, a resolver, and a type module). Add a boundary line naming `sceneRegistry.ts` / `sceneResolver.ts` as the wiring and the catalogs as declarative content.

**d. `AGENTS.md` § "Documentation Maintenance" has no routing rule for narrative scene changes.** The list maps every other kind of change to an owning document (terminology → jargon, cards/echoes → replay engine, visual rule → art direction, curated asset → art inventory). A change to an aftermath scene script has no listed destination, which is likely how the advisor endings originally shipped without their aftermath. Route it explicitly.

**Impact 4 · Risk 3 · Effort 1** → priority 35. This is the highest-scoring item in the audit and roughly an hour of work.

### P1 — Phase 2 evidence is still not decision-complete

Unchanged from the last two audits. The accepted `5/4/3/2/1` Corporation cadence reached 8.02–8.34% activation across two 5,000-run seed blocks, which establishes reachability but not whether the difficulty is intended. `BRB_PHASE_PLAN.md`'s exit checklist still marks the six-run guided matrix **Unverified**, with no journal export or cross-run synthesis stored in the repository. Three consecutive audits have now recorded presentation work landing on top of this gap.

**Impact 5 · Risk 5 · Effort 4** → priority 20 by formula, but this is the project's actual exit condition and effort here is the point, not the cost.

> **2026-08-05 update.** The six-run guided matrix was replaced by free play; the exit-checklist row is now "Free-play coverage and marker triage." The gap itself is unchanged — no exported journal or triage synthesis is stored in the repository — but coverage is now reported by the app rather than tracked by hand, and recorded runs are reproducible with `npm run replay`. See [BRB Playtest Journal](BRB_PLAYTEST_JOURNAL.md).

### Closed — the changelog gap raised on 2026-08-03

Resolved. The third camera tier is recorded under **Added**, and the advisor Coup/Cabal room lighting and aftermath under **Changed**.

The 2026-08-03 audit listed "the captured room grade" as a third, separately missing entry. That was a misreading of the commit titles and is withdrawn: `BRB_ART_DIRECTION.md:196` defines `captured` as *the advisor-takeover wash*, and `e76efff`'s own message says it exists because advisor takeovers were falling through to `calm`. It is the same feature as the takeover treatment, not an additional one, and the **Changed** entry already covers it. The entry's reference to "Corporate Capture's gold" points at the Corporate encroachment grade (`BRB_ART_DIRECTION.md:183`), which shipped earlier under the existing living-control-room entry.

Worth recording as a caution for future audits: commit subject lines were treated as feature inventory without opening the art direction document, and produced a recommendation to write a changelog entry for something already logged under a different name.

### P2 — `vitest.game.config.ts` is orphaned

`vitest.game.config.ts` (a forks-pool, single-worker config restricted to `tests/game/**`) is referenced by **no** npm script, **no** documentation, and **no** other config. `package.json`'s `test` script is a bare `vitest run`, which resolves `vitest.config.ts`. The file is either a deliberate escape hatch for debugging cross-test pollution in the game suite — in which case it needs a `test:game` script and a line in `AGENTS.md` § Testing — or it is dead and should be deleted. Right now a contributor cannot tell which, and nothing would fail if it silently rotted.

**Impact 2 · Risk 2 · Effort 1** → priority 20.

### P2 — No continuous integration, while configuration assumes it exists

There is no `.github/` directory and no CI configuration anywhere in the repository. The entire quality gate is manual and depends on the person running it remembering all five commands. Meanwhile `playwright.config.ts` branches on `process.env.CI` in three places (`forbidOnly`, `retries: 1`, `reuseExistingServer`) — configuration written for a CI that was never set up.

For a solo prototype this is a defensible choice, and adding CI is not urgent. But it is worth naming, because the two P1 hygiene items in this audit (a security advisory and a documentation contradiction) are both exactly the class of thing a scheduled job catches for free. A single workflow running `npm test`, `npm run typecheck`, and `npm audit` on push would have surfaced both without a human audit pass.

**Impact 3 · Risk 3 · Effort 2** → priority 24. Reasonable to defer to Phase 3, when external playtesters make a broken `main` expensive.

### P2 — Complexity is concentrated in content files, and the concentration grew

Largest source files: `sceneCatalogCards3.ts` (960), `sceneCatalogCards2.ts` (933), `tests/game/engine.test.ts` (905), `sceneCatalogCards1.ts` (865), `src/game/engine.ts` (835, was ~808), `scripts/curate-art.ts` (740), `src/game/types.ts` (652), `src/game/simulator.ts` (648), `src/game/bots.ts` (629), `src/game/content.ts` (592, unchanged).

The narrative catalogs now hold the top three source slots. They are declarative per-card scene scripts, not branching logic, so "size alone is not a defect" applies with more force there than to `engine.ts` — but the numeric `1/2/3` split is arbitrary and undocumented (see P1b). `engine.ts` grew ~3%. No file crossed a threshold that changed test difficulty or forced a repeated cross-cutting edit. Continue to avoid a broad refactor.

### P2 — Simulation smoke checks still mutate evidence

Unchanged: `npm run simulate` always appends to `docs/BRB_SIMULATION_LOG.md`, so profiling and smoke checks write to tracked evidence. A `--no-log` flag with logging still the default remains the obvious small fix. Not required before the guided runs.

### P3 — Seven campaign subpanels have no directly named test

`BrbTracksPanel`, `CampaignActionControl`, `CampaignAdvisors`, `CampaignSituationWorkspace`, `CorporationWatchPanel`, `LastTurnResult`, and `OtherCommitmentsPanel` are never named in a test file. They are exercised indirectly — four component tests render `CampaignScreen`, which composes all of them — so this is a coverage-attribution gap rather than untested code. Related: `vitest.config.ts` configures a coverage reporter, but no script runs it and no threshold is set, so nobody has a number to argue about. Adding `"test:coverage": "vitest run --coverage"` would make this measurable instead of inferred. Not worth backfilling per-panel tests during Phase 2.

### P3 — Internal surfaces are treated inconsistently in the player build

The static export ships `/design-system` as a complete 182 KB page. It is an internal component gallery: unlinked from any player route, and `BRB_ART_INVENTORY.md:92` explicitly classes it with the Playtest Journal as an internal tool with "no player-facing art requirement."

Its sibling internal route, `/dev/control-room`, is deliberately excluded — `next.config.ts` swaps the preview for a null component in production, and the export confirms it lands as a 6 KB stub. So the repository has a working, documented mechanism for keeping internal surfaces out of the player build and applies it to one of the two internal surfaces.

Nothing here is a defect: the gallery leaks no rules or classified copy, and 182 KB in a prototype is not a performance problem. But an itch.io build that includes a component gallery is an odd artifact, and the inconsistency is the kind that gets noticed at Phase 4 rather than now. Decide deliberately before packaging — either extend the existing exclusion to `/design-system`, or record in `AGENTS.md` that it ships on purpose.

### P3 — Exported-artifact and cross-browser testing remain release work

Unchanged. Playwright exercises the development server; the production export is verified separately by the offline build. Defer serving and smoke-testing `out/`, and adding Firefox/WebKit, until Phase 4 packaging makes them concrete requirements.

### P3 — Routine dependency drift

Beyond the `npm audit fix` set: `@playwright/test` 1.61.1→1.62.1, `tailwindcss`/`@tailwindcss/postcss` 4.3.2→4.3.3, `@types/react` and `@types/react-dom` patch bumps, `react`/`react-dom` 19.2.7→19.2.8, `lucide-react` 1.24.0→1.28.0, `radix-ui` 1.6.2→1.6.7, `tsx` 4.23.1→4.23.5, `happy-dom` 20.10.6→20.11.1. Majors available for `typescript` (5.9.3→7.0.2), `vitest` (3.2.7→4.1.10), `@testing-library/jest-dom` (6.9.1→7.0.0), `@types/node` (24.13.3→26.1.2). Take the patches in one focused maintenance change; evaluate majors after Phase 2 or when a security fix forces one.

## Prioritized remediation

Scored as `(Impact + Risk) × (6 − Effort)`, all on 1–5 scales.

| # | Item | I | R | E | Score | Phase fit |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Fix the four `AGENTS.md`/`README.md` documentation-drift items (P1b) | 4 | 3 | 1 | 35 | Now |
| 2 | `npm audit fix` + full gate (P1a) | 2 | 4 | 1 | 30 | Now |
| 3 | Add CI running test/typecheck/audit (P2) | 3 | 3 | 2 | 24 | Phase 3 |
| 4 | Resolve `vitest.game.config.ts`: script + document, or delete (P2) | 2 | 2 | 1 | 20 | Now |
| 5 | Finish the six-run guided matrix and synthesis (P1c) | 5 | 5 | 4 | 20 | Now — the real gate |
| 6 | Add `test:coverage` script (P3) | 2 | 1 | 1 | 15 | Opportunistic |
| 6= | Decide whether `/design-system` ships (P3) | 1 | 2 | 1 | 15 | Before Phase 4 |
| 7 | `simulate --no-log` (P2) | 2 | 1 | 1 | 15 | Opportunistic |
| 8 | Patch-level dependency sweep (P3) | 1 | 2 | 1 | 15 | Opportunistic |

Items 1, 2, and 4 together are well under a day and clear every non-evidence finding in this audit. They are deliberately front-loaded so that item 5 — the only one that moves the phase — runs against a clean tree.

## Recommended order of work

> **2026-08-05 update.** Items 4 and 5 below have since been overtaken: the six-run matrix was replaced by free play, so "complete runs 1–6" is no longer the shape of the gate. Read them as the priority the audit assigned to human evidence, not as the procedure. The current procedure is [BRB Playtest Journal](BRB_PLAYTEST_JOURNAL.md).

1. Correct the `AGENTS.md` font contradiction, add the narrative-layer boundary and documentation-routing entries, and refresh the `README.md` project map and command list.
2. Run `npm audit fix`, then the full verification gate, as its own small commit.
3. Decide `vitest.game.config.ts`'s fate: give it a `test:game` script and a line in AGENTS.md § Testing, or delete it.
4. Complete or import the first three natural guided runs and their five-commitment same-seed replays; write a preliminary cross-run synthesis **before** tuning anything.
5. Complete targeted runs 4–6 and the final guided-playtest synthesis, including defensive-style discoverability and advisor tension.
6. Use one documented alternate seed block to check whether archetype, strategy, activation, duration, and card-tempo findings survive beyond the `20260715` prefix.
7. Decide whether the current activation rate is intended; if not, change one balance lever only.
8. Defer large-file refactors, dependency majors, CI, audio, PWA work, and exported-artifact browser testing until their owning phase.

## Exit recommendation

**Remain in Phase 2.** Code health is the strongest it has been: tests doubled, the engine boundary is mechanically enforced, content and design documents agree numerically, and there is not one suppression marker in the tree. The debt that exists is documentation and hygiene, not architecture — cheap to clear and scored above.

The binding constraint has not moved in three audits. It is not engineering capacity; it is that no human has played six guided runs and written down what happened. Clear the three short items, then spend the remaining Phase 2 budget on evidence rather than presentation.
