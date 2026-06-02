import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { watch } from "node:fs";
import { WebSocketServer } from "ws";
import { createRandomName } from "./names.js";
import { createStore } from "./store.js";
import { initializeGameRegistry, reloadGameRegistry } from "./games/registry.js";
import { createStandalonePackage } from "./standalone-package.js";

const port = Number(process.env.WS_PORT ?? 8787);
const host = process.env.WS_HOST ?? "127.0.0.1";

await initializeGameRegistry();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? host}`);
  const match = url.pathname.match(/^\/downloads\/standalone\/(.+)\.zip$/);
  if (!match) {
    response.writeHead(404);
    response.end("Not found.");
    return;
  }

  try {
    const gameType = decodeURIComponent(match[1]);
    const archive = await createStandalonePackage(gameType);
    response.writeHead(200, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${archive.fileName}"`,
      "Content-Length": archive.content.length,
    });
    response.end(archive.content);
  } catch (error) {
    response.writeHead(404);
    response.end(error instanceof Error ? error.message : "Download failed.");
  }
});
const wss = new WebSocketServer({ server });
const store = createStore();
const definitionsDirectory = new URL("./games/definitions/", import.meta.url);

function send(socket, type, payload, requestId) {
  socket.send(JSON.stringify({ type, payload, requestId }));
}

function broadcastSnapshot() {
  for (const client of wss.clients) {
    if (client.readyState !== client.OPEN) {
      continue;
    }
    send(client, "state:snapshot", store.getSnapshot(client.clientId));
  }
}

let registryReloadTimer = null;

const definitionsWatcher = watch(definitionsDirectory, () => {
  clearTimeout(registryReloadTimer);
  registryReloadTimer = setTimeout(async () => {
    try {
      const { changedTypes } = await reloadGameRegistry();
      if (changedTypes.length) {
        const affectedRooms = store.invalidateGameRoomsForTypes(
          changedTypes,
          "Game definition changed. Please recreate this room.",
        );
        console.log(
          `Reloaded game definitions. Changed: ${changedTypes.join(", ")}. Invalidated rooms: ${affectedRooms.length}.`,
        );
      } else {
        console.log("Reloaded game definitions. No definition content changed.");
      }
      broadcastSnapshot();
    } catch (error) {
      console.error("Failed to reload game definitions.", error);
    }
  }, 150);
});

wss.on("connection", (socket) => {
  const clientId = randomUUID();
  const session = {
    user: {
      id: clientId,
      name: createRandomName(),
      color: `hsl(${Math.floor(Math.random() * 360)} 70% 45%)`,
      seat: "Guest",
      isHost: false,
      isOnline: true,
    },
    roomId: null,
  };
  socket.clientId = clientId;

  store.setSession(clientId, session);
  send(socket, "session:ready", { currentUser: session.user });
  send(socket, "state:snapshot", store.getSnapshot(clientId));

  socket.on("message", async (raw) => {
    let requestId;
    try {
      const message = JSON.parse(String(raw));
      const { type, payload } = message;
      requestId = message.requestId;
      if (type === "room:create") {
        const roomId = store.createRoom(clientId, payload);
        send(socket, "room:create_result", { roomId }, requestId);
        broadcastSnapshot();
        return;
      }
      if (type === "room:join") {
        const roomId = store.joinRoom(clientId, payload.roomId);
        send(socket, "room:join_result", { roomId }, requestId);
        broadcastSnapshot();
        return;
      }
      if (type === "chat:send") {
        store.sendChat(clientId, payload.roomId, payload.text.trim());
        send(socket, "chat:send_result", { ok: true }, requestId);
        broadcastSnapshot();
        return;
      }
      if (type === "editor:definition:submit") {
        const result = await store.submitEditorDefinition(
          clientId,
          payload.roomId,
          payload.content,
        );
        send(socket, "editor:definition:submit_result", result, requestId);
        broadcastSnapshot();
        return;
      }
      if (type === "game:definition:source") {
        const result = await store.getGameDefinitionSource(payload.gameType);
        send(socket, "game:definition:source_result", result, requestId);
        return;
      }
      if (type === "game:new") {
        store.startNewGame(clientId, payload.roomId);
        send(socket, "game:new_result", { ok: true }, requestId);
        broadcastSnapshot();
        return;
      }
      if (type === "game:action") {
        store.handleGameAction(clientId, payload.roomId, payload.action);
        send(socket, "game:action_result", { ok: true }, requestId);
        broadcastSnapshot();
      }
    } catch (error) {
      send(
        socket,
        "request:error",
        { message: error instanceof Error ? error.message : "Unexpected server error." },
        requestId,
      );
    }
  });

  socket.on("close", () => {
    store.disconnect(clientId);
    broadcastSnapshot();
  });
});

server.listen(port, host, () => {
  console.log(`WebSocket server listening on http://${host}:${port}`);
});

process.on("SIGINT", () => {
  definitionsWatcher.close();
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  definitionsWatcher.close();
  server.close(() => process.exit(0));
});
