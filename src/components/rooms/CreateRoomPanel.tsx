import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppContext";
import type { EditorType, GameType, RoomMode } from "../../types/room";
import { PanelCard } from "../ui/PanelCard";

export function CreateRoomPanel() {
  const navigate = useNavigate();
  const { createRoom, gameDefinitions, isConnected } = useAppState();
  const [name, setName] = useState("New Playtest Room");
  const [gameName, setGameName] = useState("Prototype Game");
  const [mapName, setMapName] = useState("Starter Board");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [mode, setMode] = useState<RoomMode>("edit");
  const [gameType, setGameType] = useState<GameType>("simpleCardDemo");
  const [editorType, setEditorType] = useState<EditorType>("showcase");

  const playableDefinitions = gameDefinitions.filter((definition) => definition.playable);
  const visibleDefinitions = gameDefinitions.length
    ? gameDefinitions
    : [
        {
          type: "simpleCardDemo" as const,
          title: "Simple Card Demo",
          version: 1,
          players: { min: 2, max: 2, required: 2 },
          turn: { minPlays: 1, maxPlays: 1, allowPass: false },
          playable: true,
        },
      ];
  const selectedDefinition = visibleDefinitions.find(
    (definition) => definition.type === gameType,
  );
  const selectedPlayable = selectedDefinition?.playable ?? false;
  const effectiveMaxPlayers =
    mode === "play" ? selectedDefinition?.players.max ?? 2 : maxPlayers;
  const canSubmit =
    isConnected && (mode !== "play" || Boolean(selectedDefinition && selectedPlayable));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const roomId = await createRoom({
      name,
      gameName,
      mapName,
      maxPlayers: effectiveMaxPlayers,
      mode,
      gameType: mode === "play" ? gameType : undefined,
      editorType: mode === "edit" ? editorType : undefined,
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
                  const nextDefinition = playableDefinitions[0] ?? visibleDefinitions[0];
                  setGameType(nextDefinition.type);
                  setGameName(nextDefinition.title);
                  setMapName("Card Table");
                  setMaxPlayers(nextDefinition.players.max);
                } else {
                  setGameName("Prototype Game");
                  setMapName("Editor Canvas");
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
              onChange={(event) => {
                const nextGameType = event.target.value as GameType;
                const nextDefinition = visibleDefinitions.find(
                  (definition) => definition.type === nextGameType,
                );
                setGameType(nextGameType);
                if (nextDefinition) {
                  setGameName(nextDefinition.title);
                  setMaxPlayers(nextDefinition.players.max);
                }
              }}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            >
              {visibleDefinitions.map((definition) => (
                <option key={definition.type} value={definition.type}>
                  {definition.title}
                  {definition.playable ? "" : " (definition only)"}
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-500">
              {selectedPlayable
                ? `Requires ${selectedDefinition?.players.required ?? 0} player(s).`
                : "This definition is exposed for renderer testing but cannot create a room yet."}
            </span>
          </label>
        ) : null}

        {mode === "edit" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-700">Editor type</span>
            <select
              value={editorType}
              onChange={(event) => setEditorType(event.target.value as EditorType)}
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900"
            >
              <option value="showcase">Placeholder showcase</option>
              <option value="definitionEditor">Definition text editor</option>
            </select>
            <span className="text-xs text-zinc-500">
              The text editor keeps a local draft for now; backend upload is reserved.
            </span>
          </label>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          Create and Enter Room
        </button>
      </form>
    </PanelCard>
  );
}
