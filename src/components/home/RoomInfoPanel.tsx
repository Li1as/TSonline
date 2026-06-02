import { currentRoom, roomList } from "../../mock/room";
import { PanelCard } from "../ui/PanelCard";
import { RoomListItem } from "../ui/RoomListItem";
import { StatusBadge } from "../ui/StatusBadge";

export function RoomInfoPanel() {
  return (
    <PanelCard
      title="Room Overview"
      description="Static summary for the current room and other available spaces."
      action={
        <StatusBadge
          label={getRoomStatusLabel(currentRoom.status)}
          tone={
            currentRoom.status === "invalid"
              ? "danger"
              : currentRoom.status === "running"
                ? "success"
                : "accent"
          }
        />
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-zinc-500">Room ID</p>
          <p className="mt-1 font-semibold text-zinc-900">{currentRoom.id}</p>
        </div>
        <div className="rounded-lg bg-zinc-100 p-3">
          <p className="text-zinc-500">Mode</p>
          <p className="mt-1 font-semibold text-zinc-900">
            {currentRoom.mode === "edit" ? "Editor" : "Play"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
          Room List
        </p>
        <ul className="space-y-2">
          {roomList.map((room, index) => (
            <RoomListItem key={room.id} room={room} active={index === 0} />
          ))}
        </ul>
      </div>
    </PanelCard>
  );
}

function getRoomStatusLabel(status: "waiting" | "running" | "invalid") {
  if (status === "running") {
    return "Running";
  }
  if (status === "invalid") {
    return "Invalid";
  }
  return "Waiting";
}
