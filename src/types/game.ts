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
  playConditions?: Array<{
    type: "playerAttributeBelow";
    target: "actor";
    attribute: string;
    value: number;
  }>;
  effects?: {
    onPlay?: GameEffect[];
    onRoundResolve?: GameEffect[];
  };
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
    attributes?: Record<string, { initial: number; min?: number; max?: number }>;
  };
  config: {
    winScore?: number;
  };
  victory?: VictoryCondition | VictoryCondition[];
  setup?: {
    initialPhase: "playing";
    deck?: {
      from: "cardTemplates";
      shuffle: boolean;
    };
    deal?: {
      strategy: "evenlyToPlayers" | "fixedCountToPlayers";
      from?: string;
      to: string;
      count?: number;
    };
    emptyVars?: Record<string, unknown>;
    vars?: Record<string, unknown>;
  };
  turn?: {
    minPlays: number;
    maxPlays: number;
    allowPass: boolean;
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
      type:
        | "currentPlayerIsActor"
        | "followSuitIfPossible"
        | "phaseIs"
        | "varEquals"
        | "playerAttributeBelow";
      zone?: string;
      suitField?: string;
      phase?: string;
      path?: string;
      target?: string;
      attribute?: string;
      value?: unknown;
    }>;
    effects?: GameEffect[];
  }>;
  triggers?: Array<{
    event: "CARD_PLAYED" | "ROUND_RESOLVED";
    when: {
      type: "zoneCountEquals" | "zoneCountAtLeast" | "zoneCountAtMost";
      zone: string;
      count: number;
    };
    effects: GameEffect[];
  }>;
  cardTemplates: CardTemplate[];
  ui: {
    cardDisplayFields: string[];
    showScoreboard: boolean;
    showRoundInfo: boolean;
  };
}

export type GameEffect =
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
      shuffleAfter?: boolean;
    }
  | {
      type: "drawCards";
      from: string;
      to: string;
      count: number | string;
    }
  | {
      type: "shuffleZone";
      zone: string;
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
      type: "modifyPlayerAttribute";
      target: string;
      attribute: string;
      amount: number | string;
    }
  | {
      type: "setCurrentPlayer";
      playerId: string | null;
    }
  | {
      type: "setPhase";
      phase: string;
    }
  | {
      type: "resolveTrick";
      zone: string;
      resultKey: string;
      rule?: "higherValueInLeadSuit";
      suitField?: string;
      valueField?: string;
    };

export type VictoryCondition =
  | {
      condition: "scoreAtLeast";
      scoreSource: "vars.scoresByPlayerId";
      target: "anyPlayer";
      value?: number;
      valueFrom?: "config.winScore";
    }
  | {
      condition: "playerAttributeAtLeast" | "playerAttributeAtMost";
      target: "anyPlayer";
      attribute: string;
      value?: number;
      valueFrom?: "config.winScore";
      winner: "matchedPlayer" | "opponentOfMatchedPlayer";
    }
  | {
      condition: "zoneCountAtLeast" | "zoneCountAtMost";
      zone: string;
      owner?: "anyPlayer";
      count: number;
      winner: "matchedPlayer" | "opponentOfMatchedPlayer";
    };

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
    attributes?: Record<string, unknown>;
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

export interface GenericGameState {
  gameType: string;
  status: "not_started" | "ready" | "running";
  phase: "not_started" | "ready" | "playing" | "finished";
  winnerId: string | null;
  roundId: string | null;
  zones: Record<string, CardInstance[]>;
  vars: {
    currentPlayerId?: string | null;
    winnerId?: string | null;
    [key: string]: unknown;
  };
  players: Array<{
    id: string;
    name: string;
    attributes?: Record<string, unknown>;
  }>;
  lastError: string;
  lastAction?: {
    type: string;
    playerId?: string;
    cardId?: string;
    at: number;
  };
  version: number;
}

export type PublicGameState = SimpleCardDemoState | GenericGameState;
