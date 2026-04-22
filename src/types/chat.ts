export type ChatMessageType = "chat" | "system";

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  type: ChatMessageType;
}
