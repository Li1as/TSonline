import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { TopBar } from "../components/layout/TopBar";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppState, type GameDefinitionSource } from "../state/AppContext";

export function GameDefinitionPage() {
  const { gameType = "" } = useParams();
  const { gameDefinitions, getGameDefinitionSource, isConnected } = useAppState();
  const [source, setSource] = useState<GameDefinitionSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const decodedType = decodeURIComponent(gameType);
  const summary = gameDefinitions.find((definition) => definition.type === decodedType);

  useEffect(() => {
    let isActive = true;
    if (!decodedType || !isConnected) {
      return undefined;
    }

    setIsLoading(true);
    getGameDefinitionSource(decodedType).then((result) => {
      if (!isActive) {
        return;
      }
      setSource(result);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [decodedType, getGameDefinitionSource, isConnected]);

  if (!decodedType) {
    return <Navigate to="/games" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <Link to="/games" className="text-sm font-medium text-zinc-500">
            Back to games
          </Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-500">
                {decodedType}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {source?.title ?? summary?.title ?? "Game Definition"}
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                {source?.sourceFile ?? summary?.sourceFile ?? "Source file loading..."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={summary?.playable ? "Playable" : "Reference"}
                tone={summary?.playable ? "success" : "neutral"}
              />
              <a
                href={getStandaloneDownloadUrl(decodedType)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
              >
                Download zip
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-zinc-300">Loading definition source...</p>
          ) : (
            <pre className="max-h-[680px] overflow-auto rounded-md bg-zinc-950 p-4 text-sm leading-6 text-zinc-100">
              <code>{source?.content ?? "Definition source is not available."}</code>
            </pre>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function getStandaloneDownloadUrl(gameType: string) {
  return `http://${window.location.hostname}:8787/downloads/standalone/${encodeURIComponent(gameType)}.zip`;
}
