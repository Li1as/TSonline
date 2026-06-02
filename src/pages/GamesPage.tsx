import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { TopBar } from "../components/layout/TopBar";
import { useAppState } from "../state/AppContext";
import { StatusBadge } from "../components/ui/StatusBadge";

export function GamesPage() {
  const { gameDefinitions, isConnected } = useAppState();

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-500">
            Games
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Current game definitions for editor reference.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            This page mirrors the game definitions loaded by the server. When definition
            files change, the realtime snapshot updates this list automatically.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`rounded-md px-3 py-2 font-medium ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isConnected ? "Definitions synced" : "Waiting for realtime server"}
          </span>
          <span className="rounded-md bg-zinc-50 px-3 py-2 font-medium text-zinc-600">
            {gameDefinitions.length} definition(s)
          </span>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gameDefinitions.map((definition) => (
            <article
              key={definition.type}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-zinc-500">
                    {definition.type}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                    {definition.title}
                  </h2>
                </div>
                <StatusBadge
                  label={definition.playable ? "Playable" : "Reference"}
                  tone={definition.playable ? "success" : "neutral"}
                />
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="Version" value={String(definition.version ?? "-")} />
                <InfoItem
                  label="Players"
                  value={`${definition.players.required}/${definition.players.max}`}
                />
                <InfoItem
                  label="Min plays"
                  value={String(definition.turn?.minPlays ?? "-")}
                />
                <InfoItem
                  label="Max plays"
                  value={String(definition.turn?.maxPlays ?? "-")}
                />
              </dl>

              <p className="mt-4 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                Pass action: {definition.turn?.allowPass ? "enabled" : "disabled"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/games/${encodeURIComponent(definition.type)}`}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
                >
                  View source
                </Link>
                <a
                  href={getStandaloneDownloadUrl(definition.type)}
                  className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Download zip
                </a>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                Zip contains a dependency-free Node HTTP preview server.
              </p>
            </article>
          ))}
        </section>

        {!gameDefinitions.length ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            No definitions are available yet.
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function getStandaloneDownloadUrl(gameType: string) {
  return `http://${window.location.hostname}:8787/downloads/standalone/${encodeURIComponent(gameType)}.zip`;
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
