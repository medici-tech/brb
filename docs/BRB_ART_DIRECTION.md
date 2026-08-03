# BRB Art Direction Reference

Version 1.0 · 2026-07-31

This is the art bible **and** the production guide. It exists so that a different
artist, a different AI model, or a different toolchain can produce work that
lands in the same world as what is already shipped, without reading the commit
history.

Where a rule has a number, the number is the rule. "Institutional grey" is not a
specification; `rgb(91,94,102)` is. Every value in this document was measured off
the shipped assets, not estimated.

**Companion documents**
- `BRB_ART_PIPELINE.md` — how the pipeline is wired and run.
- `BRB_ART_INVENTORY.md` — the per-asset provenance table with hashes.
- This document — what the art must *look like* and why.

---

## Part 0 — New AI session handoff

**Read this part first. It is the gate, not the introduction.**

### 0.1 Rules of engagement

Before creating or modifying any visual asset for BRB:

1. Read this entire document.
2. Treat Parts **II, III, IV, IX and XI** as binding constraints.
3. Use **Prompt A** (§31) unless explicitly instructed to create concept art.
4. Do not introduce new visual conventions without documenting them here.
5. Provide the completed review checklist (§34) with every finished asset.
6. State which existing asset, room, or approved reference was used as the
   visual anchor.
7. Do not place artwork into `public/assets/` until it passes technical, visual,
   and licensing review.

### 0.2 Production hierarchy

Work down this list. Only move to the next step when the one above genuinely
cannot serve the need — and say why.

1. **Curate** from the approved LimeZu asset pack.
2. **Compose** through the existing pipeline (`scripts/room-recipes.ts` →
   `scripts/curate-art.ts`).
3. **Measure** the result against the documented rules — the contrast law (§6),
   the grid, the timing arithmetic.
4. **Generate** only for concept work or a genuinely missing asset class.
5. **Approve** — generated work ships only after the §34 checklist, a technical
   pass, and a licensing review.

Generation is step 4 for a specific reason. BRB's identity is a *deterministic
composition of one licensed pack*. Every model that improvises will improvise
differently: one softens the shading, one shifts the camera a few degrees, one
invents its own outline colour. None of those reads as wrong on its own, and all
of them together stop the game looking like one artist. The pipeline is the style
guard; a generated PNG bypasses it.

### 0.3 What to hand back

Every finished art task reports:

- the **rule numbers** applied (e.g. "§6 contrast law, §11.1 wall-mounted at y≤1");
- the completed **§34 checklist**;
- the **visual anchor** used;
- **measured** values for anything §III or §IX specifies as a number, not an
  assertion that it looks right.

"It looks consistent" is not a result. `Δlum 65` is.

---

## Part I — Identity

### 1. What this game looks like

BRB is a bureaucratic tragedy rendered as **surveillance footage of a government
building**. The player is not in the room. They are reading a file about the room
while a fixed camera watches it, and the room slowly degrades over a campaign
that the player caused.

Three commitments produce that feeling, and everything else is downstream of them:

1. **The camera never moves and never crops.** One fixed orthographic view per
   location, showing the complete space. There is no zoom, no pan, no
   shot/reverse-shot, no framing change for drama. Drama is expressed by what is
   *in* the unchanged frame.
2. **Text is never inside the picture.** No labels, captions, speech bubbles,
   damage numbers, or nameplates on the canvas. Every word lives in DOM chrome
   outside the room. The room is evidence; the words are the file.
3. **The room accumulates, it does not reset.** Clutter, damage, corporate
   presence, machinery, staff departures and lighting are all persistent
   consequences of play. A room that looks worse looks worse *because of
   something the player did*.

### 2. The three faces

Exactly three visual registers are permitted anywhere in the product. A fourth
face is a bug. This is enforced by `tests/browser/presentation.spec.ts`.

| Face | Material | Where | Type |
| --- | --- | --- | --- |
| **Console** | Dark painted metal, phosphor readouts, hard offset shadows | App chrome, meters, rails, dialogs | Mono + condensed display |
| **Dossier** | Aged paper, printed ink, rubber stamps, hard edges | Situation files, reports, briefs | Sans body + condensed display |
| **Pixel room** | 16px orthographic pixel art, colour-graded | Every illustrated space | No type at all |

Never blend two faces in one element. A pixel-art icon does not belong on the
dossier; a paper texture does not belong inside the room; a drop-shadowed web
card does not belong anywhere.

### 3. Tone words

**Yes:** procedural, load-bearing, under-maintained, fluorescent, indifferent,
still-occupied, documented.

**No:** heroic, whimsical, neon, cyberpunk, cosy, cartoon-bouncy, apocalyptic
spectacle, "retro nostalgia."

The world is not ruined. It is *working, badly, on a Tuesday*.

---

## Part II — The invariants

These hold for every asset, forever. Changing one is an art-direction decision,
not an implementation detail.

