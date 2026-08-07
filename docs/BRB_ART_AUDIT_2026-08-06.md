# BRB Art Audit — 2026-08-06

Audited against `BRB_ART_DIRECTION.md` v1.0 (2026-07-31) on branch
`audit/artwork-2026-08-06`, with the licensed LimeZu pack present and all 36
manifest assets curated locally.

This audit changes no artwork. It records what was measured, what holds, and
what does not, so a follow-up change can be scoped one finding at a time.

## Method

- `npm run art:status` — manifest/geometry delivery check.
- SHA-256 over every curated PNG, compared to `BRB_ART_INVENTORY.md`.
- Direct pixel measurement of floor and wall tiles (mean colour, relative
  luminance `0.2126R + 0.7152G + 0.0722B`, wall **face rows only** per §6).
- Static collision matrix over the facility: every runtime layer and actor
  footprint (from `manifest.ts` frame geometry) against every other and against
  the baked furniture in `room-recipes.ts`.
- Off-line recomposition of the worst-case facility state (paper `saturated`,
  institutions `breached`, Corporation `embedded`, BRB `unstable`, full staff,
  courier present) at the exact z-order `PixelRoom` uses, to see what the player
  sees rather than infer it.
- `npm test` (375 tests, 30 files) and `npm run test:browser:art`.

## What holds

**Provenance is exact.** All 36 manifest keys have an inventory row, all 36
inventory rows have a manifest key, and every recorded SHA-256 matches the file
on disk. Nothing has drifted since the 2026-07-31 inventory.

**The contrast law (§6) passes at target on every room.** Measured, not
asserted — and every value reproduces the §4 table to the tenth:

| Floor | Lum | Wall | Lum | Δlum | Rooms |
| --- | ---: | --- | ---: | ---: | --- |
| `envFloor` rgb(163,158,160) | 159.2 | Slate rgb(91,94,102) | 93.9 | **65.3** | facility, continuity, secure briefing |
| `envFloorAdmin` rgb(115,112,108) | 112.3 | Pale rgb(204,204,204) | 204.0 | **91.7** | intake, records, oversight |
| `envFloorWood` rgb(105,77,39) | 80.2 | Warm rgb(208,190,156) | 191.4 | **111.2** | corporate |
| `envFloorWorks` rgb(181,181,187) | 181.4 | Slate rgb(91,94,102) | 93.9 | **87.5** | infrastructure, civic gate |

All four are above the 60-point target, not merely the 40-point minimum. All
nine recipes use a documented pairing.

**§I5 outline discipline holds.** Zero opaque pure-black pixels across all 38
PNGs in the runtime tree. **§I1 holds** — every curated PNG is a whole multiple
of 16 in both axes.

**The automated gates pass.** 375/375 Vitest tests; 43 passed / 0 failed in the
art-gated Playwright run, including camera ownership, whole-number upscaling,
no-text-in-canvas, and room containment at 1101–1200px and 390px.

## Findings

### P1 — Three objects pile into one 2×3 footprint in the facility records annex

`roomFacility` bakes a copier (`Classroom_and_Library_Singles_54`, 2×3) at tile
(19,7). Two runtime layers are anchored inside it:

- `corporation-terminal` — `monitorServer` (1×3) at (20,7), when Corporation
  presence is `embedded`, and `corporation-channel` at the same anchor during a
  Corporation Situation;
- `damage-b` — `envSecureSafe` (1×2) at (19,8), when institutions are `breached`.

