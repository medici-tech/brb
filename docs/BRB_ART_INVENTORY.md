# BRB Art Inventory

Audited 2026-07-31 against the locally supplied LimeZu pack and the orthographic
room-composite pipeline. Licensed source and runtime PNGs are gitignored; this
document records provenance without redistributing the artwork.

Room shells are assembled from a paired floor/wall set rather than a single flat
tile. Each far edge carries the complete 16×32 wall segment (crown, face,
baseboard); side and near edges carry the flat 16×16 face. Floors are paired to
wall styles by measured luminance so the shell is never the same value as the
floor it encloses.

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
| `envFloor` | `Room_Builder_Floors_16x16.png`, crop 16×16+128+544 | `control-room/environment/floor.png` | 16×16; static | `779ea34a5810a0d4905a8ab0cbbcc5ad9095acaaeaecc7e80a98661038b6608c` | Slate-walled operational rooms | Baked into room bases |
| `envFloorAdmin` | `Room_Builder_Floors_16x16.png`, crop 16×16+192+384 | `control-room/environment/floor-admin.png` | 16×16; static | `b5386065bada81ad004d04e678c9f069746513b62f209f50d01f581c0192d8e0` | Pale-walled civil rooms | Baked into room bases |
| `envFloorWood` | `Room_Builder_Floors_16x16.png`, crop 16×16+192+432 | `control-room/environment/floor-wood.png` | 16×16; static | `5f298e0db7774bca89bd35cc00cf362d3a11607513afa8386f5c65046030dff5` | Corporate suite | Baked into room bases |
| `envFloorWorks` | `Room_Builder_Floors_16x16.png`, crop 16×16+0+576 | `control-room/environment/floor-works.png` | 16×16; static | `686b025ebb11b202a441b727925b56a8b50aa09c19b8af82da8484b42f821827` | Worksite and civic perimeter | Baked into room bases |
| `envWall` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+552 | `control-room/environment/wall.png` | 16×16; static | `9dd566f52595b9e954a16acafb00dd1627b74fe026a94737ad7cb80367539260` | Slate side/near edges, partitions | Baked into room bases |
| `envWallCrown` | `Room_Builder_Walls_16x16.png`, crop 16×32+16+544 | `control-room/environment/wall-crown.png` | 16×32; static | `5dcaf28bf25d78ff010a8183fb66b4b9f222927252518801682d5fbcbf2795e9` | Slate far-edge wall band | Baked into room bases |
| `envWallPale` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+72 | `control-room/environment/wall-pale.png` | 16×16; static | `e17b86b0a36495d3beb4414b7b6d6695021eceaed9893d8a40fa8682fe9de417` | Pale side/near edges | Baked into room bases |
| `envWallPaleCrown` | `Room_Builder_Walls_16x16.png`, crop 16×32+16+64 | `control-room/environment/wall-pale-crown.png` | 16×32; static | `6378e027ac155816b05faa71e939bf43590046093e212abe85e0d638c1ffa416` | Pale far-edge wall band | Baked into room bases |
| `envWallWarm` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+360 | `control-room/environment/wall-warm.png` | 16×16; static | `7b86b1f81e3a7af433e0cb4afa102b74ddcde5e2008b0dc6fe5d7645fb106045` | Warm side/near edges | Baked into room bases |
| `envWallWarmCrown` | `Room_Builder_Walls_16x16.png`, crop 16×32+16+352 | `control-room/environment/wall-warm-crown.png` | 16×32; static | `822c4471cf0156cf2a429ae040f4a3c8c36d52038f62137736bfe553d1d2272b` | Warm far-edge wall band | Baked into room bases |
| `envRecordsShelfSparse` | `Classroom_and_Library_Singles_56.png` | `control-room/environment/records-shelf-sparse.png` | 32×48; static | `6d651b2868f3ff97eab4eaaea69f978d0d4ab6bd0d6cc45e97352c7acefd5185` | First Archive evidence shelf | 1× inside room canvas |
| `envRecordsShelfFull` | `Classroom_and_Library_Singles_57.png` | `control-room/environment/records-shelf-full.png` | 32×48; static | `bd23ec32d7b63708fdb2064291d18733e5ee1225dabc38f77f54aab28fa6a101` | Second Archive evidence shelf | 1× inside room canvas |
| `envRecordsShelfOverflow` | `Classroom_and_Library_Singles_74.png` | `control-room/environment/records-shelf-overflow.png` | 32×48; static | `f45a8f4f4d97682df08ef18ec5aa111b23367faff2b9e8a4305d91bdeee88ff1` | Third Archive evidence shelf | 1× inside room canvas |
| `envOversightBroadcast` | `animated_TV_reportage.png` | `control-room/narrative/oversight-broadcast.png` | 1152×32; 24 × 48×32 | `5ca128397fe04acd99997191d0273c3d0eca4a798d3a0e97f3dd3a9ae6311861` | Oversight-chamber `monitor-bank` prop (TV reportage strip) | 1× inside room canvas |
| `envSecureSafe` | `animated_safe_empty.png` | `control-room/narrative/secure-safe.png` | 96×32; 6 × 16×32 | `e5ff73c95d6d5b6b6c25624ed21fddf1f4a16510964507f8da8a87384db3a4d3` | Secure briefing aftermath prop | 1× inside room canvas |
| `envInfrastructureToolbox` | `Worksite_toolbox_full_16x16.png`, endpoint holds preserved | `control-room/narrative/infrastructure-toolbox.png` | 704×48; 22 × 32×48 | `3cf75adadbd83156d166e53105965c88144feaf211fe05f1dbf735ae45b9a8a9` | BRB machinery / infrastructure prop | 1× inside room canvas |
| `envCorporateDoor` | `Office_Door_Lime_Corp_1_16x16.png`, endpoint holds preserved | `control-room/narrative/corporate-door.png` | 1056×32; 22 × 48×32 | `32b36230172899032319a8bbda5f3327558a7ec6b6e9a93984fc263a31f349f2` | Corporate presence / suite prop | 1× inside room canvas |
| `envCivicBarrier` | `Automatic_Barrier_1_16x16.png`, endpoint holds preserved | `control-room/narrative/civic-barrier.png` | 1760×80; 22 × 80×80 | `8c269409060aae6bb69b644c301df5aa70669e7d01a90296444f0911128f89b8` | Civic gate aftermath prop | 1× inside room canvas |

