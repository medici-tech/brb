import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const displayFont = localFont({
  src: [
    { path: "./fonts/barlow-condensed-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-brb-display",
  preload: false,
});

const bodyFont = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-brb-body",
  preload: false,
});

const monoFont = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-brb-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: "BRB — Classified Campaign",
  description: "A compact political strategy prototype about what you sacrifice to finish the machine.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`dark ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body><TooltipProvider>{children}</TooltipProvider></body>
    </html>
  );
}
