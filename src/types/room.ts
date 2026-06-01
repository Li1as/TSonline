export type RoomMode = "play" | "edit";
export type RoomStatus = "waiting" | "running";
export type GameType = "simpleCardDemo" | "attributeDuel" | "noRulesMinimal";

export interface Room {
  id: string;
  name: string;
  mode: RoomMode;
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
  gameName: string;
  mapName: string;
  gameType?: GameType;
  minPlayers?: number;
  requiredPlayers?: number;
  gameStateVersion?: number;
}

export interface GameDefinitionSummary {
  type: GameType;
  title: string;
  version: number;
  players: {
    min: number;
    max: number;
    required: number;
  };
  turn?: {
    minPlays: number;
    maxPlays: number;
    allowPass: boolean;
  };
  playable: boolean;
}

export interface CreateRoomInput {
  name: string;
  gameName: string;
  mapName: string;
  maxPlayers: number;
  mode: RoomMode;
  gameType?: GameType;
}
