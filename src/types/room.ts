export type RoomMode = "play" | "edit";
export type RoomStatus = "waiting" | "running";

export interface Room {
  id: string;
  name: string;
  mode: RoomMode;
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
  gameName: string;
  mapName: string;
}

export interface CreateRoomInput {
  name: string;
  gameName: string;
  mapName: string;
  maxPlayers: number;
  mode: RoomMode;
}
