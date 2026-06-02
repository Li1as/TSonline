import type { PublicGameState } from "../../types/game";
import type { Room } from "../../types/room";
import { useAppState } from "../../state/AppContext";
import { ZoneView } from "./ZoneView";

interface GameTableRendererProps {
  room: Room;
  gameState?: PublicGameState;
}

export function GameTableRenderer({ room, gameState }: GameTableRendererProps) {
  const {
    currentUser,
    gameDefinitions,
    sendGameAction,
    startNewGame,
  } = useAppState();
  const definition = gameDefinitions.find((item) => item.type === room.gameType);
  const zones = gameState?.zones ?? {};
  const handZoneId = currentUser?.id ? `hand:${currentUser.id}` : "";
  const handCards = handZoneId ? zones[handZoneId] ?? [] : [];
  const zoneEntries = Object.entries(zones).filter(([zoneId]) => zoneId !== handZoneId);
  const isRoomInvalid = room.status === "invalid";
  const isMyTurn =
    !isRoomInvalid &&
    Boolean(currentUser?.id) &&
    gameState?.phase === "playing" &&
    gameState.vars.currentPlayerId === currentUser?.id;
  const winner = gameState?.players.find((player) => player.id === gameState.winnerId);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">
            {definition?.title ?? room.gameType ?? "Game"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">{room.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {gameState?.phase ?? "not_started"} • {room.playerCount}/{room.maxPlayers} players
          </p>
          {winner ? (
            <p className="mt-1 text-sm font-medium text-emerald-700">
              Winner: {winner.name}
            </p>
          ) : null}
          {isRoomInvalid ? (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {room.invalidReason ?? "This room uses an outdated game definition."}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isRoomInvalid}
            onClick={() => startNewGame(room.id)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            New Game
          </button>
          {definition?.turn?.allowPass ? (
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => sendGameAction(room.id, { type: "round:pass" })}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              Pass
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <ZoneView
            title="Your Hand"
            cards={handCards}
            emptyText="No cards in hand."
            helperText={!isMyTurn ? "Wait for your turn." : undefined}
            layout="row"
            canPlayCard={() => isMyTurn}
            onCardClick={(card) =>
              sendGameAction(room.id, { type: "card:play", cardId: card.id })
            }
          />
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
          <h4 className="mt-4 text-xs font-semibold uppercase text-zinc-500">
            Players
          </h4>
          <ul className="mt-2 space-y-2 text-sm">
            {(gameState?.players ?? []).map((player) => (
              <li
                key={player.id}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2"
              >
                <div className="font-medium text-zinc-900">
                  {player.name}
                  {player.id === currentUser?.id ? " (You)" : ""}
                </div>
                <div className="text-xs text-zinc-500">
                  {formatAttributes(player.attributes)}
                  {player.id === gameState?.vars.currentPlayerId ? " • Current turn" : ""}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function formatAttributes(attributes?: Record<string, unknown>) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "No attributes";
  }

  return Object.entries(attributes)
    .map(([key, value]) => `${key.toUpperCase()} ${value}`)
    .join(" • ");
}
