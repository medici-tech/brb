# BRB Art Inventory

Audited 2026-07-30 against the locally supplied LimeZu pack. Licensed source and
runtime PNGs are gitignored; this document records provenance without redistributing
the artwork.

## Curated runtime set

All files are PNGs with stripped metadata. “Alpha” means the file contains transparent
pixels. SHA-256 hashes are for duplicate detection and should change only when a source
selection or crop deliberately changes. Re-run `npm run art:curate` after pulling
manifest or curator changes, then refresh hashes below from the gitignored outputs.

| Semantic key | Supplied source or crop | Runtime destination | Output / frames | SHA-256 | React/CSS use | Narrow treatment |
| --- | --- | --- | --- | --- | --- | --- |
| `monitorScreens` | `animated_control_room_screens.png` | `control-room/monitors/control-room-screens.png` | 704×48; 11 × 64×48 | `8a5961618ceb7d967914bdf2d4ef08169a87b669fe2989da3510aeaa674606ef` | `AmbientMonitorWall`, full screen bank | 2× on tablet and in the cropped mobile framing |
| `monitorServer` | `animated_control_room_server.png` | `control-room/monitors/control-room-server.png` | 48×48; 3 × 16×48 | `0b6216c85dacd058d22a482d65ea55f409c91681d8596b73ea2715ba1e363a13` | `AmbientServerRack`, floor furniture | Hidden below 650px |
| `staffAnalystIdle` | `Premade_Character_01.png`, crop 96×32+0+32 | `control-room/staff/analyst-idle.png` | 96×32; 6 × 16×32 | `678b6b8469c4a939f0f9b64be7d2c4a0e6618b201aa1eb5a567f5236f440c280` | `AmbientStaff` Analysis station | Kept at 2× in the mobile band |
| `staffOperatorIdle` | `Premade_Character_02.png`, crop 96×32+0+32 | `control-room/staff/operator-idle.png` | 96×32; 6 × 16×32 | `4a8ceb34bba7eabf6404f06fb97a9b926f520fca04219a073b348bb197b8e5f8` | `AmbientStaff` Operations station | Kept at 2× in the mobile band |
| `staffStewardIdle` | `Premade_Character_03.png`, crop 96×32+0+32 | `control-room/staff/steward-idle.png` | 96×32; 6 × 16×32 | `0c8f88dc45574b92ccfdabcb95f6bc4d10b959aff956f42a5f7f2f297ceadce9` | `AmbientStaff` Institutions station, desk-occluded | Hidden at narrow widths |
| `staffCrossingWalkRight` | `Premade_Character_04.png`, crop 96×32+0+128 | `control-room/staff/crossing-walk-right.png` | 96×32; 6 × 16×32 | `5b891f58fdf0292d8e10e029f65fe7d7497bf477947c5a31f8412d2484b52962` | One-way left→right courier | Decorative travel freezes for reduced motion |
| `staffCrossingWalkLeft` | `Premade_Character_04.png`, crop 96×32+0+160 | `control-room/staff/crossing-walk-left.png` | 96×32; 6 × 16×32 | `eedeb0276898eb1059d7c4c0cae96d1f6e34359614bd8c3c0a99c56e5abf98e7` | One-way right→left courier | Decorative travel freezes for reduced motion |
| `envSecurityCamera` | `animated_security_camera_right.png`, endpoint frames repeated to match the GIF | `control-room/environment/security-camera.png` | 288×16; 18 × 16×16 at 10 fps | `bb6f68d33389db11a17fd03b0aeed9be94acaa10d3b957ba1b5aed5a99140a2d` | `AmbientRoomSurfaces`, back wall | Hidden below 900px |
| `envConferenceDesk` | `Conference_Hall_Singles_32.png` | `control-room/environment/conference-desk.png` | 16×32; static | `19f22b96cde2b9301f0cb2882a0074eed3ef9dd5840b7d6aec79b6a8f66dce64` | Lectern occludes the courier | Hidden below 900px |
| `envFloor` | `Room_Builder_Floors_16x16.png`, crop 16×16+192+256 | `control-room/environment/floor.png` | 16×16; static | `ebe0ec3f12952f4fbc34ab094a26657a1a17a09467a3ece1d85c3120f5e63641` | Tiled floor | Cropped behind the 232px mobile band |
| `envWall` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+492 | `control-room/environment/wall.png` | 16×16; static | `6139da6bf96814ed8a547b9e7bea53186115b2d17fdd78605524211111a83efd` | Tiled wall | Cropped behind the 232px mobile band |
| `envOversightBroadcast` | `animated_TV_reportage.png` | `control-room/narrative/oversight-broadcast.png` | 1152×32; 24 × 48×32 | `5ca128397fe04acd99997191d0273c3d0eca4a798d3a0e97f3dd3a9ae6311861` | Oversight broadcast camera | 2× prop inside the responsive scene |
| `envSecureSafe` | `animated_safe_empty.png` | `control-room/narrative/secure-safe.png` | 96×32; 6 × 16×32 | `e5ff73c95d6d5b6c25624ed21fddf1f4a16510964507f8da8a87384db3a4d3` | Secure briefing evidence safe | 2× prop inside the responsive scene |
| `envInfrastructureToolbox` | `Worksite_toolbox_full_16x16.png`, endpoint holds preserved | `control-room/narrative/infrastructure-toolbox.png` | 704×48; 22 × 32×48 | `3cf75adadbd83156d166e53105965c88144feaf211fe05f1dbf735ae45b9a8a9` | Infrastructure generator and work lights | 2× prop inside the responsive scene |
| `envCorporateDoor` | `Office_Door_Lime_Corp_1_16x16.png`, endpoint holds preserved | `control-room/narrative/corporate-door.png` | 1056×32; 22 × 48×32 | `32b36230172899032319a8bbda5f3327558a7ec6b6e9a93984fc263a31f349f2` | Corporate suite seal / door | 2× prop inside the responsive scene |
| `envCivicBarrier` | `Automatic_Barrier_1_16x16.png`, endpoint holds preserved | `control-room/narrative/civic-barrier.png` | 1760×80; 22 × 80×80 | `8c269409060aae6bb69b644c301df5aa70669e7d01a90296444f0911128f89b8` | Civic perimeter barriers | 1× prop inside the responsive scene |

