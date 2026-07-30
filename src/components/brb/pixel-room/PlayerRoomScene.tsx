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
  const intake = ROOM_DEFINITIONS.intake.anchors;
  const records = ROOM_DEFINITIONS.records.anchors;
  const actors: RoomActor[] =
    variant === "intake"
      ? [
          {
            id: "intake-director",
            artKey: "staffOperatorIdle",
            position: intake.director,
            motion: "idle",
          },
          {
            id: "intake-officer",
            artKey: "staffStewardIdle",
            position: intake.officer,
            motion: "observe",
          },
        ]
      : [
          {
            id: "records-clerk",
            artKey: "staffAnalystIdle",
            position: records.clerk,
            motion: "work",
          },
        ];
  const layers: RoomLayer[] =
    variant === "records"
      ? [
          {
            id: "records-shelf-a",
            kind: "evidence-shelf",
            artKey: "envRecordsShelfSparse",
            position: records.shelfA,
            hidden: evidenceLoad < 1,
          },
          {
            id: "records-evidence-a",
            kind: "evidence-load",
            artKey: "envSecureSafe",
            position: records.evidenceA,
            frameOffset: 2,
            hidden: evidenceLoad < 1,
          },
          {
            id: "records-shelf-b",
            kind: "evidence-shelf",
            artKey: "envRecordsShelfFull",
            position: records.shelfB,
            hidden: evidenceLoad < 2,
          },
          {
            id: "records-evidence-b",
            kind: "evidence-load",
            artKey: "envSecureSafe",
            position: records.evidenceB,
            frameOffset: 4,
            hidden: evidenceLoad < 2,
          },
          {
            id: "records-shelf-c",
            kind: "evidence-shelf",
            artKey: "envRecordsShelfOverflow",
            position: records.shelfC,
            hidden: evidenceLoad < 3,
          },
          {
            id: "records-equipment",
            kind: "evidence-load",
            artKey: "envInfrastructureToolbox",
            position: records.evidenceEquipment,
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
