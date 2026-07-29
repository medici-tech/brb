# BRB Art Inventory

Audited 2026-07-29 against the locally supplied LimeZu pack. Licensed source and
runtime PNGs are gitignored; this document records provenance without redistributing
the artwork.

## Curated runtime set

All files are PNGs with stripped metadata. “Alpha” means the file contains transparent
pixels. SHA-256 hashes are for duplicate detection and should change only when a source
selection or crop deliberately changes.

| Semantic key | Supplied source or crop | Runtime destination | Output / frames | Alpha | Bytes | SHA-256 | React/CSS use | Narrow treatment |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `monitorScreens` | `3_Animated_objects/16x16/spritesheets/animated_control_room_screens.png` | `control-room/monitors/control-room-screens.png` | 704×48; 11 × 64×48 | Yes | 1,413 | `8a5961618ceb7d967914bdf2d4ef08169a87b669fe2989da3510aeaa674606ef` | `AmbientMonitorWall`, full screen bank | 1× on tablet; 2× in the cropped 232px mobile band |
| `monitorServer` | `3_Animated_objects/16x16/spritesheets/animated_control_room_server.png` | `control-room/monitors/control-room-server.png` | 48×48; 3 × 16×48 | Yes | 444 | `0b6216c85dacd058d22a482d65ea55f409c91681d8596b73ea2715ba1e363a13` | `AmbientServerRack`, floor furniture | Hidden below 650px |
| `staffAnalystIdle` | `Premade_Character_01.png`, crop 96×32+0+32 | `control-room/staff/analyst-idle.png` | 96×32; 6 × 16×32 | Yes | 488 | `678b6b8469c4a939f0f9b64be7d2c4a0e6618b201aa1eb5a567f5236f440c280` | `AmbientStaff`, Analysis station | Kept at 2× in the mobile band |
| `staffOperatorIdle` | `Premade_Character_02.png`, crop 96×32+0+32 | `control-room/staff/operator-idle.png` | 96×32; 6 × 16×32 | Yes | 505 | `4a8ceb34bba7eabf6404f06fb97a9b926f520fca04219a073b348bb197b8e5f8` | `AmbientStaff`, Operations station | Kept at 2× in the mobile band |
| `staffStewardSeated` | `Premade_Character_03.png`, crop 96×32+0+32 | `control-room/staff/steward-seated.png` | 96×32; 6 × 16×32 | Yes | 467 | `0c8f88dc45574b92ccfdabcb95f6bc4d10b959aff956f42a5f7f2f297ceadce9` | `AmbientStaff`, Institutions station | Hidden at narrow widths; see missing states |
| `staffCrossingWalk` | `Premade_Character_04.png`, crop 96×32+0+64 | `control-room/staff/crossing-walk.png` | 96×32; 6 × 16×32 | Yes | 526 | `213fee1d11dd68dfcb0328276b56b4c70ca638072b837bc6dcda3e96c4675133` | `AmbientStaff`, floor crossing | Decorative travel freezes for reduced motion |
| `envSecurityCamera` | `3_Animated_objects/16x16/spritesheets/animated_security_camera_right.png` | `control-room/environment/security-camera.png` | 160×16; 10 × 16×16 | Yes | 416 | `39533e8b2dcc9977cb7166c11bf839000f6059bb967450db43f88bbd5bae68b7` | `AmbientRoomSurfaces`, back wall | Hidden below 900px |
| `envConferenceDesk` | `13_Conference_Hall_Singles/Conference_Hall_Singles_32.png` | `control-room/environment/conference-desk.png` | 16×32; static | Yes | 234 | `19f22b96cde2b9301f0cb2882a0074eed3ef9dd5840b7d6aec79b6a8f66dce64` | `AmbientConferenceDesk`, operations table | Hidden below 900px |
| `envFloor` | `Room_Builder_Floors_16x16.png`, crop 16×16+192+256 | `control-room/environment/floor.png` | 16×16; static | No | 227 | `ebe0ec3f12952f4fbc34ab094a26657a1a17a09467a3ece1d85c3120f5e63641` | `AmbientRoomSurfaces`, tiled floor | Cropped behind the 232px mobile band |
| `envWall` | `Room_Builder_Walls_16x16.png`, crop 16×16+16+492 | `control-room/environment/wall.png` | 16×16; static | No | 152 | `6139da6bf96814ed8a547b9e7bea53186115b2d17fdd78605524211111a83efd` | `AmbientRoomSurfaces`, tiled wall | Cropped behind the 232px mobile band |

The ten curated payload hashes are distinct. The source pack also supplies GIF and
32×32/48×48 variants of several objects; use the 16×16 PNG sprite sheets above.
CSS `steps()` playback can freeze for reduced motion, while GIF playback cannot.

## Screen audit and missing states

| Surface | Decision |
| --- | --- |
| Start / doctrine selection | No suitable supplied character or dossier artwork. Keep the readable cards; do not imply that ambient staff sprites are the player director. |
| Campaign Situation workspace | Use the complete control-room set as a subdued frame behind the Situation file. Gameplay text and controls remain DOM content above it. |
| Advisor consultation | No advisor portraits in the supplied pack. Keep names, meters, quotes, and controls text-first. |
| Aftermath dialog | No suitable evidence image. Preserve the action-to-consequence record without decoration. |
| Report and Archive | No suitable supplied report photography. Preserve dossier typography and classified silhouettes. |
| Playtest Journal | No suitable art; this remains an internal evidence tool. |

Known missing states:

- `staffStewardSeated` is currently a front-idle strip, not a true seated animation.
  Keep the stable key for compatibility, but replace the curated source when a verified
  seated strip is found.
- There are no advisor/director portraits and no narrow-screen portrait crops.
- Below 650px the room becomes a 232px in-flow band with the screen wall and two staff.
  The server, camera, desk, crossing figure, and advisor stations are removed so the
  Situation brief and choices remain dominant. This is the approved narrow presentation,
  not a missing image request.
- CSS silhouettes and room colors remain the required fallback when private art is absent.