| # | Invariant | Enforced by |
| --- | --- | --- |
| I1 | Everything sits on a **16px source grid**, at integer tile coordinates. | `validateRoomRecipe`, `room-anchors.test.ts` |
| I2 | Orthographic fixed camera. No `perspective`, `rotateX`, `rotateY`. | `control-room-css-ownership.test.ts` |
| I3 | **Upscaling is by whole numbers only.** Never 1.5×, never 1.83×. | `PixelRoom.module.css` `round()`, ownership test |
| I4 | One source scale across the whole product: 16px tiles, 16×32 characters. | Manifest geometry |
| I5 | Outlines are the pack's `#3A3A50`. No black outlines, no outline-free props. | Source-pack discipline |
| I6 | Rooms render internally at 1×; only the **complete canvas** is scaled. | `--sprite-scale-override: 1` inside rooms |
| I7 | No text, numerals, or UI inside the illustrated canvas. | `presentation.spec.ts` |
| I8 | Every animation freezes to a **deliberate pose** under reduced motion — not to frame 0 by accident. | `frameOffset` + `pixel-sprite-motion.spec.ts` |
| I9 | Art degrades to a schematic when assets are absent; it never breaks the layout. | `PixelSprite` fallback, `pixel-room.test.tsx` |
| I10 | Source PNGs are licensed, gitignored, and never committed. | `.gitignore`, `THIRD_PARTY_ASSETS.md` |

---

## Part III — Colour

### 4. The room palette

Room shells are built from **paired floor and wall sets**. The pairing is a
contrast rule, not a taste preference (see §6).

**Wall styles** — each is a 32px source band cut into two shapes: a complete
`*Crown` segment (16×32: outline, crown, face, baseboard) for far edges, and a
flat face tile (16×16) for side/near edges and partitions.

| Style | Face | Luminance | Crown | Baseboard | Used by |
| --- | --- | ---: | --- | --- | --- |
| Slate | `rgb(91,94,102)` | 94 | `#F8F8F8` | `rgb(120,123,105)` olive | Facility, continuity, secure briefing, infrastructure, civic gate |
| Pale | `rgb(204,204,204)` | 204 | `#FDFDFD` | `rgb(161,161,161)` | Intake, records, oversight |
| Warm | `rgb(208,190,156)` | 191 | `#F8F8F8` | `rgb(181,117,77)` rust | Corporate |

**Floors** — tileable 16×16, verified to self-repeat seamlessly.

| Key | Mean | Luminance | Reads as | Paired wall | Δlum |
| --- | --- | ---: | --- | --- | ---: |
| `envFloor` | `rgb(163,158,160)` | 159 | Mid-grey institutional tile | Slate | **65** |
| `envFloorAdmin` | `rgb(115,112,108)` | 112 | Darker grey tile grid | Pale | **92** |
| `envFloorWood` | `rgb(105,77,39)` | 80 | Dark wood plank | Warm | **111** |
| `envFloorWorks` | `rgb(181,181,187)` | 181 | Pale poured concrete | Slate | **87** |

### 5. The grade palette

Room mood is applied as a **colour grade over finished art**, never baked into
the asset. Same PNG, different pressure.

Base room filter, always on: `contrast(1.08) saturate(0.82) brightness(0.9)`.

| State | Signal (rim) | Grade (multiply wash) | Extra |
| --- | --- | --- | --- |
| Calm | inherits neutral | `rgba(8,14,13,0.18)` | — |
| Strained | `rgba(214,154,58,0.62)` amber | `rgba(66,38,9,0.20)` | light zones amber `rgba(222,163,66,0.26)` @ .30 |
| Crisis | `rgba(233,132,121,0.74)` red | `rgba(78,17,13,0.27)` | light zones red `rgba(221,94,76,0.24)` @ .34 |
| Institutional failure | `rgba(166,58,50,0.44)` | `rgba(10,5,5,0.54)` | room `saturate(0.42) brightness(0.62)`, lights @ .08 |
| Corporate encroachment | `rgba(195,163,70,0.70)` gold | `rgba(55,48,11,0.16)` | gold sheen from the right edge |
| BRB activation-ready | `rgba(230,194,103,0.78)` | — | machinery `brightness(1.18) drop-shadow(0 0 3px rgba(237,194,87,0.9))` |
| Ending: state collapse | — | — | room `saturate(0.28) brightness(0.48)` |
| Ending: advisor coup | `rgba(166,180,133,0.88)` phosphor, hard thin rim | `rgba(16,22,18,0.34)` | one held zone @ .94, all others @ .05; room `contrast(1.16) saturate(0.62) brightness(0.72)` |
| Ending: advisor cabal | `rgba(166,180,133,0.42)` phosphor, soft wide bloom | `rgba(16,22,18,0.34)` | held zones @ .70 each, others @ .07; same room filter |

**Emphasis** (a lit advisor station): `brightness(1.24) saturate(1.12)
drop-shadow(0 0 3px rgba(229,182,72,0.92))` plus its light zone to opacity 0.86.

Light zones are soft ellipses, `rgba(192,206,157,0.22)`, `mix-blend-mode: screen`,
resting at opacity 0.24, transitioning over 280ms.

**`RoomLighting` grades** (`[data-lighting]`): `calm`, `strained`, `crisis`,
`failure`, `captured`. `captured` is the advisor-takeover wash —
`rgba(14,22,17,0.38)` with phosphor zones at rest 0.10. It exists because
`failure` is red-black and drops zones to 0.08, which is collapse's language: a
takeover must not be able to borrow it.

**Capture from within.** Corporate capture is gold arriving from outside;
collapse is the building going dark and emptying. A takeover keeps the room's own
phosphor but narrows it to one or two stations while the floor darkens *with
everyone still at their desks* — dark room, **full** room, one hot pool of light.
Coup and cabal share the hue and differ only in distribution: one hard rim with
almost no bloom versus half the rim and triple the bloom.

