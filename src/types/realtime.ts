import type { ChatMessage } from "./chat";
import type { PublicGameState } from "./game";
import type { Player } from "./player";
import type { Room } from "./room";

export interface SnapshotPayload {
  rooms: Room[];
  playersByRoom: Record<string, Player[]>;
  messagesByRoom: Record<string, ChatMessage[]>;
  gameStatesByRoom: Record<string, PublicGameState>;
}

export interface RealtimeEvent<T = unknown> {
  type: string;
  payload?: T;
  requestId?: string;
}
