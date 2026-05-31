import { randomUUID } from "node:crypto";
import {
  applyGameAction,
  createEmptyGameState,
  getGameDefinition,
  startGame,
  toPublicGameState,
} from "./games/registry.js";

const initialRooms = [
  {
    id: "RM-2048",
    name: "Moon Harbor Playtest",
    mode: "edit",
    status: "waiting",
    playerCount: 4,
    maxPlayers: 6,
    gameName: "Sky Traders",
    mapName: "Harbor District",
  },
  {
    id: "RM-1954",
    name: "Simple Card Table",
    mode: "play",
    status: "waiting",
    playerCount: 2,
    maxPlayers: 2,
    minPlayers: 2,
    requiredPlayers: 2,
    gameType: "simpleCardDemo",
    gameStateVersion: 0,
    gameName: "Simple Card Demo",
    mapName: "Card Table",
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
];

const initialPlayersByRoom = {
  "RM-2048": [
    createPlayer("Ava", "#2563eb", "North", true),
    createPlayer("Milo", "#f97316", "East"),
    createPlayer("Lina", "#10b981", "South"),
    createPlayer("Noah", "#a855f7", "West", false, false),
  ],
  "RM-1954": [
    createPlayer("Dara", "#0f766e", "North", true),
    createPlayer("Ken", "#9333ea", "East"),
  ],
  "RM-1821": [
    createPlayer("Nina", "#0891b2", "Editor", true),
    createPlayer("Ryo", "#65a30d", "Preview"),
  ],
};

const initialMessagesByRoom = {
  "RM-2048": [
    createMessage("System", "Room created. Editor mode is active.", "system"),
    createMessage("Ava", "Let us keep the harbor map on the top layer for the demo."),
  ],
  "RM-1954": [
    createMessage("System", "Dungeon Draft is in progress.", "system"),
    createMessage("Dara", "Next round starts after the relic pile is shuffled."),
  ],
  "RM-1821": [
    createMessage("System", "Editor sandbox loaded with mock assets.", "system"),
  ],
};

const seatLabels = ["North", "East", "South", "West", "Observer", "Support"];

function createPlayer(name, color, seat, isHost = false, isOnline = true) {
  return { id: randomUUID(), name, color, seat, isHost, isOnline };
}

function createMessage(user, message, type = "chat") {
  return {
    id: randomUUID(),
    user,
    message,
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date()),
    type,
  };
}