Two traps this treatment must respect:

- A takeover always fires with Corporation progress in the 60–99 band (capture
  claims 100+), which is exactly the band that makes `data-corporation-presence`
  `embedded`. The gold sheen must be explicitly cancelled or the room reads as
  the wrong loss.
- The rest-dim selector is more specific than the holder selector. The holder
  rule must carry the same `[data-authority]:not([data-authority-holders="none"])`
  prefix, or the held station is dimmed along with everything else and the
  takeover renders with no pool of light at all — while every attribute is still
  correct, so no rendering test catches it.

### 6. The contrast law

> **A room's floor and its wall must differ by at least 40 points of relative
> luminance. Target 60+.**

This is the single highest-value colour rule in the project.

All nine rooms previously shared one floor (`rgb(137,142,166)`, lum 142.8) and
one wall (`rgb(139,134,130)`, lum 135.1) — a **Δ of 7.7**. The shell was
correctly composited and completely invisible; every room read as "carpet with
grey gutters."

The law is written as a hard number because the obvious repair does not
automatically fix it. A first pass that added three wall styles paired a pale wall
(204) with a pale floor (198) — **Δ 6**, no better than the original. Structural
work with no measurement behind it can leave the problem exactly where it was.

Compute with `0.2126R + 0.7152G + 0.0722B` on the mean tile colour. Measure the
wall's **face rows only** — including the white crown skews the average by ~40
points and will convince you a bad pairing is fine.

### 7. The chrome palette

Outside the room, colour comes from two ramps in `globals.css`. Never introduce a
raw hex; add a ramp step.

**Paper ramp** — `#F4EAD6` `#E9E0CE` `#D7CBB4` `#CFC09D`, line `#A99D88`,
ink `#201F19`, danger ink `#8A2622`.

**Console ramp** — `#10120F` `#151716` `#1B1E18` `#202320` `#24281F`,
line `#454A3B`, soft line `#3C3E39`.

**Signals** — amber `#D69A3A` (primary/authorisation), olive `#778361`
(secondary/instrument), phosphor `#A6B485` (live readouts), red `#A63A32`
(destructive), soft red `#E98479`.

Room viewport surround: background `#101719`, inset border
`rgba(172,158,116,0.46)` over `rgba(13,18,19,0.72)`, lift `0 14px 30px
rgba(0,0,0,0.34)`.

Shadows are **hard offsets**, not blurs: `2px 2px 0`, `4px 4px 0`, `6px 6px 0` at
`rgba(8,9,7,0.42–0.5)`. This is a printed/stamped language. Soft ambient blur is
reserved for the sheet-lift stack on paper.

---

## Part IV — Form

### 8. Perspective and the camera

- **Projection:** top-down orthographic, tilted just enough that the far wall
  shows its face. Roughly 3/4 overhead. No vanishing point.
- **The far (north) edge is the only wall that shows its face.** Side and near
  edges are seen effectively end-on and get the flat 16px face tile, one tile
  thick. This is why the wall kit has two shapes.
- **Camera height and angle are identical in every room.** A prop drawn for one
  room must drop into any other without redrawing.
- **Nothing occludes the camera.** No foreground framing elements, no ceiling.

### 9. Room dimensions

| Room class | Tiles | Source px | Interior floor |
| --- | --- | --- | --- |
| Facility (hero) | 22 × 14 | 352 × 224 | Multi-zone, partitioned |
| Standard room | 14 × 10 | 224 × 160 | 12 × 7 at (1,2)–(12,8) |

The standard 14×10 shell is fixed:

```
rows 0–1   far wall band   (crown segment, full width)
rows 2–8   floor           (cols 1–12)
row  9     near edge       (flat face, cols 0–13)
cols 0,13  side edges      (flat face, rows 2–8)
```

### 10. Proportions

- Tile: **16 × 16 px**.
- Character: **16 w × 32 h** — two tiles tall, one wide. Roughly 1:2, head about
  ⅓ of total height. Chunky, not heroic; readable at 1×.
- Furniture footprints are whole tiles: 1×2, 1×3, 2×2, 2×3, 3×2, 3×4.
- A prop taller than 3 tiles competes with the wall band and usually reads as a
  mistake. Prefer 2–3.

### 11. Composition

**Zone before object.** Divide a room into named functional zones first
(command floor, chamber, annex, corridor), then furnish each. Scattering props
evenly across open floor is what made all six aftermath rooms interchangeable.

**Rules that carried the most weight:**

1. **Wall-mounted objects anchor at y=0 or y=1.** Maps, boards, screens,
   consoles, notice cabinets, extinguishers hang *in* the wall band. On open
   floor they read as debris.
2. **Free-standing furniture starts at y≥2.** Never in the wall band.
3. **A barrier reads as a line, not a scatter.** The civic gate works because the
   fence runs across the room with a gap; the same panels sprinkled around read
   as litter.
4. **Leave the reserved tiles empty.** Runtime layers and actors own specific
   anchors. Baking a prop where the animated monitor wall lands means it is
   overpainted at exactly the moment it matters.
5. **Deliberate emptiness is legitimate, accidental emptiness is not.** The BRB
   chamber is bare *because it is an unbuilt project*, and the recipe says so in
   a comment. Everywhere else, empty floor is a bug.
