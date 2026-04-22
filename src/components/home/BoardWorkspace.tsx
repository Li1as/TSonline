import { boardSummary } from "../../mock/board";
import { currentRoom } from "../../mock/room";
import { StatusBadge } from "../ui/StatusBadge";

export function BoardWorkspace() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Workspace Preview
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
            {boardSummary.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Room {currentRoom.id} • {boardSummary.phase} phase • Turn {boardSummary.turn}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge label={`Active: ${boardSummary.activePlayer}`} tone="accent" />
          <StatusBadge label={`${boardSummary.layers.length} Layers`} tone="neutral" />
          <StatusBadge label={`${boardSummary.decks.length} Decks`} tone="success" />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4">
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-lg bg-white/5 p-4 text-zinc-100">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-zinc-400">
                Layer Stack
              </p>
              <ul className="mt-3 space-y-2">
                {boardSummary.layers.map((layer, index) => (
                  <li
                    key={layer}
                    className={`rounded-md px-3 py-2 text-sm ${
                      index === 1 ? "bg-emerald-500/20 text-emerald-100" : "bg-white/5"
                    }`}
                  >
                    {layer}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-zinc-400">
                Decks
              </p>
              <ul className="mt-3 space-y-2">
                {boardSummary.decks.map((deck) => (
                  <li
                    key={deck.id}
                    className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-sm"
                  >
                    <span>{deck.name}</span>
                    <span className="text-zinc-400">{deck.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="relative min-h-[440px] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px] bg-zinc-900 p-4">
              <div className="absolute inset-x-6 top-6 rounded-lg border border-sky-400/30 bg-sky-400/10 p-3 text-sm text-sky-100">
                Map layer placeholder: future `react-konva` canvas goes here.
              </div>

              <div className="absolute left-6 top-28 w-40 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                Market Row
              </div>
              <div className="absolute right-6 top-28 w-36 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                Quest Area
              </div>
              <div className="absolute bottom-24 left-6 rounded-lg border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
                Discard Zone
              </div>
              <div className="absolute bottom-24 right-6 rounded-lg border border-violet-300/30 bg-violet-300/10 px-3 py-2 text-sm text-violet-100">
                Token Tray
              </div>

              <div className="absolute inset-x-10 bottom-6 grid gap-3 md:grid-cols-3">
                {["North Seat", "East Seat", "South Seat"].map((seat) => (
                  <div
                    key={seat}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100"
                  >
                    {seat} hand zone
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                  Scene zones
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {boardSummary.zones.map((zone) => (
                    <span
                      key={zone}
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-zinc-500">
                  Future interactions
                </p>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                  <li>Card drag and drop</li>
                  <li>Layer visibility toggle</li>
                  <li>Object selection and inspector sync</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
