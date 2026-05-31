import { RoomTablePlaceholder } from "../room/RoomTablePlaceholder";
import type { Room } from "../../types/room";
import { SimpleCardDemoTable } from "./SimpleCardDemoTable";

interface GameTableProps {
  room: Room;
}

export function GameTable({ room }: GameTableProps) {
  if (room.mode === "play" && room.gameType === "simpleCardDemo") {
    return <SimpleCardDemoTable room={room} />;
  }

  return <RoomTablePlaceholder room={room} />;
}