The curated payload hashes must remain distinct after `npm run art:curate`. CSS `steps()`
playback can freeze for reduced motion, while GIF playback cannot.

## Screen audit and missing states

| Surface | Decision |
| --- | --- |
| Start / doctrine selection | No suitable supplied character or dossier artwork. Keep the readable cards; do not imply that ambient staff sprites are the player director. |
| Campaign Situation workspace | Use the complete layered control-room set as a subdued frame behind the Situation file. Gameplay text and controls remain DOM content above it. |
| Advisor consultation | No advisor portraits in the supplied pack. Keep names, meters, quotes, and controls text-first. Ambient station labels are Analysis / Operations / Institutions, not advisor names. |
| Aftermath dialog | Use deterministic three-quarter top-down scenes assembled from the curated actors and five location props. Keep the linked written consequence beside every visual beat. |
| Report and Archive | No suitable supplied report photography. Preserve dossier typography and classified silhouettes. |
| Playtest Journal | No suitable art; this remains an internal evidence tool. |

Known missing states:

- `staffStewardIdle` is deliberately named for its actual source strip. The station
  front occludes its lower body to create the seated read without mislabeling the art.
- There are no advisor/director portraits and no narrow-screen portrait crops.
- Below 650px, standby uses a 232px in-flow band with the screen wall and two staff.
  An active Situation uses a separate 120px monitor-only header. The server, camera,
  desk, crossing figure, and advisor stations are removed so the Situation brief and
  choices remain dominant. These are approved presentation states, not missing images.
- CSS silhouettes and room colors remain the required fallback when private art is absent.

## Display and state matrix

| Layout | Monitor wall | Staff / props | Framing |
| --- | ---: | --- | --- |
| Desktop | 4× | 3× | Full 16:10 diorama with 6× foreground silhouettes |
| Tablet | 2× | 2× | Foreground figures removed; reduced light pools |
| Narrow standby | 2× | 2× | 232px two-staff band |
| Narrow Situation | 2× | Hidden | 120px monitor header |

Room history is presentation-only: campaign age changes paper load; the consulted
advisor or Situation type chooses the lit station; BRB readiness increases chamber
and table light; Corporation pressure promotes the private overlay; ending IDs select
one of four final tableaux. Canonical state also derives persistent emergency,
institutional, Corporation, construction, advisor, and route marks. The marks are not
saved as a second state model.

## Visual verification record

Reviewed locally at 1440×1100, tablet width, and 390×844 with licensed art present,
plus the assetless CSS fallback. Captures remain in ignored `output/playwright/`.

- **No P0/P1 issues:** Situation controls, ending report action, keyboard focus, and
  narrow overflow remained usable; axe reported no violations.
- **Shipped · narrative locations:** six reusable locations now cover every Situation
  choice, ignored outcome, and major commitment subtype through three player-stepped beats.
- **Resolved · asset semantics:** the Steward uses an accurately named idle strip,
  with furniture occlusion providing the seated read.
- **P2 · art direction:** advisor/director portraits and narrow portrait crops remain
  unavailable in the supplied pack. Keep these surfaces text-first.
- **P3 · presentation:** the assetless foreground uses simplified CSS silhouettes;
  this is intentional fallback degradation, not a licensing workaround.
