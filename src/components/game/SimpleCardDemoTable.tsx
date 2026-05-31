import { useAppState } from "../../state/AppContext";
import type { Room } from "../../types/room";
import { DiscardPile } from "./DiscardPile";
import { PlayerHand } from "./PlayerHand";

interface SimpleCardDemoTableProps {
  room: Room;
}

export function SimpleCardDemoTable({ room }: SimpleCardDemoTableProps) {
  const {
    currentUser,
    gameStatesByRoom,
    getPlayersForRoom,
    isConnected,
    startNewGame,
    playCard,
  } = useAppState();
  const gameState = gameStatesByRoom[room.id];
  const players = getPlayersForRoom(room.id);
  const canStart = isConnected && players.length === 2;
  const currentTurnPlayer = gameState?.players.find(
    (player) => player.id === gameState.currentPlayerId,
  );
  const roundLeader = gameState?.players.find(
    (player) => player.id === gameState.roundLeaderId,
  );
  const isMyTurn =
    Boolean(currentUser?.id) &&
    gameState?.status === "running" &&
    gameState.currentPlayerId === currentUser?.id;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">Simple Card Demo</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">{room.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {gameState?.status ?? "not_started"} • {players.length}/2 players
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">
            Turn: {currentTurnPlayer?.name ?? "Not started"}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Round {gameState?.roundNumber ?? 0} • Leader:{" "}
            {roundLeader?.name ?? "Not started"}
          </p>
        </div>
        <button
          type="button"
          disabled={!canStart}
          onClick={() => startNewGame(room.id)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          New Game
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <DiscardPile cards={gameState?.discardPile ?? []} />
          <PlayerHand
            cards={gameState?.myHand ?? []}
            canPlay={isMyTurn}
            onPlayCard={(cardId) => playCard(room.id, cardId)}
          />
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Players</h3>
          <ul className="mt-3 space-y-2">
            {(gameState?.players ?? players.map((player) => ({
              id: player.id,
              name: player.name,
              handCount: 0,
            }))).map((player) => (
              <li
                key={player.id}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <div className="font-medium text-zinc-900">
                  {player.name}
                  {player.id === currentUser?.id ? " (You)" : ""}
                </div>
                <div className="text-xs text-zinc-500">
                  {player.handCount} cards
                  {player.id === gameState?.currentPlayerId ? " • Current turn" : ""}
                </div>
              </li>
            ))}
          </ul>
          {gameState?.lastAction ? (
            <div className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              Last action: {gameState.lastAction.type}
            </div>
          ) : null}
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
            <h4 className="text-xs font-semibold uppercase text-zinc-500">
              Current Round Plays
            </h4>
            {gameState?.currentRoundPlays.length ? (
              <ul className="mt-2 space-y-2">
                {gameState.currentRoundPlays.map((play) => {
                  const player = gameState.players.find(
                    (item) => item.id === play.playerId,
                  );
                  return (
                    <li
                      key={`${play.playerId}-${play.card.id}`}
                      className="text-sm text-zinc-700"
                    >
                      {player?.name ?? "Player"} played {play.card.label}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-500">No cards played this round.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
