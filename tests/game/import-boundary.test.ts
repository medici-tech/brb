import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const GAME_DIRECTORY = join(process.cwd(), "src", "game");
const FORBIDDEN_IMPORTS = ["react", "react-dom", "next", "next/", "@/components"];
const FORBIDDEN_GLOBALS = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bMath\.random\b/,
  /\bDate\.now\b/,
  /\bcrypto\b/,
];

function gameSourceFiles(): string[] {
  return readdirSync(GAME_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => join(GAME_DIRECTORY, entry.name));
}

describe("simulation import boundary", () => {
  it("keeps src/game independent from React, Next.js, and browser state", () => {
    const violations: string[] = [];

    for (const file of gameSourceFiles()) {
      const source = readFileSync(file, "utf8");
      for (const dependency of FORBIDDEN_IMPORTS) {
        const importPattern = new RegExp(`from ["']${dependency.replace("/", "\\/")}`);
        if (importPattern.test(source)) violations.push(`${file}: imports ${dependency}`);
      }
      for (const globalPattern of FORBIDDEN_GLOBALS) {
        if (globalPattern.test(source)) violations.push(`${file}: uses ${globalPattern.source}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
