import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { ChatMessage } from "../types/chat";
import type { PublicGameState } from "../types/game";
import type { Player } from "../types/player";
import type { RealtimeEvent, SnapshotPayload } from "../types/realtime";
import type { CreateRoomInput, GameDefinitionSummary, Room } from "../types/room";

interface AppStateValue {
  currentUser: Player | null;
  rooms: Room[];
  gameDefinitions: GameDefinitionSummary[];
  gameStatesByRoom: Record<string, PublicGameState>;
  isConnected: boolean;
  errorMessage: string | null;
  getRoomById: (roomId: string) => Room | undefined;
  getPlayersForRoom: (roomId: string) => Player[];
  getMessagesForRoom: (roomId: string) => ChatMessage[];
  getGameDefinitionSource: (gameType: string) => Promise<GameDefinitionSource | null>;
  createRoom: (input: CreateRoomInput) => Promise<string | null>;
  joinRoom: (roomId: string) => Promise<boolean>;
  sendMessage: (roomId: string, text: string) => Promise<void>;
  generateDefinitionDraft: (
    input: GenerateDefinitionInput,
  ) => Promise<GeneratedDefinitionResult | null>;
  submitDefinitionDraft: (roomId: string, content: string) => Promise<string | null>;
  startNewGame: (roomId: string) => Promise<void>;
  sendGameAction: (roomId: string, action: Record<string, unknown>) => Promise<void>;
  playCard: (roomId: string, cardId: string) => Promise<void>;
  clearError: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);
const socketUrl = `ws://${window.location.hostname}:8787`;

export interface GameDefinitionSource {
  type: string;
  title: string;
  sourceFile: string;
  content: string;
}

export interface GenerateDefinitionInput {
  apiUrl: string;
  apiKey: string;
  model: string;
  description: string;
}

export interface GeneratedDefinitionResult {
  prompt: string;
  responseText: string;
  rawResponseText?: string;
}