`monitorScreens` is an 11-frame blink cycle of the same wall (small green readout
pattern changes; one dark-panel frame). It does not support six meaningful poses.
Under reduced motion the facility keeps frame 4, except advisor takeovers park on
frame 6 (sparsest readout — still powered, reporting almost nothing). See
`ControlRoomPresentation.tsx` and §I8.

### Orthographic room bases

Composites are built by `scripts/curate-art.ts` from `scripts/room-recipes.ts` using
room-builder floor tiles, wall faces, far-edge wall bands, and furniture singles.
Each base is one static frame at full source size. `curate-art.ts` verifies every
placement's committed tile size against the real PNG before compositing, so the
hand-maintained size table in `room-recipes.ts` cannot silently drift from the pack.

| Semantic key | Recipe note | Runtime destination | Source size | SHA-256 | React use |
| --- | --- | --- | --- | --- | --- |
| `roomFacility` | 22×14 continuity facility: console far wall, walled command floor, empty state-built BRB chamber, records annex, corridor | `control-room/rooms/continuity-facility.png` | 352×224 | `e35ab484bc7671621d4274b3518ba1197f08ad627322ad0a137f23b3d41c5f58` | Campaign + Ending `PixelRoom` |
| `roomIntake` | Compact federal intake office; pale walls over the admin floor | `control-room/rooms/intake-office.png` | 224×160 | `fb0960a423f14bce88389c3a6c30a04e5de28e59c956a0b2e1b2b0fab506987d` | Start operational brief |
| `roomRecords` | Evidence records office; rows 2–4 reserved for shelf state layers | `control-room/rooms/records-office.png` | 224×160 | `53a065f6e733a96c1f974982364c1b0137d88ed40011cc23ae3aecfe2164bbfb` | Report + Archive evidence scene |
| `roomContinuity` | Continuity floor: six-console far wall over the command table | `control-room/rooms/aftermath-continuity.png` | 224×160 | `9040953ca994a1f21d61b21bc42ad244da7d9e25fefac95af8215cdc48219430` | Aftermath location base |
| `roomOversight` | Oversight hearing room: bench, broadcast rig, public seating | `control-room/rooms/aftermath-oversight.png` | 224×160 | `383364e64ea5e0ebb10aeaae7cf9b1e51619ed633d5def10c6a40597605d2d5a` | Aftermath location base |
| `roomSecureBriefing` | Compartmented briefing room: one screen, sealed storage, no public seating | `control-room/rooms/aftermath-secure-briefing.png` | 224×160 | `b946a7f505113b27c1da0f7651f13d95aa701f72887675bbc2f10f6b209b1521` | Aftermath location base |
| `roomInfrastructure` | BRB infrastructure workroom: Modern Exteriors worksite stock on concrete | `control-room/rooms/aftermath-infrastructure.png` | 224×160 | `b65f5170e68f9c23b4cab3b68f5a9110711b1874f14b79ce98ced1d7c46ce965` | Aftermath location base |
| `roomCorporate` | Corporation executive suite: wood floor, warm panelling, no public kit | `control-room/rooms/aftermath-corporate.png` | 224×160 | `f58f2ea17525fe0330e75ee6d329f5e4dc2a83ae6a1e8acedd1d25d634cd1db2` | Aftermath location base |
| `roomCivicGate` | Civic perimeter gate: fence line across the room, open near edge | `control-room/rooms/aftermath-civic-gate.png` | 224×160 | `0884b5bbe0e78bc7f8ce4659de043f8190ddabdd5e719042ba51fcaeb751d029` | Aftermath location base |

