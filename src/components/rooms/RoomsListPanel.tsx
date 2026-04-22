import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppContext";
import { PanelCard } from "../ui/PanelCard";
import { StatusBadge } from "../ui/StatusBadge";

export function RoomsListPanel() {
  const navigate = useNavigate();
  const { rooms, joinRoom, isConnected } = useAppState();

  async function handleJoin(roomId: string) {
    const didJoin = await joinRoom(roomId);
    if (didJoin) {
      navigate(`/rooms/${roomId}`);
    }
  }

  return (
    <PanelCard
      title="Available Rooms"
      description="Inspect current room state before joining."
      action={<StatusBadge label={`${rooms.length} Rooms`} tone="accent" />}
    >
      <div className="space-y-3">
        {rooms.map((room) => (
          <article
            key={room.id}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-zinc-900">{room.name}</h3>
                  <StatusBadge
                    label={room.mode === "edit" ? "Editor" : "Play"}
                    tone={room.mode === "edit" ? "accent" : "success"}
                  />
                  <StatusBadge
                    label={room.status === "running" ? "Running" : "Waiting"}
                    tone="neutral"
                  />
                </div>
                <p className="text-sm leading-6 text-zinc-600">
                  {room.gameName} on {room.mapName}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                  <span>{room.id}</span>
                  <span>
                    {room.playerCount}/{room.maxPlayers} players
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  View
                </button>
                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={() => handleJoin(room.id)}
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Join
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PanelCard>
  );
}
