import { PixelRoom } from "./PixelRoom";
import { ROOM_DEFINITIONS } from "./roomDefinitions";
import type { RoomActor, RoomLayer } from "./roomTypes";

type PlayerRoomSceneProps = {
  readonly variant: "intake" | "records";
  readonly ariaLabel: string;
  readonly evidenceLoad?: number;
};

export function PlayerRoomScene({
  variant,
  ariaLabel,
  evidenceLoad = 0,
}: PlayerRoomSceneProps) {
  const actors: RoomActor[] =
    variant === "intake"
      ? [
          {
            id: "intake-director",
            artKey: "staffOperatorIdle",
            position: { x: 8, y: 6 },
            motion: "idle",
          },
          {
            id: "intake-officer",
            artKey: "staffStewardIdle",
            position: { x: 4, y: 6 },
            motion: "observe",
          },
        ]
      : [
          {
            id: "records-clerk",
            artKey: "staffAnalystIdle",
            position: { x: 6, y: 6 },
            motion: "work",
          },
        ];
  const layers: RoomLayer[] =
    variant === "records"
      ? [
          {
            id: "records-evidence-a",
            kind: "evidence-load",
            artKey: "envSecureSafe",
            position: { x: 2, y: 7 },
            frameOffset: 2,
            hidden: evidenceLoad < 1,
          },
          {
            id: "records-evidence-b",
            kind: "evidence-load",
            artKey: "envSecureSafe",
            position: { x: 10, y: 7 },
            frameOffset: 4,
            hidden: evidenceLoad < 2,
          },
          {
            id: "records-equipment",
            kind: "evidence-load",
            artKey: "envInfrastructureToolbox",
            position: { x: 8, y: 5 },
            frameOffset: 7,
            hidden: evidenceLoad < 3,
          },
        ]
      : [];

  return (
    <PixelRoom
      definition={ROOM_DEFINITIONS[variant]}
      ariaLabel={ariaLabel}
      actors={actors}
      layers={layers}
      lighting="calm"
    />
  );
}
