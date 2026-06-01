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
  playedByPlayerId?: string;
  playedAt?: number;
}

export interface GameDefinition {
  type: GameType;
  title: string;
  version: number;
  players: {
    min: number;
    max: number;
    required: number;
  };
  config: {
    winScore: number;
  };
  victory?: {
    condition: "scoreAtLeast";
    scoreSource: "vars.scoresByPlayerId";
    target: "anyPlayer";
    value?: number;
    valueFrom?: "config.winScore";
  };
  zones: Array<{
    id: string;
    label: string;
    owner: "game" | "player";
    visibility: "hidden" | "owner" | "public";
    accepts: string[];
  }>;
  actions: Array<{
    type: string;
    label: string;
    description?: string;
    source?: string;
    target?: string;
    conditions?: Array<{
      type: "currentPlayerIsActor" | "followSuitIfPossible";
    }>;
    effects?: Array<
      | {
          type: "moveCard";
          from: string;
          to: string;
          cardId: string;
          recordPlayedMetadata?: boolean;
        }
      | {
          type: "moveAllCards";
          from: string;
          to: string;
        }
      | {
          type: "setVar";
          key: string;
          value: unknown;
        }
      | {
          type: "addScore";
          playerId: string;
          amount: number;
        }
      | {
          type: "setCurrentPlayer";
          playerId: string | null;
        }
    >;
  }>;
  triggers?: Array<{
    event: "CARD_PLAYED";
    when: {
      type: "zoneCountEquals";
      zone: string;
      count: number;
    };
    effects: Array<
      | {
          type: "resolveTrick";
          zone: string;
          resultKey: string;
        }
      | {
          type: "moveAllCards";
          from: string;
          to: string;
        }
      | {
          type: "setVar";
          key: string;
          value: unknown;
        }
      | {
          type: "addScore";
          playerId: string;
          amount: number;
        }
      | {
          type: "setCurrentPlayer";
          playerId: string | null;
        }
    >;
  }>;
  cardTemplates: CardTemplate[];
  ui: {
    cardDisplayFields: string[];
    showScoreboard: boolean;
    showRoundInfo: boolean;
  };
}

export interface SimpleCardDemoState {
  gameType: "simpleCardDemo";
  status: "not_started" | "ready" | "running";
  phase: "not_started" | "ready" | "playing" | "finished";
  roundId: string | null;
  zones: Record<string, CardInstance[]>;
  vars: {
    roundNumber: number;
    currentPlayerId: string | null;
    roundLeaderId: string | null;
    scoresByPlayerId: Record<string, number>;
    winnerId: string | null;
    lastRoundResult?: {
      roundNumber: number;
      winnerId: string;
      leadSuit: CardSuit;
      winningCard: CardInstance;
      plays: Array<{
        playerId: string;
        card: CardInstance;
        playedAt: number;
      }>;
    };
  };
  winnerId: string | null;
  roundNumber: number;
  roundLeaderId: string | null;
  currentPlayerId: string | null;
  currentRoundPlays: Array<{
    playerId: string;
    card: CardInstance;
    playedAt: number;
  }>;
  scoresByPlayerId: Record<string, number>;
  lastRoundResult?: {
    roundNumber: number;
    winnerId: string;
    leadSuit: CardSuit;
    winningCard: CardInstance;
    plays: Array<{
      playerId: string;
      card: CardInstance;
      playedAt: number;
    }>;
  };
  players: Array<{
    id: string;
    name: string;
    handCount: number;
    score: number;
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