6. **Give every room one silhouette it does not share.** Console far wall
   (continuity), fence line (civic gate), material stacks (infrastructure), long
   table on wood (corporate).

### 12. Texture

- Texture lives **in the source pixels**, never in a CSS overlay on top of art.
- Floors carry a subtle repeating tile or plank grain — enough to read as a
  surface, never enough to compete with props. A tile whose pattern runs
  **diagonally** fights the 16px grid and produces a moiré at scale; the original
  floor pick was rejected for exactly this.
- Grain and scanline overlays belong to the *console chrome*, not the room. The
  only overlays permitted on the canvas are the grade wash, the vignette, and
  the light zones.

### 13. Layer order

Fixed z-stack inside `PixelRoom`:

```
  0    room base composite
 10+i  props / state layers
 50+i  actors
 90    colour grade wash        (multiply)
100    named light zones        (screen)
120    vignette + inner rim
```

The grade sits **above** actors deliberately: staff are graded by the room's
mood, they are not lit independently of it.

---

## Part V — Asset classes

### 14. Environments (room bases)

Assembled deterministically by `curate-art.ts` from a recipe. Paint order is
back-to-front and load-bearing:

1. Floor tiled over the whole canvas.
2. Flat wall faces on side/near edges and interior partitions.
3. Far-edge crown bands — **after** the faces, so a band's baseboard lands on top
   of the corner it shares with a side wall.
4. Furniture.

Interior partitions must not sever a traversal route. The facility's divider
stops above row 11 because the courier walks 17 tiles along row 11.

### 15. Characters

- 16×32, six-frame strips, one strip per facing.
- **Idle** 4–6 fps (steward 4, analyst/operator 6). **Walk** 10 fps.
- Characters are **roles, not portraits.** They represent Analysis, Operations,
  Institutions. No advisor likenesses — the pack has none, and inventing them
  would break the "world sprite, not portrait" rule.
- Occupancy is meaningful: a missing figure means a departed advisor.
- Left- and right-facing walks are **separate curated strips**, never a CSS
  `scaleX(-1)` flip. Flipping breaks the pack's directional shading.

### 16. Props and state layers

- Whole-tile footprints; committed dimensions recorded in `FURNITURE_TILE_SIZE`.
- Animated props preserve the **source GIF's hold frames** by repeating indices
  rather than resampling: `[0,0,0,0,0,1,2,…,7,7,7,7,7,8,…]`. Dropping the holds
  turns a considered animation into a nervous twitch.
- A state layer must be **legible at a glance as more or less**, not merely
  different. The records shelves are chosen by *visible empty space*: sparse has
  bare sections, full is stocked, overflow is crammed.
- Every animated prop needs a `frameOffset` naming its reduced-motion pose.

### 17. Interface

- Chrome is DOM, not art. No pixel-art buttons, no sprite icons.
- Radii are near-square: 2–6px. Nothing rounder.
- Type: Barlow Condensed (display), IBM Plex Sans (body), IBM Plex Mono
  (instrument/label). All self-hosted.
- Labels are uppercase mono with `letter-spacing: 0.12em`.
- Live values use phosphor `#A6B485` on console dark.

---

## Part VI — Motion

### 18. Motion principles

1. **Stepped, never smooth.** Every animation uses `steps()`. No easing on
   anything inside the canvas. Easing belongs only to the 280ms grade and light
   transitions and to DOM chrome.
2. **Movement quantises to pixels.** 4px sub-steps for travel; 16px hops read as
   teleportation.
3. **Locomotion and locomotion-rate are one system.** A walking figure must
   advance exactly one position step per sheet frame. Compute it:

   ```
   travel 272px ÷ 4px step        = 68 steps
   sheet 6 frames @ 10fps         = 10 frames/sec
   duration 68 ÷ 10               = 6.8s
   ⇒ animation: 6.8s steps(68)  against  0.6s steps(6)
   ```

   Change the corridor length or the sheet fps and you must redo this.
4. **Nothing loops in unison.** Every animated sprite is seeded into its own loop
   phase by a negative `animation-delay`, derived deterministically from its tile
   position — `((x*7 + y*13) % 17) / 17`. Deterministic, not random, so it is
   stable across renders and identical during hydration.
5. **Ambient motion is slow and pointless.** Monitors, servers, cameras exist to
   prove the building is powered, not to attract attention. Server rack: 2 fps.
6. **Tempo is a room-level dial.** `data-tempo="reading"` slows every loop to
   1.85×; `data-tempo="still"` parks everything on its frozen pose.
7. **Reduced motion parks on a chosen frame,** never on whatever frame 0 is.

### 19. Timing table

| Motion | Duration | Timing | Repeat |
| --- | --- | --- | --- |
| Sprite loop | `frameCount / fps` | `steps(frameCount)` | infinite |
| Courier crossing | 6.8s | `steps(68)` | once |
| Scene enter / withdraw | 560ms | `steps(4)` | once, `both` |
| Scene cross | 800ms | `steps(4)` | once |
| Scene emphasis | 420ms | `steps(2)` | ×2 |
| Crisis beacon | 1.15s | `steps(2, end)` | ×2 |
| Commit signal | 900ms | `steps(3, end)` | once |
| Grade / light change | 280ms | `ease` | once |
| Paper sheet settle | 450ms | `ease-out` | once |

### 20. Frame rates