The curated payload hashes must remain distinct after `npm run art:curate`. CSS `steps()`
playback can freeze for reduced motion, while GIF playback cannot.

## Screen audit and missing states

| Surface | Decision |
| --- | --- |
| Start / doctrine selection | Intake-office room (`roomIntake`) sits beside the operational brief. Doctrine and Directive cards stay text-first; ambient staff sprites are not advisor portraits. |
| Campaign Situation workspace | Fixed 22×14 continuity facility beside the Situation dossier: 2× (704×448) by default, 3× (1056×672) at ≥1600px viewports (page shell widened to 1600px at that breakpoint only). A shared command rail and external LIVE bezel connect the two surfaces. At phone widths, the complete 352×224 live room appears immediately after the masthead and before the dossier. BRB tracks sit below the top playfield. Gameplay text and controls remain DOM content outside the room. |
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
| Desktop (≥1181px) | 2× whole canvas | Facility 704×448 beside dossier; smaller rooms 448×320 |
| Narrow (≤1180px) | 1× whole canvas | Facility 352×224; below 760px the workspace leads with the complete room, then the dossier |
| Reduced motion | Same sizes | Ambient and travel animation freeze; still tableaux |

Room history is presentation-only: campaign age changes paper/clutter load; consulted
advisor or Situation type lights a localized station zone; BRB readiness replaces the
empty chamber with non-overlapping machinery stages; Corporation pressure adds persistent
physical presence while an active Corporation file may seize only a transient channel;
ending IDs select final lighting and occupancy. Canonical state also derives persistent
emergency, institutional, Corporation, construction, advisor, and route marks. The marks
are not saved as a second state model.
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
