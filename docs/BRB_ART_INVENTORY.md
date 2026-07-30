# BRB Art Inventory

Audited 2026-07-30 against the locally supplied LimeZu pack and the orthographic
room-composite pipeline. Licensed source and runtime PNGs are gitignored; this
document records provenance without redistributing the artwork.

## Curated runtime set

All files are PNGs with stripped metadata. “Alpha” means the file contains transparent
pixels. SHA-256 hashes are for duplicate detection and should change only when a source
selection, crop, or room recipe deliberately changes. Re-run `npm run art:curate` after
pulling manifest, curator, or recipe changes, then refresh hashes below from the
gitignored outputs.

### Animated objects and staff

| Semantic key | Supplied source or crop | Runtime destination | Output / frames | SHA-256 | React use | Narrow treatment |
| --- | --- | --- | --- | --- | --- | --- |
| `monitorScreens` | `animated_control_room_screens.png` | `control-room/monitors/control-room-screens.png` | 704×48; 11 × 64×48 | `8a5961618ceb7d967914bdf2d4ef08169a87b669fe2989da3510aeaa674606ef` | Facility monitor bank layer via `PixelRoom` | Shown at whole-canvas 1× |
| `monitorServer` | `animated_control_room_server.png` | `control-room/monitors/control-room-server.png` | 48×48; 3 × 16×48 | `0b6216c85dacd058d22a482d65ea55f409c91681d8596b73ea2715ba1e363a13` | BRB chamber / machinery overlays | Shown at whole-canvas 1× |
| `staffAnalystIdle` | `Premade_Character_01.png`, crop 96×32+0+32 | `control-room/staff/analyst-idle.png` | 96×32; 6 × 16×32 | `678b6b8469c4a939f0f9b64be7d2c4a0e6618b201aa1eb5a567f5236f440c280` | Analysis workstation actor | Occupancy may hide; no crop |
| `staffOperatorIdle` | `Premade_Character_02.png`, crop 96×32+0+32 | `control-room/staff/operator-idle.png` | 96×32; 6 × 16×32 | `4a8ceb34bba7eabf6404f06fb97a9b926f520fca04219a073b348bb197b8e5f8` | Operations workstation actor | Occupancy may hide; no crop |
| `staffStewardIdle` | `Premade_Character_03.png`, crop 96×32+0+32 | `control-room/staff/steward-idle.png` | 96×32; 6 × 16×32 | `0c8f88dc45574b92ccfdabcb95f6bc4d10b959aff956f42a5f7f2f297ceadce9` | Institutions workstation actor | Occupancy may hide; no crop |
| `staffCrossingWalkRight` | `Premade_Character_04.png`, crop 96×32+0+128 | `control-room/staff/crossing-walk-right.png` | 96×32; 6 × 16×32 | `5b891f58fdf0292d8e10e029f65fe7d7497bf477947c5a31f8412d2484b52962` | Corridor courier (left→right) | Decorative travel freezes for reduced motion |
| `staffCrossingWalkLeft` | `Premade_Character_04.png`, crop 96×32+0+160 | `control-room/staff/crossing-walk-left.png` | 96×32; 6 × 16×32 | `eedeb0276898eb1059d7c4c0cae96d1f6e34359614bd8c3c0a99c56e5abf98e7` | Corridor courier (right→left) | Decorative travel freezes for reduced motion |
| `envSecurityCamera` | `animated_security_camera_right.png`, endpoint frames repeated to match the GIF | `control-room/environment/security-camera.png` | 288×16; 18 × 16×16 at 10 fps | `bb6f68d33389db11a17fd03b0aeed9be94acaa10d3b957ba1b5aed5a99140a2d` | Facility back-wall camera layer | Shown at whole-canvas 1× |
| `envConferenceDesk` | `Conference_Hall_Singles_32.png` | `control-room/environment/conference-desk.png` | 16×32; static | `19f22b96cde2b9301f0cb2882a0074eed3ef9dd5840b7d6aec79b6a8f66dce64` | Prop single / recipe furniture source | N/A at room scale |
| `envFloor` | `Room_Builder_Floors_16x16.png`, crop 16×16+128+272 | `control-room/environment/floor.png` | 16×16; static | `006f8be619116e5b46c3130ccad9a06e74fd40bbfb1b8982d5b24014c13127c1` | Room-composite floor fill | Baked into room bases |
| `envWall` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+492 | `control-room/environment/wall.png` | 16×16; static | `6139da6bf96814ed8a547b9e7bea53186115b2d17fdd78605524211111a83efd` | Room-composite wall fill | Baked into room bases |
| `envOversightBroadcast` | `animated_TV_reportage.png` | `control-room/narrative/oversight-broadcast.png` | 1152×32; 24 × 48×32 | `5ca128397fe04acd99997191d0273c3d0eca4a798d3a0e97f3dd3a9ae6311861` | Oversight aftermath prop | 1× inside room canvas |
| `envSecureSafe` | `animated_safe_empty.png` | `control-room/narrative/secure-safe.png` | 96×32; 6 × 16×32 | `e5ff73c95d6d5b6b6c25624ed21fddf1f4a16510964507f8da8a87384db3a4d3` | Secure briefing aftermath prop | 1× inside room canvas |
| `envInfrastructureToolbox` | `Worksite_toolbox_full_16x16.png`, endpoint holds preserved | `control-room/narrative/infrastructure-toolbox.png` | 704×48; 22 × 32×48 | `3cf75adadbd83156d166e53105965c88144feaf211fe05f1dbf735ae45b9a8a9` | BRB machinery / infrastructure prop | 1× inside room canvas |
| `envCorporateDoor` | `Office_Door_Lime_Corp_1_16x16.png`, endpoint holds preserved | `control-room/narrative/corporate-door.png` | 1056×32; 22 × 48×32 | `32b36230172899032319a8bbda5f3327558a7ec6b6e9a93984fc263a31f349f2` | Corporate presence / suite prop | 1× inside room canvas |
| `envCivicBarrier` | `Automatic_Barrier_1_16x16.png`, endpoint holds preserved | `control-room/narrative/civic-barrier.png` | 1760×80; 22 × 80×80 | `8c269409060aae6bb69b644c301df5aa70669e7d01a90296444f0911128f89b8` | Civic gate aftermath prop | 1× inside room canvas |