| Class | fps |
| --- | ---: |
| Server rack / slow indicator | 2 |
| Steward idle | 4 |
| Staff idle | 6 |
| Monitors, cameras, walk cycles, narrative props | 10 |

---

## Part VII — Constant vs variable

### 21. Must never vary

- The 16px grid and integer tile placement.
- Orthographic angle and camera height.
- Character proportions (16×32) and outline colour `#3A3A50`.
- Two-shape wall kit: crown band on far edges, flat face elsewhere.
- The 40-point floor/wall luminance floor.
- Stepped timing; no eased motion inside the canvas.
- Zero text inside the canvas.
- Whole-number upscaling.
- Reduced-motion parity for every animation.

### 22. May vary freely

- **Which** floor and wall style a room uses, provided the contrast law holds.
- Room dimensions, as long as they are whole tiles and the manifest agrees.
- Furniture selection and arrangement within the placement rules.
- Number and shape of light zones.
- Prop and actor counts.
- Grade intensity per state.
- Which source theme a prop comes from — *if* it matches the pack's outline,
  palette, and camera.

### 23. Requires a decision, not a choice

- Adding a fourth visual face.
- Adding a wall style or floor outside the committed set.
- Changing the 704px fixed-camera column width (a tested layout contract).
- Any non-integer scale.
- Portraits of named characters.

---

## Part VIII — What to avoid

These are not hypotheticals. Every one shipped at some point in this project.

### 24. Composition failures

| Anti-pattern | What it looked like | Rule |
| --- | --- | --- |
| **Fragments as props** | Conference singles `1` and `6` are the *end caps* of a table run; butted together they made a lumpy blob with a stray notch, in 5 of 9 rooms. `14`–`17` are angled corner leaves, placed alone as floating slivers of wood. | Render a single at 4× and look at it before placing it. If it has a cut edge, it belongs to an assembly. |
| **Wrong theme folder** | The "BRB infrastructure workroom" was furnished from the interiors pack's *Basement* sorter — which is a rec room of pool tables, cushions and dart boards. A green ping-pong table was standing in for industrial plant. | Read the theme's actual contents. Worksite/perimeter stock lives in Modern Exteriors `8_Worksite_Singles_16x16`. |
| **Wrong category** | Catering counters (one carrying a plate of food) used as control-room workstations, while the real monitor consoles sat unused. | Name what the object *is* before deciding what it *represents*. |
| **Wall objects on the floor** | A world map lying flat in the middle of open carpet. | Wall-mounted → y=0 or y=1. |
| **Scatter instead of structure** | Six aftermath rooms, each 4–6 props sprinkled on identical carpet — visually interchangeable. | Zone first, then furnish. One unique silhouette per room. |
| **Invisible progression** | Three "sparse / full / overflow" shelves that were three equally crammed shelves. | Pick state art by the *quantity of the difference*, not the category. |

### 25. Rendering failures

| Anti-pattern | Why it's wrong |
| --- | --- |
| Fractional scaling | `scale(100cqi / W)` produced 0.858 and 1.70 in the shipped build. Resamples every sprite. Snap upscales with `round()`. |
| Low-contrast shell | Floor and wall within 20 luminance points — architecture becomes invisible. |
| Diagonal floor patterns | Fight the 16px grid; produce moiré at scale. |
| CSS-flipped sprites | Breaks directional shading. Curate a real strip. |
| Baked-in mood | Grade at render time so one PNG serves every state. |
| Hand-maintained sizes with no check | A committed 16×48 for a 16×32 source composited silently. Verify against the real PNG at compose time. |

### 26. Motion failures

| Anti-pattern | Why it's wrong |
| --- | --- |
| Position and animation on different clocks | `steps(17)` over 4.8s (a 16px hop every 282ms) against an 8fps walk = teleporting with moving legs. |
| Unison looping | Every sprite starting at t=0 makes the room blink as one object. |
| Eased motion in the canvas | Sub-pixel interpolation on pixel art. |
| Resampling a source GIF's timing | Destroys authored hold frames. Repeat indices instead. |
| Freezing on frame 0 | Reduced-motion users get an arbitrary mid-blink pose. Choose it. |

### 27. Style traits that are simply not this game

Neon and glow-heavy palettes · gradients as a primary surface · rounded/bubbly
shapes · exaggerated squash-and-stretch · isometric or 45° projection · parallax
· particle effects · lens flare, bloom, chromatic aberration · mixed pixel
densities in one frame · anti-aliased pixel art · hand-drawn or painterly
textures · emoji or vector icons inside the canvas.

---

## Part IX — Technical specification

### 28. Assets

| Property | Value |
| --- | --- |
| Format | PNG, 8-bit sRGB, metadata stripped (`-strip`) |
| Transparency | Straight alpha. Props/characters transparent; floor and wall tiles fully opaque |
| Source grid | 16px |
| Character frame | 16 × 32, 6 frames per direction (96 × 32 strip) |
| Tile | 16 × 16 (floors, faces); 16 × 32 (wall crown band) |
| Prop footprints | Whole tiles: 16/32/48 wide × 16/32/48/64 tall |
| Animation strips | Horizontal, left→right, uniform frame width |
| Strip width | Exactly `frameWidth × frameCount` |
| Room composites | Single frame; `frameWidth == expectedWidth`, `frameCount: 1` |
| Facility | 352 × 224 (22 × 14 tiles) |
| Standard room | 224 × 160 (14 × 10 tiles) |
| Colour | No resampling, no recolouring, no resizing during curation |
| Payload uniqueness | Hashes must stay distinct after `art:curate` |

