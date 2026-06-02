export type RoomMode = "play" | "edit";
export type RoomStatus = "waiting" | "running" | "invalid";
export type GameType = string;
export type EditorType = "showcase" | "definitionEditor";

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
  editorType?: EditorType;
  minPlayers?: number;
  requiredPlayers?: number;
  gameStateVersion?: number;
  invalidReason?: string;
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
  sourceFile?: string;
}

export interface CreateRoomInput {
  name: string;
  gameName: string;
  mapName: string;
  maxPlayers: number;
  mode: RoomMode;
  gameType?: GameType;
  editorType?: EditorType;
}
