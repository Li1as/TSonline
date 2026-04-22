import type { Room } from "../types/room";

export const currentRoom: Room = {
  id: "RM-2048",
  name: "Moon Harbor Playtest",
  mode: "edit",
  status: "waiting",
  playerCount: 4,
  maxPlayers: 6,
  gameName: "Sky Traders",
  mapName: "Harbor District",
};

export const roomList: Room[] = [
  currentRoom,
  {
    id: "RM-1954",
    name: "Dungeon Draft",
    mode: "play",
    status: "running",
    playerCount: 5,
    maxPlayers: 5,
    gameName: "Dungeon Delvers",
    mapName: "Crystal Keep",
  },
  {
    id: "RM-1821",
    name: "Prototype Sandbox",
    mode: "edit",
    status: "waiting",
    playerCount: 2,
    maxPlayers: 8,
    gameName: "Card Forge",
    mapName: "Editor Canvas",
  },
  {
    id: "RM-1777",
    name: "Evening Match",
    mode: "play",
    status: "running",
    playerCount: 3,
    maxPlayers: 4,
    gameName: "Railfront",
    mapName: "Northern Route",
  },
];
