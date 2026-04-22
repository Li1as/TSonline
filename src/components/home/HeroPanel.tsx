import { Link } from "react-router-dom";
import { currentRoom } from "../../mock/room";
import { StatusBadge } from "../ui/StatusBadge";

const highlights = ["Realtime Rooms", "Card Tables", "2D Map Layers"];

export function HeroPanel() {
  return (
    <section className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1.4fr)_320px] lg:p-8">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {highlights.map((item, index) => (
            <StatusBadge
              key={item}
              label={item}
              tone={index === 0 ? "success" : "accent"}
            />
          ))}
        </div>

        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-500">
            Online Tabletop Platform
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Build rooms, cards, maps, and editor tools on one shared tabletop.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            This static homepage previews a future platform for multiplayer board
            games, card systems, map-based scenes, property editing, and room chat.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/rooms"
            className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Browse Rooms
          </Link>
          <Link
            to={`/rooms/${currentRoom.id}`}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700"
          >
            Open Demo Room
          </Link>
        </div>
      </div>

      <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
          Demo Snapshot
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-zinc-500">Current room</p>
            <p className="text-lg font-semibold text-zinc-900">{currentRoom.name}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-zinc-500">Game</dt>
              <dd className="mt-1 font-medium text-zinc-900">{currentRoom.gameName}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Map</dt>
              <dd className="mt-1 font-medium text-zinc-900">{currentRoom.mapName}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Players</dt>
              <dd className="mt-1 font-medium text-zinc-900">
                {currentRoom.playerCount}/{currentRoom.maxPlayers}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mode</dt>
              <dd className="mt-1 font-medium text-zinc-900">
                {currentRoom.mode === "edit" ? "Editor" : "Play"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </section>
  );
}
