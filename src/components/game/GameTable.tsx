import { RoomTablePlaceholder } from "../room/RoomTablePlaceholder";
import type { Room } from "../../types/room";
import { useAppState } from "../../state/AppContext";
import { GameTableRenderer } from "./GameTableRenderer";
import { SimpleCardDemoTable } from "./SimpleCardDemoTable";

interface GameTableProps {
  room: Room;
}

export function GameTable({ room }: GameTableProps) {
  const { gameStatesByRoom } = useAppState();

  if (room.mode === "play" && room.gameType === "simpleCardDemo") {
    return <SimpleCardDemoTable room={room} />;
  }

  if (room.mode === "play" && room.gameType) {
    return (
      <GameTableRenderer
        room={room}
        gameState={gameStatesByRoom[room.id]}
      />
    );
  }

  return <RoomTablePlaceholder room={room} />;
}
