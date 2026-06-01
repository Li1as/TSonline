import type { PublicGameState } from "../../types/game";
import type { Room } from "../../types/room";
import { ZoneView } from "./ZoneView";

interface GameTableRendererProps {
  room: Room;
  gameState?: PublicGameState;
}

export function GameTableRenderer({ room, gameState }: GameTableRendererProps) {
  const zones = gameState?.zones ?? {};
  const zoneEntries = Object.entries(zones);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-medium uppercase text-zinc-500">
          {room.gameType ?? "Game"}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">{room.name}</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {gameState?.phase ?? "not_started"} • {room.playerCount}/{room.maxPlayers} players
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          {zoneEntries.length ? (
            zoneEntries.map(([zoneId, cards]) => (
              <ZoneView
                key={zoneId}
                title={zoneId}
                cards={cards}
                emptyText="This zone is empty."
                layout="wrap"
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              No game state has been initialized.
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold text-zinc-900">State</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Status</dt>
              <dd className="font-medium text-zinc-900">
                {gameState?.status ?? "not_started"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-zinc-500">Version</dt>
              <dd className="font-medium text-zinc-900">{gameState?.version ?? 0}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
