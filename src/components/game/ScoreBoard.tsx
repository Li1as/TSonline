import type { SimpleCardDemoState } from "../../types/game";

interface ScoreBoardProps {
  players: SimpleCardDemoState["players"];
  currentUserId?: string;
  currentPlayerId?: string | null;
}

export function ScoreBoard({
  players,
  currentUserId,
  currentPlayerId,
}: ScoreBoardProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-900">Players</h3>
      <ul className="mt-3 space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            <div className="font-medium text-zinc-900">
              {player.name}
              {player.id === currentUserId ? " (You)" : ""}
            </div>
            <div className="text-xs text-zinc-500">
              {player.handCount} cards • {player.score} points
              {player.id === currentPlayerId ? " • Current turn" : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
