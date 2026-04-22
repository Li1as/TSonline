import { players } from "../../mock/players";
import { PanelCard } from "../ui/PanelCard";
import { PlayerListItem } from "../ui/PlayerListItem";

export function PlayerPanel() {
  return (
    <PanelCard
      title="Players"
      description="Participant seats and online status for the current room."
    >
      <ul className="space-y-2">
        {players.map((player) => (
          <PlayerListItem key={player.id} player={player} />
        ))}
      </ul>
    </PanelCard>
  );
}
