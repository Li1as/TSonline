import type { Room } from "../../types/room";
import { StatusBadge } from "../ui/StatusBadge";

interface RoomTablePlaceholderProps {
  room: Room;
}

export function RoomTablePlaceholder({ room }: RoomTablePlaceholderProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
            Table Area
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">
            {room.mapName} workspace
          </h2>
        </div>
        <StatusBadge label="Board Placeholder" tone="accent" />
      </div>

      <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 p-4">
        <div className="absolute inset-x-6 top-6 rounded-lg border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
          Future game board area: cards, map layers, tokens, and selection logic can
          be mounted here later.
        </div>

        <div className="absolute left-6 top-28 w-44 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          Draw Pile
        </div>
        <div className="absolute left-56 top-28 w-44 rounded-lg border border-orange-300/30 bg-orange-300/10 p-3 text-sm text-orange-100">
          Market Cards
        </div>
        <div className="absolute right-6 top-28 w-44 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          Quest Board
        </div>

        <div className="absolute inset-x-10 bottom-8 grid gap-3 md:grid-cols-3">
          {["Player Hand", "Shared Objects", "Discard Pile"].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
