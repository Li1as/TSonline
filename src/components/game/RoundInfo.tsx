import type { SimpleCardDemoState } from "../../types/game";

interface RoundInfoProps {
  gameState?: SimpleCardDemoState;
}

export function RoundInfo({ gameState }: RoundInfoProps) {
  const lastRoundWinner = gameState?.players.find(
    (player) => player.id === gameState.lastRoundResult?.winnerId,
  );

  return (
    <>
      {gameState?.lastAction ? (
        <div className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
          Last action: {gameState.lastAction.type}
        </div>
      ) : null}
      {gameState?.lastRoundResult ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Round {gameState.lastRoundResult.roundNumber}:{" "}
          {lastRoundWinner?.name ?? "Player"} won with{" "}
          {gameState.lastRoundResult.winningCard.name}.
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
                  {player?.name ?? "Player"} played {play.card.name}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No cards played this round.</p>
        )}
      </div>
    </>
  );
}
