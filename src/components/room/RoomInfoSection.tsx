import { Link } from "react-router-dom";
import type { Room } from "../../types/room";
import { StatusBadge } from "../ui/StatusBadge";

interface RoomInfoSectionProps {
  room: Room;
}

export function RoomInfoSection({ room }: RoomInfoSectionProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link to="/rooms" className="text-sm font-medium text-zinc-500">
            Back to rooms
          </Link>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={room.mode === "edit" ? "Editor Room" : "Play Room"}
              tone={room.mode === "edit" ? "accent" : "success"}
            />
            <StatusBadge
              label={room.status === "running" ? "Running" : "Waiting"}
              tone="neutral"
            />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              {room.name}
            </h1>
            <p className="mt-2 text-base leading-7 text-zinc-600">
              Static room detail view with room info, player list, board placeholder,
              and local chat state.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm sm:min-w-[320px]">
          <div>
            <dt className="text-zinc-500">Room ID</dt>
            <dd className="mt-1 font-medium text-zinc-900">{room.id}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Players</dt>
            <dd className="mt-1 font-medium text-zinc-900">
              {room.playerCount}/{room.maxPlayers}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Game</dt>
            <dd className="mt-1 font-medium text-zinc-900">{room.gameName}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Map</dt>
            <dd className="mt-1 font-medium text-zinc-900">{room.mapName}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