### Orthographic room bases

Composites are built by `scripts/curate-art.ts` from `scripts/room-recipes.ts` using
flat room-builder tiles and black-shadow furniture singles. Each base is one static
frame at full source size.

| Semantic key | Recipe note | Runtime destination | Source size | SHA-256 | React use |
| --- | --- | --- | --- | --- | --- |
| `roomFacility` | 22×14 continuity facility: command, BRB chamber, records annex, corridor | `control-room/rooms/continuity-facility.png` | 352×224 | `fb3d1f443f8f90f50073df972674d471666402526122c63e2904f7059a638214` | Campaign + Ending `PixelRoom` |
| `roomIntake` | Compact federal intake office | `control-room/rooms/intake-office.png` | 224×160 | `df796c59f6f4aacfbfd853fd09e50699a749a59cefe13eba45567e67017e9ebd` | Start operational brief |
| `roomRecords` | Evidence records office | `control-room/rooms/records-office.png` | 224×160 | `3209be8e33e7f64485677ebd880cbb76f236370f6ac4891411be8c3f738dfc8f` | Report + Archive evidence scene |
| `roomContinuity` | Continuity-floor aftermath | `control-room/rooms/aftermath-continuity.png` | 224×160 | `bc74a20a5ae08ce3722612f1ee00df34058597e453342e9c05ce2bdaf6d5a00d` | Aftermath location base |
| `roomOversight` | Oversight hearing room | `control-room/rooms/aftermath-oversight.png` | 224×160 | `56b05cae4b9c8e7172a9fce42c718d22975c2bb9f5bafe21d59f3b280ee7f7a5` | Aftermath location base |
| `roomSecureBriefing` | Compartmented briefing room | `control-room/rooms/aftermath-secure-briefing.png` | 224×160 | `989bc69710267689fdcad639502c90b8fa4463e5849e7339eca217cd5e20ecfb` | Aftermath location base |
| `roomInfrastructure` | BRB infrastructure workroom | `control-room/rooms/aftermath-infrastructure.png` | 224×160 | `48ffea669d2f1bda891c5e56a4274c31ffaba8bb4b74b4395e656b9b7aaf18a4` | Aftermath location base |
| `roomCorporate` | Corporation executive suite | `control-room/rooms/aftermath-corporate.png` | 224×160 | `30edbc4db8be1e463ab70aad61a1d0d7d7bb468ef209cf38f1bf233fb118aa41` | Aftermath location base |
| `roomCivicGate` | Civic-perimeter gate room | `control-room/rooms/aftermath-civic-gate.png` | 224×160 | `6f4fb4ad40046c3d28224be5dadee7b86fcc368274694f5686703e3761b37b46` | Aftermath location base |