Together they cover five of the copier's six tiles. The recomposition shows a
server rack and a safe stacked over a copier with the copier's white top and
orange base poking out from behind both — three silhouettes in one footprint,
none readable. This is exactly the trap §11.4 names ("baking a prop where the
runtime layer lands means it is overpainted at exactly the moment it matters"),
and it fires in the states the annex is supposed to communicate.

Fix direction: clear tiles (19,7)–(20,9) in the recipe, or move the two anchors
onto open floor in the annex.

### P1 — The state vocabulary is overloaded; one sprite carries three meanings

Five sources cover twelve runtime meanings. `envInfrastructureToolbox` alone is:

| Layer | Meaning | Anchor |
| --- | --- | --- |
| `brb-infrastructure` | the BRB machine under construction | (14,2) |
| `equipment-load` | accumulated working clutter | (8,7) |
| `damage-a` | institutional damage | (1,8) |

In the worst-case state all three are on screen at once, alongside the baked
`Tool_Box_2` at (19,4) — four near-identical orange toolboxes, and they are the
most visually prominent objects in the frame. `envSecureSafe` similarly means
both evidence load and institutional breach; `monitorServer` means both BRB
machinery and Corporation terminal.

§16 requires a state layer to be "legible at a glance as **more or less**, not
merely different," and §11.6 asks every room to own one silhouette. A player
cannot currently distinguish "the building is damaged" from "the desk is buried"
from "the national machine is being built" — the room shows the same object
three times. This is a curation gap (the pack has crates, barrels, cabinets,
electrical kit), not a code gap.

### P2 — Runtime layers collide with each other

The collision matrix found two overlaps between layers that can be active
simultaneously:

- `damage-a` (toolbox 2×3 at (1,8)) vs `evidence-load-a` (safe 1×2 at (2,8)) —
  co-occur whenever paper load ≠ `sparse` **and** institutions ≠ `secure`.
  `damage-a` has the higher z-index, so the safe is buried behind the toolbox
  and reads as a grey rectangle poking out from under it.
- `equipment-load` (2×3 at (8,7)) vs the fixer actor (1×2 at (8,6)) — the
  toolbox lands under the fixer's feet whenever paper load is `burdened` or
  `saturated`.

Also in the base composites: `roomInfrastructure` places a worksite sign (1×3)
at (2,1) and a timber stack at (2,3), so the stack overpaints the sign's post.

### P2 — `validateRoomRecipe` enforces geometry but not art direction

`scripts/curate-art.ts:313` checks integer tiles, tile shapes, containment, and
manifest geometry. It does not check:

- the §6 contrast law on the recipe's floor/wall pairing — the project's own
  "single highest-value colour rule," which §6 records as having been violated
  **twice** (Δ 7.7 originally, Δ 6 on the first repair attempt). Nothing today
  stops a third;
- furniture overlapping other furniture (which is how the infrastructure sign
  defect above survived);
- furniture overlapping a reserved sprite or overlay anchor (§11.4, which is how
  the P1 annex defect survived).

All three are cheap, deterministic checks over data the validator already has.

### P2 — The Corporation officer is the Institutions steward

`ControlRoomPresentation.tsx:225` gives the Corporation officer
`staffStewardIdle` — the same strip used for the Institutions advisor at (10,6).
Two roles render as the same person in the same frame. §15 makes figures roles
rather than portraits, but it also makes occupancy meaningful; a duplicate
likeness weakens both.

Related: the three staff strips (`analyst`, `operator`, `steward`) differ only
in shirt colour — same silhouette, same hair. At the 1× narrow layout, position
is the only cue for who is at a desk, so "an advisor departed" is hard to read
as *which* advisor departed.

### P3 — §I8 is honoured by convention, not by type or test

`frameOffset` is optional on `RoomLayer` and `RoomActor`, and `PixelSprite`
defaults it to `0`. In the facility, six animated sprites take that default:
`brb-server-a` and all five actors (analyst, fixer, steward, Corporation
officer, courier). §I8 requires a *deliberate* pose, "not frame 0 by accident" —
these are frame 0 by accident, even if frame 0 happens to look acceptable.
`pixel-sprite-motion.spec.ts` only asserts the frozen pose for the security
camera, so nothing would catch a strip whose frame 0 is mid-stride.

### P3 — Two orphan PNGs in the curated output

`environment/floor-concrete.png` and `environment/floor-pale.png` sit in
`public/assets/brb/` but appear in no manifest entry, recipe, component, or
document, and have never appeared in git history. They are stale output from
before the paired floor/wall rebuild (`736ea5a`). The directory is gitignored so
nothing ships, but `art:curate` does not prune, so a stale file can outlive the
selection that produced it.

## Unrelated pre-existing failure

`npm run test:browser` fails 2 of 45 on `main` as well as on this branch, in
`tests/browser/campaign.spec.ts:96` — the spec expects the report heading
"Choose one authorization to preserve.", which no longer renders. This is not an
art defect; it looks like fallout from `8b2ec3e` ("report actual clearance
availability"). Recorded here so the art-gated run's result is not misread.
