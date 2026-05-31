import type { GameType } from "./room";

export type CardSuit = "S" | "H" | "D" | "C";
export type CardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface CardTemplate {
  templateId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  suit: CardSuit;
  rank: CardRank;
  value: number;
  props?: Record<string, unknown>;
}

export interface CardInstance extends CardTemplate {
  instanceId: string;
  id: string;
}

export interface GameDefinition {
  type: GameType;
  title: string;
  minPlayers: number;
  maxPlayers: number;
  requiredPlayers: number;
  zones: Array<{
    id: string;
    label: string;
    visibility: "owner" | "public";
  }>;
  actions: Array<{
    type: string;
    label: string;
    source?: string;
    target?: string;
  }>;
}

export interface SimpleCardDemoState {
  gameType: "simpleCardDemo";
  status: "not_started" | "ready" | "running";
  roundId: string | null;
  roundNumber: number;
  roundLeaderId: string | null;
  currentPlayerId: string | null;
  currentRoundPlays: Array<{
    playerId: string;
    card: CardInstance;
    playedAt: number;
  }>;
  players: Array<{
    id: string;
    name: string;
    handCount: number;
  }>;
  myHand: CardInstance[];
  discardPile: CardInstance[];
  lastError: string;
  lastAction?: {
    type: "game:new" | "card:play";
    playerId?: string;
    cardId?: string;
    at: number;
  };
  version: number;
}

export type PublicGameState = SimpleCardDemoState;
