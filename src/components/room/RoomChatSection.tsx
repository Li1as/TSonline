import { useState, type FormEvent } from "react";
import { useAppState } from "../../state/AppContext";
import { ChatMessageItem } from "../ui/ChatMessageItem";
import { PanelCard } from "../ui/PanelCard";

interface RoomChatSectionProps {
  roomId: string;
}

export function RoomChatSection({ roomId }: RoomChatSectionProps) {
  const { getMessagesForRoom, sendMessage, isConnected } = useAppState();
  const [draft, setDraft] = useState("");
  const messages = getMessagesForRoom(roomId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(roomId, draft);
    setDraft("");
  }

  return (
    <PanelCard
      title="Chat"
      description="Realtime room chat backed by the Node WebSocket server."
    >
      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
      </ul>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a room message"
          disabled={!isConnected}
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Send
        </button>
      </form>
    </PanelCard>
  );
}