The curated payload hashes must remain distinct after `npm run art:curate`. CSS `steps()`
playback can freeze for reduced motion, while GIF playback cannot.

## Screen audit and missing states

| Surface | Decision |
| --- | --- |
| Start / doctrine selection | Intake-office room (`roomIntake`) sits beside the operational brief. Doctrine and Directive cards stay text-first; ambient staff sprites are not advisor portraits. |
| Campaign Situation workspace | Fixed 22×14 continuity facility beside the Situation dossier (704×448 desktop / 352×224 narrow). BRB tracks sit below the top playfield. Gameplay text and controls remain DOM content outside the room. |
| Ending | Reuses the same facility camera with final damage, occupancy, Corporation presence, BRB stage, and lighting. Ending copy and Report action stay outside the room. |
| Advisor consultation | No advisor portraits in the supplied pack. Keep names, meters, quotes, and controls text-first. Facility world sprites represent Analysis / Operations / Institutions stations, not advisor portraits. |
| Aftermath dialog | Six fixed 14×10 orthographic rooms via shared recipes/`PixelRoom`. Actor and prop positions use integer tile coordinates. Setup → Action → Consequence text and controls stay below the scene; no in-room actor labels. |
| Report and Archive | Shared records-office base (`roomRecords`). Report shows completed-run evidence load; Archive fills shelves/boxes from recovered knowledge without changing Archive mechanics or odds. |
| Playtest Journal / design-system placeholders | No player-facing art requirement; leave internal tools outside the artwork scope. |
| `/dev/control-room` | Development preview of the facility and state matrix; excluded from production. |

Known missing or in-progress states:

- Advisor/director portraits remain unavailable in the supplied pack; keep those surfaces text-first.
- When private art is absent, `PixelRoom` uses a flat orthographic schematic and
  `PixelSprite` uses simple shape fallbacks — intentional degradation, not a licensing workaround.

## Display and state matrix

| Layout | Room canvas | Framing |
| --- | ---: | --- |
| Desktop (≥1101px) | 2× whole canvas | Facility 704×448 beside dossier; smaller rooms 448×320 |
| Narrow (≤1100px) | 1× whole canvas | Facility 352×224; dossier stacks above the facility below 760px |
| Reduced motion | Same sizes | Ambient and travel animation freeze; still tableaux |

Room history is presentation-only: campaign age changes paper/clutter load; consulted
advisor or Situation type may light a station; BRB readiness advances chamber machinery;
Corporation pressure adds physical presence overlays; ending IDs select final lighting and
occupancy. Canonical state also derives persistent emergency, institutional, Corporation,
construction, advisor, and route marks. The marks are not saved as a second state model.
`PresentationModel.shot` affects tempo labels only — never camera crop or layer hiding.

## Visual verification record

Reviewed locally at 1440×1100, tablet width, and 390×844 with licensed art present,
plus the assetless schematic fallback. Captures remain in ignored `output/playwright/`.

- **No P0/P1 issues:** Situation controls, ending report action, keyboard focus, and
  narrow overflow remained usable; axe reported no violations.
- **Shipped · facility:** the 22×14 orthographic continuity facility replaces the former
  layered CSS diorama, Ambient* sprites, and perspective room modules.
- **Shipped · narrative locations:** six reusable room composites and tile-grid scripts
  cover every Situation choice, ignored outcome, consultation, and major commitment subtype.
- **Shipped · supporting offices:** Start uses the intake office; Report and Archive
  share the records office with evidence load derived from completed-run knowledge.
- **Resolved · asset semantics:** the Steward uses an accurately named idle strip at a
  workstation anchor rather than a mislabeled seated crop.
- **P2 · art direction:** advisor/director portraits remain unavailable. Keep those
  surfaces text-first; use world sprites in rooms.
- **P3 · presentation:** assetless mode uses the flat orthographic schematic; this is
  intentional fallback degradation.
