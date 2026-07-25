# BRB Art Pipeline

How purchased LimeZu pixel art flows from the source pack into the running game
**without ever committing a binary to this public repository**.

## Why this exists

- The repo is **public**. The LimeZu full-version pack is **redistribution-restricted**,
  so not a single PNG/GIF may be committed.
- The source pack (`BRB Assets/`, ~886MB, ~92k PNGs) lives **only** on the maintainer's
  machine. It is gitignored.
- The curated runtime tree (`public/assets/brb/`) is **also gitignored**. It is either
  generated locally or injected at deploy from private storage.
- The app is a static export (`output: "export"`, `images.unoptimized`). Components must
  build and run when the assets are absent — the CSS control-room placeholders and the
  `PixelSprite` fallback keep the UI intact.

## The pieces

| Piece | Path | Committed? | Role |
| --- | --- | --- | --- |
| Source pack | `BRB Assets/` | No (gitignored) | Local-only LimeZu full-version art |
| Manifest | `src/game-art/manifest.ts` | Yes | Stable semantic keys → runtime paths + frame geometry |
| Sprite primitive | `src/components/brb/pixel/PixelSprite.tsx` | Yes | Renders a sheet; animates via CSS `steps()`; falls back on 404 |
| Contact sheets | `scripts/contact-sheet.ts` | Yes (code) | Survey candidate tiles/characters locally |
| Curator | `scripts/curate-art.ts` | Yes (code) | Copy/crop selected sources → `public/assets/brb/...` |
| Injector | `scripts/inject-art.ts` | Yes (code) | `prebuild` hook; env-gated deploy injection (no-op by default) |
| Runtime art | `public/assets/brb/` | No (gitignored) | Curated sheets the browser actually loads |

The manifest is the contract. Components reference **semantic keys** (`staffAnalystIdle`,
`monitorScreens`, …), never LimeZu's source-folder names, so the pack can be reorganised
or re-curated without touching component code.

## Flow

```
BRB Assets/ (local only)
   │  scripts/contact-sheet.ts   → scratchpad/contact-sheets/*.png   (survey; gitignored)
   │  scripts/curate-art.ts      → public/assets/brb/...             (curate; gitignored)
   ▼
public/assets/brb/  ──(local dev: served directly)──────────────► browser
        ▲
        └──(deploy: scripts/inject-art.ts fetches from private storage)
```

### 1. Survey (local)

```bash
tsx scripts/contact-sheet.ts            # all candidate groups
tsx scripts/contact-sheet.ts --list     # list group names
tsx scripts/contact-sheet.ts characters-16
```

Builds labeled ImageMagick montage grids into `scratchpad/contact-sheets/` so a human can
pick the right premade characters, monitors, and tiles. Requires the pack + ImageMagick.

### 2. Curate (local)

```bash
tsx scripts/curate-art.ts               # or: npm run art:curate
tsx scripts/curate-art.ts staffAnalystIdle staffOperatorIdle
```

Copies/crops the selected sources into `public/assets/brb/...` under the manifest's stable
filenames (e.g. crops a 96×32 single-facing strip out of a wider premade sheet). Idempotent
and provenance-logged. The `CURATION` table in `scripts/curate-art.ts` mirrors the manifest
keys one-for-one.

### 3. Deploy injection (option 2 — private storage, not committed)

For deploys, `public/assets/brb/` is **injected from private storage** rather than committed.
`scripts/inject-art.ts` runs automatically as the `prebuild` npm hook:

- **`BRB_ART_SOURCE` unset (default / public CI):** no-op. Logs and exits 0. The build
  proceeds with no assets and the CSS/`PixelSprite` fallbacks render. This is the condition
  verified in CI (`npm run build` with `public/assets/brb/` absent).
- **`BRB_ART_SOURCE` set (deploy):** the intended place to fetch the curated tree from a
  private **Vercel Blob** bucket (or copy from a local path) into `public/assets/brb/` before
  `next build`. Auth uses a build-only token env var that is never committed.

> **Status:** the injector is wired and safe (guaranteed no-op unless the env flag is set),
> but the actual private fetch/copy is a **TODO** in `scripts/inject-art.ts`. It is left as a
> stub so the default build carries **zero** network/storage dependencies. Implement the Blob
> fetch (or local copy) there when the private bucket is provisioned.

## Fallback guarantee

`PixelSprite` mounts an offscreen probe `<img>` for each sheet. If the sheet 404s (assets
absent), it renders the provided `fallback` instead of a broken sprite; the existing CSS
control-room placeholders remain the fallbacks. Animation freezes under
`data-motion="reduced"` or `prefers-reduced-motion`. Net effect: **the app always builds and
runs, with or without the curated art.**

## How a dev refreshes local art

```bash
# 1. Ensure the LimeZu pack is at ./BRB Assets/ (never committed) and ImageMagick is installed.
# 2. (optional) survey candidates:
npm run art:contact-sheets
# 3. curate into public/assets/brb/ (gitignored):
npm run art:curate            # tsx scripts/curate-art.ts
# 4. run the app; PixelSprite now loads the real sheets, fallbacks disappear.
npm run dev
```

## Frame-geometry note for curators

Character sprite geometry in the manifest assumes **16w × 32h px, 6 frames per direction**
(a single-direction idle/walk strip is 96×32). Confirm this — and the seated/walk row offsets
used by the crops in `scripts/curate-art.ts` — against
`moderninteriors-win/2_Characters/Character_Generator/Spritesheet_animations_GUIDE.png`
before trusting the placeholder crops. Monitor/animated-object frame counts and the
security-camera geometry are best-guess placeholders to tune during curation.
```
