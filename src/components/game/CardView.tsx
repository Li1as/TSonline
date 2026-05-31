import type { CardInstance } from "../../types/game";

interface CardViewProps {
  card: CardInstance;
  onClick?: () => void;
  disabled?: boolean;
}

const redSuits = new Set(["H", "D"]);

export function CardView({ card, onClick, disabled = false }: CardViewProps) {
  const isRed = redSuits.has(card.suit);
  const propsText = formatProps(card.props);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      className={`flex aspect-[5/7] h-32 min-w-24 flex-col justify-between rounded-lg border bg-white p-2 text-left shadow-sm ${
        isRed ? "border-rose-200 text-rose-700" : "border-zinc-300 text-zinc-900"
      } ${onClick && !disabled ? "transition hover:-translate-y-1 hover:shadow-md" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold">{card.rank}</span>
        <span className="text-xs font-medium text-zinc-500">v{card.value}</span>
      </div>
      <div className="flex min-h-10 items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 text-xl font-bold">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover" />
        ) : (
          card.suit
        )}
      </div>
      <div>
        <div className="truncate text-sm font-semibold">{card.name}</div>
        <div className="text-xs text-zinc-500">
          {card.suit} • {card.rank}
        </div>
        <div className="mt-1 min-h-4 truncate text-xs text-zinc-400">
          {propsText}
        </div>
      </div>
    </button>
  );
}

function formatProps(props?: Record<string, unknown>) {
  if (!props) {
    return "";
  }

  return Object.entries(props)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(" ");
}
