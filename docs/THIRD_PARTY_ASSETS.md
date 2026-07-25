# Third-Party Assets

This record covers assets copied into the BRB repository. Development packages remain recorded in `package.json` and `package-lock.json`.

## Fonts

Only upright Latin WOFF2 files for weights used by the current interface are included.

| Asset | Included weights | Source | Local license |
| --- | --- | --- | --- |
| Barlow Condensed | 400, 500, 600, 700, 800 | [Barlow](https://github.com/jpt/barlow), distributed as `@fontsource/barlow-condensed` 5.3.0 | [OFL 1.1](../public/licenses/fonts/Barlow-OFL-1.1.txt) |
| IBM Plex Sans | 400, 500, 600, 700 | [IBM Plex](https://github.com/IBM/plex), distributed as `@fontsource/ibm-plex-sans` 5.3.0 | [OFL 1.1](../public/licenses/fonts/IBM-Plex-OFL-1.1.txt) |
| IBM Plex Mono | 400, 500, 600, 700 | [IBM Plex](https://github.com/IBM/plex), distributed as `@fontsource/ibm-plex-mono` 5.3.0 | [OFL 1.1](../public/licenses/fonts/IBM-Plex-OFL-1.1.txt) |

The font packages are not runtime or development dependencies. Their selected files are self-hosted through `next/font/local`, preserving BRB's existing font CSS variables.

## Game art (LimeZu — not committed)

BRB's pixel art comes from **LimeZu** (https://limezu.itch.io): the *Modern Interiors*, *Modern Exteriors*, and *Character Generator* **full-version** packs. Credit to LimeZu (limezu.itch.io) is required by their license.

These packs are **never committed to this repository.** The full-version license permits commercial use but **prohibits redistribution**, and this repo is public. The handling model:

- Purchased source packs live locally under `BRB Assets/` (gitignored); they are the local source of truth and are never committed.
- Curated, game-ready runtime art lives under `public/assets/brb/` (gitignored) and is **injected at deploy from private storage**, not committed.
- The existing CSS placeholders in `src/components/brb/control-room/` remain as fallbacks when runtime art is unavailable (fresh clones, CI, deploys without injection).

Only the full-version packs may ship. The free-version LimeZu folders (`Characters_free/`, `Interiors_free/`, `Old/`) are non-commercial-only and must not be used in shipped art.

## Approved but not included

[Kenney UI Audio](https://www.kenney.nl/assets/ui-audio) is reserved for Phase 3. If adopted, copy only 6–8 approved CC0 sounds and record their filenames here; do not import the complete pack or add an audio library.
