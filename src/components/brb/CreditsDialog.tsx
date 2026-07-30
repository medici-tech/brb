"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  getRepresentedLimeZuPacks,
  LIMEZU_ARTIST,
} from "../../game-art/credits";

export function CreditsDialog() {
  const packs = getRepresentedLimeZuPacks();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-button" type="button">Credits</button>
      </DialogTrigger>
      <DialogContent className="brb-design-system brb-console-grid max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto rounded-sm border-border bg-console text-foreground shadow-[8px_8px_0_rgba(0,0,0,0.45)]">
        <DialogHeader>
          <p className="file-label text-signal">ASSET ATTRIBUTION</p>
          <DialogTitle className="brb-display text-4xl leading-none font-semibold">
            Credits
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
            Pixel art used by BRB comes from owned LimeZu full-version packs.
            Licensed source files are never redistributed with this public build.
          </DialogDescription>
        </DialogHeader>

        <section aria-label="Art credits" className="guide-grid">
          <section>
            <strong>Artist</strong>
            <p>
              <a
                className="text-signal underline underline-offset-2"
                href={LIMEZU_ARTIST.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {LIMEZU_ARTIST.name}
              </a>
              {" "}
              · limezu.itch.io
            </p>
          </section>

          {packs.map((pack) => (
            <section key={pack.id}>
              <strong>{pack.name}</strong>
              <p>{pack.usage}</p>
              <p className="mt-2">
                <a
                  className="text-signal underline underline-offset-2"
                  href={pack.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View source on itch.io
                </a>
              </p>
            </section>
          ))}
        </section>

        <p className="guide-note">
          Only packs represented in the current runtime art manifest are listed.
          When private art is absent, CSS silhouettes replace the sheets without
          changing gameplay.
        </p>
      </DialogContent>
    </Dialog>
  );
}
