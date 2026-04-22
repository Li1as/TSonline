import type { Room } from "../../types/room";
import { StatusBadge } from "./StatusBadge";

interface RoomListItemProps {
  room: Room;
  active?: boolean;
}

export function RoomListItem({ room, active = false }: RoomListItemProps) {
  return (
    <li
      className={`rounded-lg border px-3 py-3 ${
        active
          ? "border-indigo-200 bg-indigo-50"
          : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">{room.name}</p>
        <StatusBadge
          label={room.mode === "edit" ? "Edit" : "Play"}
          tone={room.mode === "edit" ? "accent" : "success"}
        />
      </div>
      <div className="space-y-1 text-xs text-zinc-600">
        <p>{room.gameName}</p>
        <p>
          {room.playerCount}/{room.maxPlayers} players • {room.mapName}
        </p>
      </div>
    </li>
  );
}
