import { useAppState } from "../../state/AppContext";
import type { CardInstance, SimpleCardDemoState } from "../../types/game";
import type { Room } from "../../types/room";
import { DiscardPile } from "./DiscardPile";
import { PlayerHand } from "./PlayerHand";
import { RoundInfo } from "./RoundInfo";
import { ScoreBoard } from "./ScoreBoard";

interface SimpleCardDemoTableProps {
  room: Room;
}

export function SimpleCardDemoTable({ room }: SimpleCardDemoTableProps) {
  const {
    currentUser,
    gameStatesByRoom,
    getPlayersForRoom,
    errorMessage,
    isConnected,
    startNewGame,
    playCard,
  } = useAppState();
  const gameState = gameStatesByRoom[room.id] as SimpleCardDemoState | undefined;
  const players = getPlayersForRoom(room.id);
  const isRoomInvalid = room.status === "invalid";
  const canStart = !isRoomInvalid && isConnected && players.length === 2;
  const currentTurnPlayer = gameState?.players.find(
    (player) => player.id === gameState.currentPlayerId,
  );
  const roundLeader = gameState?.players.find(
    (player) => player.id === gameState.roundLeaderId,
  );
  const gameWinner = gameState?.players.find(
    (player) => player.id === gameState.winnerId,
  );
  const isMyTurn =
    !isRoomInvalid &&
    Boolean(currentUser?.id) &&
    gameState?.phase === "playing" &&
    gameState.currentPlayerId === currentUser?.id;
  const canPlayCard = (card: CardInstance) => {
    if (!isMyTurn || !gameState) {
      return false;
    }
    const leadCard = gameState.currentRoundPlays[0]?.card;
    if (!leadCard) {
      return true;
    }
    const hasLeadSuit = gameState.myHand.some((item) => item.suit === leadCard.suit);
    return !hasLeadSuit || card.suit === leadCard.suit;
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-zinc-500">Simple Card Demo</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">{room.name}</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {gameState?.phase ?? "not_started"} • {players.length}/2 players
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900">
            Turn: {currentTurnPlayer?.name ?? "Not started"}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Round {gameState?.roundNumber ?? 0} • Leader:{" "}
            {roundLeader?.name ?? "Not started"}
          </p>
          {isRoomInvalid ? (
            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {room.invalidReason ?? "This room uses an outdated game definition."}
            </p>
          ) : null}
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
          {gameState?.phase === "finished" ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Game finished. Winner: {gameWinner?.name ?? "Player"}.
            </div>
          ) : null}
          <DiscardPile cards={gameState?.discardPile ?? []} />
          <PlayerHand
            cards={gameState?.myHand ?? []}
            canPlay={isMyTurn}
            canPlayCard={canPlayCard}
            onPlayCard={(cardId) => playCard(room.id, cardId)}
          />
          {errorMessage || gameState?.lastError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage || gameState?.lastError}
            </div>
          ) : null}
        </div>

        <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <ScoreBoard
            players={
              gameState?.players ??
              players.map((player) => ({
                id: player.id,
                name: player.name,
                handCount: 0,
                score: 0,
              }))
            }
            currentUserId={currentUser?.id}
            currentPlayerId={gameState?.currentPlayerId}
          />
          <RoundInfo gameState={gameState} />
        </aside>
      </div>
    </section>
  );
}
