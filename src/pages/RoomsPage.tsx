import { Footer } from "../components/layout/Footer";
import { TopBar } from "../components/layout/TopBar";
import { CreateRoomPanel } from "../components/rooms/CreateRoomPanel";
import { RoomsListPanel } from "../components/rooms/RoomsListPanel";
import { useAppState } from "../state/AppContext";

export function RoomsPage() {
  const { isConnected, errorMessage, clearError } = useAppState();

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.08em] text-zinc-500">
            Rooms
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Browse active rooms and start a new session.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            This page is connected to a Node WebSocket server for shared room state
            and remote chat sync.
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
            {isConnected ? "Realtime server connected" : "Waiting for realtime server"}
          </span>
          {errorMessage ? (
            <button
              type="button"
              onClick={clearError}
              className="rounded-md bg-rose-50 px-3 py-2 text-rose-700"
            >
              {errorMessage}
            </button>
          ) : null}
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <RoomsListPanel />
          <CreateRoomPanel />
        </section>
      </main>
      <Footer />
    </div>
  );
}
