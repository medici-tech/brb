# BRB Documentation

Repository-wide player-visible and compatibility changes are summarized in the
[project changelog](../CHANGELOG.md). Detailed balance experiments remain in the simulation log.

BRB is in **Phase 2: Balance prototype — In progress**.

Use these sources in this order:

1. The TypeScript engine and tests define implemented behavior.
2. [BRB Jargon Reference and FAQ](BRB_JARGON_AND_FAQ.md) maps player language to code IDs and answers rules questions.
3. [BRB Core Design](BRB_CORE_DESIGN.md) defines the current game vision and prototype boundaries.
4. [BRB Replay Engine](BRB_REPLAY_ENGINE.md) defines seeded cards, echoes, reports, routes, and knowledge persistence.
5. [BRB Balance Targets](BRB_BALANCE_TARGETS.md) defines accepted values, current findings, and the chronological experiment record.
6. [BRB Phase Plan](BRB_PHASE_PLAN.md) defines delivery status and the next validation gate.
7. [BRB Art Direction](BRB_ART_DIRECTION.md) is binding for anything visual. Read Part 0 before touching an asset.

Supporting evidence:

- [Current-State Audit](BRB_CURRENT_AUDIT.md): latest implementation, validation, and delivery-risk review
- [BRB Simulation Run Log](BRB_SIMULATION_LOG.md): runs recorded after automatic logging was introduced
- [BRB Playtest Journal](BRB_PLAYTEST_JOURNAL.md): free-play protocol, markers, coverage, export, and `npm run replay`
- [Third-Party Assets](THIRD_PARTY_ASSETS.md): locally stored font sources, licenses, LimeZu handling, and deferred audio policy
- [BRB Art Pipeline](BRB_ART_PIPELINE.md): LimeZu curation, room composites, `PixelRoom`, narrative aftermath scenes, and deploy injection
- [BRB Art Inventory](BRB_ART_INVENTORY.md): curated keys, room bases, hashes, and screen matrix
- [BRB Replay Baseline](BRB_REPLAY_BASELINE.json): preserved machine-readable historical baseline
- [Documentation Archive](archive/README.md): superseded GDDs and briefs retained as design history

Archived documents are not implementation guidance, even when their original titles say “canonical,” “final,” or “ready for implementation.”
