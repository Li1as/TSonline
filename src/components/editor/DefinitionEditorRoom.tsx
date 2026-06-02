import { useState } from "react";
import type { Room } from "../../types/room";
import { StatusBadge } from "../ui/StatusBadge";

interface DefinitionEditorRoomProps {
  room: Room;
}

export function DefinitionEditorRoom({ room }: DefinitionEditorRoomProps) {
  const [draft, setDraft] = useState("");
  const [statusText, setStatusText] = useState("Local draft only.");

  function handleSubmit() {
    setStatusText("Submit endpoint reserved. Draft was not sent to the server.");
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Definition Editor
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
            {room.mapName} draft
          </h2>
        </div>
        <StatusBadge label="Local Draft" tone="accent" />
      </div>

      <div className="space-y-3">
        <textarea
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setStatusText("Local draft only.");
          }}
          spellCheck={false}
          placeholder="Paste or type a future GameDefinition JSON draft here."
          className="min-h-[460px] w-full resize-y rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">{statusText}</p>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Send to Server
          </button>
        </div>
      </div>
    </section>
  );
}