export function createStore() {
  const rooms = new Map(initialRooms.map((room) => [room.id, { ...room }]));
  const playersByRoom = structuredClone(initialPlayersByRoom);
  const messagesByRoom = structuredClone(initialMessagesByRoom);
  const gameStatesByRoom = {
    "RM-1954": createEmptyGameState("simpleCardDemo", playersByRoom["RM-1954"]),
  };
  const sessions = new Map();

  function setSession(clientId, session) {
    sessions.set(clientId, session);
  }

  function getSnapshot(clientId) {
    return {
      rooms: Array.from(rooms.values()),
      playersByRoom,
      messagesByRoom,
      gameStatesByRoom: getPublicGameStates(clientId),
    };
  }

  function createRoom(clientId, input) {
    const session = requireSession(clientId);
    if (!input?.name?.trim() || !input?.gameName?.trim() || !input?.mapName?.trim()) {
      throw new Error("Room name, game name, and map name are required.");
    }
    const definition = input.mode === "play" ? getGameDefinition(input.gameType) : null;
    if (input.mode === "play" && !definition) {
      throw new Error("Play rooms require a supported game type.");
    }
    const roomId = `RM-${2000 + rooms.size + 1}`;
    const room = {
      id: roomId,
      name: input.name.trim(),
      gameName: input.gameName.trim(),
      mapName: input.mapName.trim(),
      maxPlayers: definition?.maxPlayers ?? input.maxPlayers,
      minPlayers: definition?.minPlayers,
      requiredPlayers: definition?.requiredPlayers,
      gameType: input.mode === "play" ? input.gameType : undefined,
      gameStateVersion: 0,
      mode: input.mode,
      status: "waiting",
      playerCount: 1,
    };

    if (session.roomId) {
      removeMemberFromRoom(clientId, session.roomId);
    }

    rooms.set(roomId, room);
    playersByRoom[roomId] = [
      { ...createPlayer(session.user.name, session.user.color, "Host", true), id: session.user.id },
    ];
    if (room.gameType) {
      gameStatesByRoom[roomId] = createEmptyGameState(room.gameType, playersByRoom[roomId]);
    }
    messagesByRoom[roomId] = [
      createMessage("System", `${room.name} was created in ${room.mode} mode.`, "system"),
    ];
    session.roomId = roomId;
    return roomId;
  }

  function joinRoom(clientId, roomId) {
    const room = rooms.get(roomId);
    const session = requireSession(clientId);
    if (!room) {
      throw new Error("Room not found.");
    }
    if (session.roomId === roomId) {
      return roomId;
    }
    if (room.playerCount >= room.maxPlayers) {
      throw new Error("Room is full.");
    }

    if (session.roomId) {
      removeMemberFromRoom(clientId, session.roomId);
    }

    const members = playersByRoom[roomId] ?? [];
    members.push({
      ...createPlayer(
        session.user.name,
        session.user.color,
        seatLabels[members.length % seatLabels.length],
      ),
      id: session.user.id,
    });
    playersByRoom[roomId] = members;
    room.playerCount = members.length;
    syncRoomGamePlayers(roomId);
    session.roomId = roomId;
    messagesByRoom[roomId] = [
      ...(messagesByRoom[roomId] ?? []),
      createMessage("System", `${session.user.name} joined the room.`, "system"),
    ];
    return roomId;
  }

  function startNewGame(clientId, roomId) {
    const room = rooms.get(roomId);
    const session = requireSession(clientId);
    if (!room) {
      throw new Error("Room not found.");
    }
    if (session.roomId !== roomId) {
      throw new Error("Join the room before starting a game.");
    }
    if (!room.gameType) {
      throw new Error("This room does not have a game type.");
    }

    const members = playersByRoom[roomId] ?? [];
    if (members.length !== room.requiredPlayers) {
      throw new Error(`This game requires exactly ${room.requiredPlayers} players.`);
    }

    gameStatesByRoom[roomId] = startGame(room.gameType, members);
    room.status = "running";
    room.gameStateVersion = gameStatesByRoom[roomId].version;
    messagesByRoom[roomId] = [
      ...(messagesByRoom[roomId] ?? []),
      createMessage("System", `${session.user.name} started a new game.`, "system"),
    ];
  }

  function handleGameAction(clientId, roomId, action) {
    const room = rooms.get(roomId);
    const session = requireSession(clientId);
    if (!room) {
      throw new Error("Room not found.");
    }
    if (session.roomId !== roomId) {
      throw new Error("Join the room before playing.");
    }
    if (!room.gameType) {
      throw new Error("This room does not have a game type.");
    }
    const state = gameStatesByRoom[roomId];
    if (!state) {
      throw new Error("Game state is not initialized.");
    }

    try {
      gameStatesByRoom[roomId] = applyGameAction(room.gameType, state, session.user.id, action);
    } catch (error) {
      state.lastErrorsByPlayerId = {
        ...(state.lastErrorsByPlayerId ?? {}),
        [session.user.id]: error instanceof Error ? error.message : "Invalid move.",
      };
      throw error;
    }
    room.gameStateVersion = gameStatesByRoom[roomId].version;
  }

  function sendChat(clientId, roomId, text) {
    const session = requireSession(clientId);
    if (!text.trim()) {
      throw new Error("Message cannot be empty.");
    }
    if (session.roomId !== roomId) {
      throw new Error("Join the room before sending messages.");
    }
    messagesByRoom[roomId] = [
      ...(messagesByRoom[roomId] ?? []),
      createMessage(session.user.name, text.trim()),
    ];
  }

  function disconnect(clientId) {
    const session = sessions.get(clientId);
    if (session?.roomId) {
      removeMemberFromRoom(clientId, session.roomId);
    }
    sessions.delete(clientId);
  }

  function removeMemberFromRoom(clientId, roomId) {
    const room = rooms.get(roomId);
    const session = sessions.get(clientId);
    if (!room || !session) {
      return;
    }

    const members = (playersByRoom[roomId] ?? []).filter(
      (player) => player.id !== session.user.id,
    );
    playersByRoom[roomId] = members;
    room.playerCount = members.length;
    syncRoomGamePlayers(roomId);
    if (members.length === 0) {
      rooms.delete(roomId);
      delete playersByRoom[roomId];
      delete messagesByRoom[roomId];
      delete gameStatesByRoom[roomId];
    }
  }

  function syncRoomGamePlayers(roomId) {
    const room = rooms.get(roomId);
    const state = gameStatesByRoom[roomId];
    if (!room?.gameType || !state || state.status === "running") {
      return;
    }
    gameStatesByRoom[roomId] = createEmptyGameState(room.gameType, playersByRoom[roomId] ?? []);
    room.gameStateVersion = gameStatesByRoom[roomId].version;
  }

  function getPublicGameStates(clientId) {
    const session = sessions.get(clientId);
    const result = {};
    if (!session) {
      return result;
    }
    for (const [roomId, state] of Object.entries(gameStatesByRoom)) {
      const room = rooms.get(roomId);
      if (room?.gameType) {
        result[roomId] = toPublicGameState(room.gameType, state, session.user.id);
      }
    }
    return result;
  }

  function requireSession(clientId) {
    const session = sessions.get(clientId);
    if (!session) {
      throw new Error("Session not found.");
    }
    return session;
  }

  return {
    setSession,
    getSnapshot,
    createRoom,
    joinRoom,
    sendChat,
    startNewGame,
    handleGameAction,
    disconnect,
  };
}
