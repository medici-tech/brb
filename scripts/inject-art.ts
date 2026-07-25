/**
 * Deploy-time art injection (build step, env-gated).
 *
 * Runs automatically as the `prebuild` npm hook. By DEFAULT it is a no-op: when no
 * private art source is configured it logs and exits 0, so the app builds without
 * the redistribution-restricted LimeZu assets and the CSS control-room placeholders
 * render as fallbacks. This keeps the public repo buildable in CI with
 * `public/assets/brb/` absent.
 *
 * When `BRB_ART_SOURCE` is set (e.g. a private Vercel Blob base URL or a local path
 * to a curated tree), this is where a deploy would fetch/copy the curated art into
 * `public/assets/brb/` before `next build` runs. The actual transfer is intentionally
 * left as a documented TODO so no network/storage dependency is baked into the
 * default build — see docs/BRB_ART_PIPELINE.md.
 */

import { existsSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const ART_TARGET = path.join(PROJECT_ROOT, "public", "assets", "brb");
const SOURCE = process.env.BRB_ART_SOURCE?.trim();

function main(): void {
  if (!SOURCE) {
    if (existsSync(ART_TARGET)) {
      console.error(
        "[inject-art] BRB_ART_SOURCE unset; using existing public/assets/brb/ (local curation).",
      );
    } else {
      console.error(
        "[inject-art] BRB_ART_SOURCE unset and no local art present — building with CSS fallbacks.",
      );
    }
    return;
  }

  // TODO(art-pipeline): implement the private fetch/copy here.
  //   - Vercel Blob:   fetch `${BRB_ART_SOURCE}/<manifest-path>` for each manifest
  //                    entry and write it under public/assets/brb/... (auth via a
  //                    build-only token env var, never committed).
  //   - Local path:    recursively copy `${BRB_ART_SOURCE}` → public/assets/brb/.
  // Kept as a stub so the default build has zero network/storage dependencies.
  console.error(
    `[inject-art] BRB_ART_SOURCE='${SOURCE}' detected, but injection is a documented ` +
      "TODO (see docs/BRB_ART_PIPELINE.md). Proceeding without injecting.",
  );
}

main();
