import { useAppState } from "../../state/AppContext";
import { PanelCard } from "../ui/PanelCard";
import { PlayerListItem } from "../ui/PlayerListItem";
import { StatusBadge } from "../ui/StatusBadge";

interface RoomUsersSectionProps {
  roomId: string;
}

export function RoomUsersSection({ roomId }: RoomUsersSectionProps) {
  const { getPlayersForRoom } = useAppState();
  const players = getPlayersForRoom(roomId);

  return (
    <PanelCard
      title="Players"
      description="Room members currently tracked in frontend state."
      action={<StatusBadge label={`${players.length} Active`} tone="success" />}
    >
      <ul className="space-y-2">
        {players.map((player) => (
          <PlayerListItem key={player.id} player={player} />
        ))}
      </ul>
    </PanelCard>
  );
}