### 29. Display

| Property | Value |
| --- | --- |
| Render scale in room | 1× (`--sprite-scale-override: 1`) |
| Canvas upscale | Integer only, snapped with `round(down, fit, 1)` |
| Below 1× | Continuous, deliberately — the next step down is 0.5× |
| Wide (≥1600px) | 3× (facility 1056 × 672) |
| Desktop | 2× (facility 704 × 448) |
| Narrow (≤1180px) | 1× (facility 352 × 224) |
| Aspect ratio | `--pixel-room-width / --pixel-room-height`, never letterboxed away |
| Rendering | `image-rendering: pixelated`, with `-webkit-optimize-contrast` fallback first |
| Fallback | Flat schematic (`#1A2424`, 16px grid in `#303C39`) on 404 |

### 30. Manifest contract

Every asset has a **semantic key**, never a source-derived name. Components
reference keys only, so the pack can be re-curated without touching component
code. Each entry declares `src`, `frameWidth`, `frameHeight`, `frameCount`,
`fps`, `scale`, `expectedWidth`, `expectedHeight`, and must satisfy:

```
frameWidth × frameCount === expectedWidth
frameHeight              === expectedHeight
frameCount > 1  ⟺  fps > 0
```

---

## Part X — Prompts

> **Read this first.** BRB's production method is **curation and deterministic
> composition from a licensed LimeZu pack**, not image generation. A generated
> PNG will not match the pack's outline colour, palette quantisation, or camera,
> and dropping one into a room will be visible immediately. Prompt A is the one
> that matches this pipeline and should be your default. Prompt B is for genuinely
> new art authored outside the pack — concept work, marketing, or a future
> non-LimeZu asset class — and anything it produces must clear the §33 checklist
> and a licensing review before it enters `public/assets/brb/`.

### 31. Prompt A — Master brief (curation & composition)

Use for an artist or agent building or revising a room from the pack.

```
You are art-directing a room for BRB, a bureaucratic-tragedy strategy game
rendered as surveillance footage of an under-maintained government building.

WORLD
Procedural, load-bearing, under-maintained, fluorescent, indifferent,
still-occupied. Not ruined — working badly on a Tuesday. Never heroic,
whimsical, neon, or cosy.

CAMERA
Fixed orthographic, roughly 3/4 overhead, identical in every room. Never moves,
never crops, never zooms. Only the far (north) wall shows its face.

GRID
16px. Every coordinate and every footprint is a whole number of tiles.
Standard room 14x10 tiles (224x160 px). Characters 16x32.

SHELL (build in this order)
1. Tile a floor over the whole canvas.
2. Paint flat 16x16 wall FACE tiles on the side and near edges and on interior
   partitions.
3. Paint the complete 16x32 wall CROWN segment (outline, white crown, face,
   baseboard) across every far edge, AFTER the faces.
4. Place furniture.
Standard shell: rows 0-1 far wall, rows 2-8 floor, row 9 near edge,
cols 0 and 13 side edges.

CONTRAST LAW (non-negotiable)
Floor and wall must differ by >= 40 relative-luminance points; target 60+.
Measure the wall's FACE rows only. Committed pairings:
  slate wall (lum 94)  + mid-grey tile (159) or pale concrete (181)
  pale wall  (lum 204) + dark grey tile (112)
  warm wall  (lum 191) + dark wood (80)

PLACEMENT
- Wall-mounted objects (maps, boards, screens, consoles, notice cabinets,
  extinguishers) anchor at y=0 or y=1, inside the wall band.
- Free-standing furniture starts at y>=2.
- Barriers and fences run as a continuous LINE with a deliberate gap, never
  scattered.
- Leave reserved anchor tiles empty for runtime layers and actors.
- Give the room one silhouette no other room has.
- Deliberate emptiness must be justified in a comment; accidental emptiness is
  a defect.

SOURCE DISCIPLINE
- Render any candidate single at 4x and look at it before placing it. If it has
  a cut edge it is a FRAGMENT of an assembly (e.g. conference singles 1 and 6
  are table end caps; 14-17 are angled corner leaves) — use the full assembly
  or pick something else.
- Read what the theme folder actually contains. The interiors "Basement" sorter
  is a rec room (pool tables, cushions, darts), not utility plant. Worksite and
  perimeter stock is Modern Exteriors 8_Worksite_Singles_16x16.
- Name what an object IS before deciding what it represents. Catering counters
  are not workstations.
- Verify every committed tile size against the real PNG.

FORBIDDEN
Text or numerals in the canvas. Perspective/rotateX/rotateY. Fractional scale.
Diagonal floor patterns. CSS-flipped sprites. Baked-in mood colour. Gradients,
neon, bloom, particles, anti-aliased pixels, mixed pixel densities.

DELIVERABLE
An integer-tile recipe: floor key, wall face key, wall crown key, wall rects,
wall bands, and a furniture list of (source, x, y) with committed footprints —
plus one sentence per zone explaining what the room is for.
```

### 32. Prompt B — Generative image prompt

For concept work or non-pack asset classes. Substitute the bracketed fields.

