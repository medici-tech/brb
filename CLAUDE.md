# BRB Project Instructions

## Product

BRB: Big Red Button is a turn-based political strategy/resource sim. The core mechanic is locked resource deposits into BRB tracks. The player must choose between surviving crises and advancing toward victory.

## Core Rules

- BRB progress must come from deposits, not passive progress.
- Deposits permanently spend active resources.
- Each turn the player chooses one main action.
- Advisor relationships use Loyalty, Alignment, and Leverage.
- Loyalty cannot be easily maxed.
- Money can buy temporary cooperation, not loyalty.
- Advisors become more powerful when used.
- High leverage should create future danger.

## Code Style

- Use TypeScript strictly.
- Keep game logic in `src/game`.
- Keep content data in `src/data`.
- Keep components mostly presentational.
- Avoid giant components.
- Avoid hardcoded balance numbers inside UI components.
- Prefer clear names over clever abstractions.

## Verification

Before finishing any task:

- Run build.
- Fix TypeScript errors.
- Confirm the core loop still works.
- Summarize changed files and behavior.