export function AppProvider({ children }: PropsWithChildren) {
  const socketRef = useRef<WebSocket | null>(null);
  const pendingRequests = useRef(
    new Map<
      string,
      {
        resolve: (value: unknown) => void;
        reject: (reason?: unknown) => void;
      }
    >(),
  );
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [gameDefinitions, setGameDefinitions] = useState<GameDefinitionSummary[]>([]);
  const [playersByRoom, setPlayersByRoom] = useState<Record<string, Player[]>>({});
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>(
    {},
  );
  const [gameStatesByRoom, setGameStatesByRoom] = useState<
    Record<string, PublicGameState>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setIsConnected(true);
      setErrorMessage(null);
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
      setErrorMessage("Realtime server disconnected.");
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as RealtimeEvent;
      if (message.type === "session:ready" && message.payload) {
        setCurrentUser((message.payload as { currentUser: Player }).currentUser);
        return;
      }

      if (message.type === "state:snapshot" && message.payload) {
        const snapshot = message.payload as SnapshotPayload;
        setRooms(snapshot.rooms);
        setPlayersByRoom(snapshot.playersByRoom);
        setMessagesByRoom(snapshot.messagesByRoom);
        setGameStatesByRoom(snapshot.gameStatesByRoom);
        setGameDefinitions(snapshot.gameDefinitions ?? []);
        return;
      }

      if (message.type === "request:error") {
        const payload = message.payload as { message: string };
        setErrorMessage(payload.message);
        if (message.requestId) {
          const pending = pendingRequests.current.get(message.requestId);
          if (pending) {
            pending.reject(new Error(payload.message));
            pendingRequests.current.delete(message.requestId);
          }
        }
        return;
      }

      if (!message.requestId) {
        return;
      }

      const pending = pendingRequests.current.get(message.requestId);
      if (pending) {
        pending.resolve(message.payload);
        pendingRequests.current.delete(message.requestId);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const getRoomById = useCallback(
    (roomId: string) => rooms.find((room) => room.id === roomId),
    [rooms],
  );

  const getPlayersForRoom = useCallback(
    (roomId: string) => playersByRoom[roomId] ?? [],
    [playersByRoom],
  );

  const getMessagesForRoom = useCallback(
    (roomId: string) => messagesByRoom[roomId] ?? [],
    [messagesByRoom],
  );

  const sendRequest = useCallback((type: string, payload: object) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const error = new Error("Realtime server is not connected.");
      setErrorMessage(error.message);
      return Promise.reject(error);
    }

    const requestId = crypto.randomUUID();
    return new Promise<unknown>((resolve, reject) => {
      pendingRequests.current.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ type, payload, requestId }));
    });
  }, []);

  const createRoom = useCallback(
    async (input: CreateRoomInput) => {
      try {
        const result = (await sendRequest("room:create", input)) as { roomId: string };
        setErrorMessage(null);
        return result.roomId;
      } catch {
        return null;
      }
    },
    [sendRequest],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      try {
        await sendRequest("room:join", { roomId });
        setErrorMessage(null);
        return true;
      } catch {
        return false;
      }
    },
    [sendRequest],
  );

  const sendMessage = useCallback(
    async (roomId: string, text: string) => {
      const content = text.trim();
      if (!content) {
        return;
      }
      try {
        await sendRequest("chat:send", { roomId, text: content });
        setErrorMessage(null);
      } catch {
        return;
      }
    },
    [sendRequest],
  );

  const getGameDefinitionSource = useCallback(
    async (gameType: string) => {
      try {
        const result = (await sendRequest("game:definition:source", {
          gameType,
        })) as GameDefinitionSource;
        setErrorMessage(null);
        return result;
      } catch {
        return null;
      }
    },
    [sendRequest],
  );

  const generateDefinitionDraft = useCallback(
    async (input: GenerateDefinitionInput) => {
      try {
        const result = (await sendRequest("editor:definition:generate", {
          apiUrl: input.apiUrl,
          apiKey: input.apiKey,
          model: input.model,
          description: input.description,
        })) as GeneratedDefinitionResult;
        setErrorMessage(null);
        return result;
      } catch {
        return null;
      }
    },
    [sendRequest],
  );

  const submitDefinitionDraft = useCallback(
    async (roomId: string, content: string) => {
      try {
        const result = (await sendRequest("editor:definition:submit", {
          roomId,
          content,
        })) as { fileName: string };
        setErrorMessage(null);
        return result.fileName;
      } catch {
        return null;
      }
    },
    [sendRequest],
  );

  const startNewGame = useCallback(
    async (roomId: string) => {
      try {
        await sendRequest("game:new", { roomId });
        setErrorMessage(null);
      } catch {
        return;
      }
    },
    [sendRequest],
  );

  const sendGameAction = useCallback(
    async (roomId: string, action: Record<string, unknown>) => {
      try {
        await sendRequest("game:action", { roomId, action });
        setErrorMessage(null);
      } catch {
        return;
      }
    },
    [sendRequest],
  );

  const playCard = useCallback(
    async (roomId: string, cardId: string) => {
      await sendGameAction(roomId, { type: "card:play", cardId });
    },
    [sendGameAction],
  );

  const clearError = useCallback(() => setErrorMessage(null), []);

  const value = useMemo(
    () => ({
      currentUser,
      rooms,
      gameDefinitions,
      gameStatesByRoom,
      isConnected,
      errorMessage,
      getRoomById,
      getPlayersForRoom,
      getMessagesForRoom,
      getGameDefinitionSource,
      createRoom,
      joinRoom,
      sendMessage,
      generateDefinitionDraft,
      submitDefinitionDraft,
      startNewGame,
      sendGameAction,
      playCard,
      clearError,
    }),
    [
      currentUser,
     rooms,
      gameDefinitions,
      gameStatesByRoom,
      isConnected,
      errorMessage,
      getRoomById,
      getPlayersForRoom,
      getMessagesForRoom,
      getGameDefinitionSource,
      createRoom,
      joinRoom,
      sendMessage,
      generateDefinitionDraft,
      submitDefinitionDraft,
      startNewGame,
      sendGameAction,
      playCard,
      clearError,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
}