```
16-bit top-down orthographic pixel art, 16px tile grid, [SUBJECT].
Style: LimeZu Modern Interiors — clean flat pixel shading, 3/4 overhead
orthographic projection with no vanishing point, uniform dark blue-violet
outlines (#3A3A50) on every object, limited desaturated palette, subtle
1-2px interior shading, no gradients, no anti-aliasing, no dithering.
Palette: institutional slate (#5B5E66), pale grey (#CCCCCC), warm tan
(#D0BE9C), dark wood (#694D27), amber signal (#D69A3A), olive (#778361).
Mood: procedural, under-maintained, fluorescent, indifferent, still occupied.
Government facility interior, not ruined and not futuristic.
Composition: flat-on fixed camera, complete space visible, no cropping, no
foreground framing, no ceiling.
Rendering: crisp integer pixels, transparent background, [WIDTHxHEIGHT] px at
1:1 source scale, [N] tiles wide by [M] tall.
Negative: text, letters, numbers, UI, watermark, logo, isometric, 45-degree
projection, perspective, vanishing point, neon, glow, bloom, lens flare,
gradient, blur, anti-aliasing, soft shadows, painterly, hand-drawn, 3D render,
cel shading, chibi, cute, rounded bubbly shapes, cyberpunk, post-apocalyptic
rubble, particles, parallax, drop shadow.
```

### 33. Modular sections

Append the relevant block to Prompt A or B.

**Character**
```
16 w x 32 h. Two tiles tall, one wide; head ~1/3 of height. Chunky and readable
at 1x, not heroic. Six-frame horizontal strip, one strip per facing, 96x32.
Office/civil-service dress: plain shirt, muted trousers, no armour, no capes,
no accessories that read at 1x. The figure is a ROLE (Analysis, Operations,
Institutions), never a portrait of a named person. Separate strips per
direction; do not mirror. Idle 4-6 fps, walk 10 fps.
```

**Environment**
```
Complete [N]x[M]-tile room at 16px. Far wall band across the top two rows with
crown and baseboard; flat wall faces on side and near edges. Floor paired to
the wall by the contrast law. Divide into named functional zones before
furnishing. Interior partitions must not sever a traversal route.
```

**Prop / state layer**
```
Whole-tile footprint (1x2, 1x3, 2x2, 2x3, 3x2). Transparent background, dark
outline, flat shading, matching camera. If animated, preserve the source
timing's HOLD frames by repeating indices rather than resampling, and name a
deliberate frozen pose for reduced motion. If it represents a quantity, the
difference between tiers must be visible empty space, not just a different
object.
```

**Wall-mounted object**
```
Occupies rows 0-1 (or 0-2 for a hanging screen). Reads as fixed to a vertical
surface: no cast shadow on the floor, no perspective base, bottom edge flush or
overhanging by at most one tile. Must not overlap any tile a runtime layer owns.
```

**Interface element**
```
DOM, not art. Console face: dark painted metal (#1B1E18), console line
(#454A3B), hard offset shadow (4px 4px 0 rgba(8,9,7,0.45)), radius 2-6px.
Or dossier face: aged paper (#CFC09D), ink (#201F19), printed rules, rubber
stamp. Barlow Condensed display, IBM Plex Sans body, IBM Plex Mono labels
uppercase at 0.12em tracking. Never pixel art. Never a third face.
```

---

## Part XI — Review

### 34. Visual consistency checklist

Run before any asset is approved.

