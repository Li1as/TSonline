import type { Card } from "../../types/game";

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
}

const redSuits = new Set(["H", "D"]);

export function CardView({ card, onClick, disabled = false }: CardViewProps) {
  const isRed = redSuits.has(card.suit);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      className={`flex aspect-[5/7] h-24 flex-col justify-between rounded-lg border bg-white p-2 text-left shadow-sm ${
        isRed ? "border-rose-200 text-rose-700" : "border-zinc-300 text-zinc-900"
      } ${onClick && !disabled ? "transition hover:-translate-y-1 hover:shadow-md" : "opacity-60"}`}
    >
      <span className="text-sm font-semibold">{card.rank}</span>
      <span className="self-center text-xl font-bold">{card.suit}</span>
      <span className="self-end text-sm font-semibold">{card.rank}</span>
    </button>
  );
}
