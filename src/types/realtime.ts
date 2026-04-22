import type { ChatMessage } from "./chat";
import type { Player } from "./player";
import type { Room } from "./room";

export interface SnapshotPayload {
  rooms: Room[];
  playersByRoom: Record<string, Player[]>;
  messagesByRoom: Record<string, ChatMessage[]>;
}

export interface RealtimeEvent<T = unknown> {
  type: string;
  payload?: T;
  requestId?: string;
}
