import type { ChatMessage } from "../../types/chat";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isSystem = message.type === "system";

  return (
    <li
      className={`rounded-lg px-3 py-2 ${
        isSystem ? "bg-amber-50 text-amber-900" : "bg-zinc-100 text-zinc-800"
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium">{message.user}</span>
        <span className="text-zinc-500">{message.time}</span>
      </div>
      <p className="text-sm leading-5">{message.message}</p>
    </li>
  );
}
