import { ChatPanel } from "./ChatPanel";
import { PlayerPanel } from "./PlayerPanel";
import { RoomInfoPanel } from "./RoomInfoPanel";

export function SidePanel() {
  return (
    <aside className="flex flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
      <RoomInfoPanel />
      <ChatPanel />
      <PlayerPanel />
    </aside>
  );
}
