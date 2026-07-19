import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-brb-display",
  preload: false,
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brb-body",
  preload: false,
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
