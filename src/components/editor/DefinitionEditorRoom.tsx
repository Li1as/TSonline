import { useState } from "react";
import { useAppState } from "../../state/AppContext";
import type { Room } from "../../types/room";
import { StatusBadge } from "../ui/StatusBadge";

interface DefinitionEditorRoomProps {
  room: Room;
}

export function DefinitionEditorRoom({ room }: DefinitionEditorRoomProps) {
  const { generateDefinitionDraft, isConnected, submitDefinitionDraft } = useAppState();
  const [apiUrl, setApiUrl] = useState("https://aihub.skyatlas.net");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-5.4-mini");
  const [aiPrompt, setAiPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [statusText, setStatusText] = useState("Local draft only.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGenerateDraft() {
    if (!aiPrompt.trim()) {
      setStatusText("Describe the game rules before generating a draft.");
      return;
    }

    setIsGenerating(true);
    const result = await generateDefinitionDraft({
      apiUrl,
      apiKey,
      model,
      description: aiPrompt,
    });
    setIsGenerating(false);

    if (!result?.responseText) {
      setStatusText("AI generation failed. Check API settings and server logs.");
      return;
    }

    setDraft(result.responseText);
    setStatusText("AI draft generated and inserted into the editor.");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const fileName = await submitDefinitionDraft(room.id, draft);
    setIsSubmitting(false);
    setStatusText(
      fileName ? `Saved to ${fileName}.` : "Submit failed. Check server connection.",
    );
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
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">API URL</span>
              <input
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">API Key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">Model</span>
              <input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="block flex-1 space-y-2">
              <span className="text-sm font-medium text-zinc-700">
                AI generation prompt
              </span>
              <textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Describe a small game rule set to turn into a GameDefinition draft."
                className="min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-6 text-zinc-900 outline-none focus:border-zinc-500"
              />
            </label>
            <button
              type="button"
              disabled={!isConnected || isGenerating}
              onClick={handleGenerateDraft}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              {isGenerating ? "Generating..." : "Generate JSON"}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Generated text is inserted into the editor below and can be saved afterward.
          </p>
        </div>

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
            disabled={!isConnected || isSubmitting}
            onClick={handleSubmit}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isSubmitting ? "Sending..." : "Send to Server"}
          </button>
        </div>
      </div>
    </section>
  );
}
