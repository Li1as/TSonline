import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppContext";
import type { GameType, RoomMode } from "../../types/room";
import { PanelCard } from "../ui/PanelCard";

export function CreateRoomPanel() {
  const navigate = useNavigate();
  const { createRoom, isConnected } = useAppState();
  const [name, setName] = useState("New Playtest Room");
  const [gameName, setGameName] = useState("Prototype Game");
  const [mapName, setMapName] = useState("Starter Board");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [mode, setMode] = useState<RoomMode>("edit");
  const [gameType, setGameType] = useState<GameType>("simpleCardDemo");

  const effectiveMaxPlayers = mode === "play" ? 2 : maxPlayers;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const roomId = await createRoom({
      name,
      gameName,
      mapName,
      maxPlayers: effectiveMaxPlayers,
      mode,
      gameType: mode === "play" ? gameType : undefined,
    });
    if (roomId) {
      navigate(`/rooms/${roomId}`);
    }
  }

  return (
    <PanelCard
      title="Create Room"
      description="Build a new frontend-only room and enter it immediately."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-700">Room name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Game</span>
            <input
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Map</span>
            <input
              value={mapName}
              onChange={(event) => setMapName(event.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Mode</span>
            <select
              value={mode}
              onChange={(event) => {
                const nextMode = event.target.value as RoomMode;
                setMode(nextMode);
                if (nextMode === "play") {
                  setGameName("Simple Card Demo");
                  setMapName("Card Table");
                  setMaxPlayers(2);
                }
              }}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="edit">Editor</option>
              <option value="play">Play</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Max players</span>
            <input
              type="number"
              min={2}
              max={8}
              value={effectiveMaxPlayers}
              disabled={mode === "play"}
              onChange={(event) => setMaxPlayers(Number(event.target.value))}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            />
          </label>
        </div>

        {mode === "play" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Game type</span>
            <select
              value={gameType}
              onChange={(event) => setGameType(event.target.value as GameType)}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="simpleCardDemo">Simple Card Demo</option>
            </select>
            <span className="text-xs text-zinc-500">
              This demo is fixed to exactly 2 players.
            </span>
          </label>
        ) : null}

        <button
          type="submit"
          disabled={!isConnected}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Create and Enter Room
        </button>
      </form>
    </PanelCard>
  );
}
