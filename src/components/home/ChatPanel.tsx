import { chatMessages } from "../../mock/chat";
import { ChatMessageItem } from "../ui/ChatMessageItem";
import { PanelCard } from "../ui/PanelCard";

export function ChatPanel() {
  return (
    <PanelCard
      title="Room Chat"
      description="Mock messages only. Sending is not connected yet."
    >
      <ul className="space-y-2">
        {chatMessages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
          readOnly
        />
        <button
          type="button"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Send
        </button>
      </div>
    </PanelCard>
  );
}
