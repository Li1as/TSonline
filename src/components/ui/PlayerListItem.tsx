import type { Player } from "../../types/player";

interface PlayerListItemProps {
  player: Player;
}

export function PlayerListItem({ player }: PlayerListItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-zinc-100 px-3 py-2">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: player.color }}
        />
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {player.name}
            {player.isHost ? " (Host)" : ""}
          </p>
          <p className="text-xs text-zinc-500">{player.seat}</p>
        </div>
      </div>
      <span
        className={`text-xs font-medium ${
          player.isOnline ? "text-emerald-600" : "text-zinc-400"
        }`}
      >
        {player.isOnline ? "Online" : "Offline"}
      </span>
    </li>
  );
}