**Grid and geometry**
- [ ] Every coordinate and footprint is a whole number of 16px tiles
- [ ] Committed tile size matches the real PNG (verify, don't assume)
- [ ] `frameWidth × frameCount == expectedWidth`; `frameHeight == expectedHeight`
- [ ] Characters are 16×32; strips are 6 frames per facing
- [ ] Camera angle and height match existing rooms exactly

**Colour**
- [ ] Floor/wall luminance delta ≥ 40 (measure the wall face rows only)
- [ ] Palette drawn from the committed ramps; no new raw hex
- [ ] Outlines are `#3A3A50` — not black, not absent
- [ ] No mood colour baked into the asset

**Composition**
- [ ] Room divides into named zones; no even scatter
- [ ] Wall-mounted objects at y=0/y=1; free-standing at y≥2
- [ ] Reserved runtime anchors are clear
- [ ] Room has a silhouette no other room has
- [ ] Any empty area is deliberate and documented
- [ ] No prop is a fragment of a larger assembly
- [ ] Every prop's real-world category matches its narrative role

**Motion**
- [ ] All timing uses `steps()`; no easing inside the canvas
- [ ] Travel quantised to 4px, one position step per sheet frame
- [ ] `--sprite-phase` set; nothing loops in unison
- [ ] `frameOffset` names a deliberate reduced-motion pose
- [ ] Source hold frames preserved by index repetition
- [ ] Reduced motion verified, not assumed

**Integration**
- [ ] No text, numerals, or UI inside the canvas
- [ ] Only integer upscales at every breakpoint
- [ ] Renders correctly with assets absent (schematic fallback)
- [ ] Payload hash distinct from every other asset
- [ ] Manifest key is semantic, not source-derived
- [ ] Inventory row and credits pack ID added

### 35. Workflow

**1 — Brief.** Name the space's function and its one unique silhouette. Write
the zone list before opening the pack.

**2 — Survey.** Build a labelled contact sheet of the candidate theme folder at
3–4× with index numbers. *Look at it.* This step catches fragments and
mis-themed folders and takes two minutes.

```bash
npm run art:contact-sheets
```

**3 — Verify candidates.** For each single: real dimensions from `identify`,
render at 4× on the intended floor, confirm it is complete and correctly
categorised. Test multi-part assemblies as an assembly.

**4 — Pair the shell.** Choose floor and wall; compute both luminances; confirm
Δ ≥ 40. Do not proceed on a smaller delta.

**5 — Draft the recipe.** Integer tiles. Wall bands on far edges, faces
elsewhere. Wall-mounted at y≤1. Reserved anchors clear. Comment every
deliberate emptiness.

**6 — Compose.**

```bash
npm run art:curate
```

The curator validates extents and checks every committed size against the real
PNG. A failure here is a real defect — fix the recipe, never the check.

**7 — Look at the output.** Render the composite at 3× and inspect it. Then
montage it against its siblings and confirm it is not interchangeable with them.

**8 — Verify in the running app.** Not just the PNG — the graded, scaled,
animated result.

```bash
npm run test:browser:art
```

**9 — Check motion.** Confirm phases differ, travel is locked to the sheet rate,
and reduced motion parks on the intended pose.

**10 — Run the checklist** (§34) and the suites.

```bash
npx tsc --noEmit && npx vitest run
```

**11 — Record.** Update `BRB_ART_INVENTORY.md` (source, crop, hash, usage), add
the pack ID to `credits.ts`, note player-visible changes in `CHANGELOG.md`.

**Correction loop.** When something looks wrong, diagnose in this order:
*source* (wrong or fragmentary single) → *shell* (contrast, missing wall band) →
*placement* (wall object on the floor, scatter) → *grade* → *motion*. Fixing a
grade to compensate for a bad source is the most common wasted effort.

---

## Part XII — Worked examples

### 36. The facility, before and after

**Before:** 22×14 room, one flat interior wall tile as a 1-tile border, a
diagonally-striped carpet, two table end caps butted into a blob, two angled
corner leaves floating on open floor, a catering counter as a workstation, and
an entirely empty 8×5 chamber.

**After, and the specific decisions that did the work:**

| Change | Effect |
| --- | --- |
| Far edge → full crown band; sides/near → flat face | Room read as architecture for the first time |
| Floor `(128,272)` diagonal carpet → `(128,544)` grey tile | Removed the moiré; raised Δlum against slate from 18 to **65** |
| Table end caps → cap + 2 middles + cap | A believable 6-tile conference table instead of a blob |
| Corner leaves deleted; consoles `29`–`32` added at y=1 | Floating slivers became a monitor console bank on the wall |
| Rec-room props → Modern Exteriors worksite stock | Material stacks and toolboxes instead of pool tables |
| Divider stops above row 11 | Courier's 17-tile crossing stays walkable |
| Chamber left bare, with a comment | Reads as an unbuilt sealed project, not an oversight |

### 37. The courier

```
before:  steps(17) over 4.8s   →  16px hop every 282ms  vs  6 frames @ 8fps
after:   steps(68) over 6.8s   →   4px step every 100ms vs  6 frames @ 10fps
```

One position step per sheet frame; 24px — one and a half tiles — per stride
cycle. The figure walks instead of teleporting. Verified live:
travel `6.8s steps(68)`, walk `0.6s steps(6)`.

### 38. Room identity

Nine rooms, previously interchangeable, now separated by shell pairing plus one
signature element each:

| Room | Floor | Wall | Signature |
| --- | --- | --- | --- |
| Facility | mid-grey tile | slate | Console far wall + partitioned wings |
| Intake | dark grey tile | pale | Wall map over a single intake desk |
| Records | dark grey tile | pale | Rows 2–4 reserved for growing shelves |
| Continuity | mid-grey tile | slate | Six-console far wall |
| Oversight | dark grey tile | pale | Raised bench, broadcast rig, public seating |
| Secure briefing | mid-grey tile | slate | One screen, sealed storage, no public seats |
| Infrastructure | pale concrete | slate | Material stacks, cones, no seating |
| Corporate | dark wood | warm | Long table, wood floor, no consoles |
| Civic gate | pale concrete | slate | Fence line across the room, open near edge |

Ending tableaux carry their own silhouette on top of the room they reuse:
corporate capture is bright and gold, collapse is dark and empty, and an advisor
takeover is dark and **full** with one or two lit stations.

### 39. The contrast fix, in numbers

Every room previously used the same floor (lum 142.8) against the same wall
(lum 135.1): **Δ 7.7**, nine times over.

| Room group | Before | After | Pairing now |
| --- | ---: | ---: | --- |
| Facility / continuity / secure briefing | Δ7.7 | **Δ65** | mid-grey tile 159 + slate 94 |
| Intake / records / oversight | Δ7.7 | **Δ92** | dark grey tile 112 + pale 204 |
| Corporate | Δ7.7 | **Δ111** | dark wood 80 + warm 191 |
| Infrastructure / civic gate | Δ7.7 | **Δ87** | pale concrete 181 + slate 94 |

This is the clearest lesson in the document. The walls were present, correctly
composited and fully covered by tests — and invisible. Neither the test suite nor
a glance at the screen caught it; only measuring did. A first repair pass that
added wall styles *without* measuring landed a pale-on-pale Δ6 and would have
shipped the same defect wearing a better implementation.
