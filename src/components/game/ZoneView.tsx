import type { CardInstance } from "../../types/game";
import { CardView } from "./CardView";

interface ZoneViewProps {
  title: string;
  cards: CardInstance[];
  emptyText: string;
  subtitle?: string;
  helperText?: string;
  limit?: number;
  reverse?: boolean;
  layout?: "row" | "wrap";
  canPlayCard?: (card: CardInstance) => boolean;
  onCardClick?: (card: CardInstance) => void;
}

export function ZoneView({
  title,
  cards,
  emptyText,
  subtitle,
  helperText,
  limit,
  reverse = false,
  layout = "wrap",
  canPlayCard,
  onCardClick,
}: ZoneViewProps) {
  const visibleCards = limit ? cards.slice(-limit) : cards;
  const orderedCards = reverse ? [...visibleCards].reverse() : visibleCards;
  const listClassName =
    layout === "row"
      ? "flex gap-3 overflow-x-auto pb-2"
      : "flex flex-wrap gap-3";

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <span className="text-xs font-medium text-zinc-500">
          {subtitle ?? `${cards.length} cards`}
        </span>
      </div>
      {helperText ? <p className="mb-3 text-xs text-zinc-500">{helperText}</p> : null}
      {orderedCards.length ? (
        <div className={listClassName}>
          {orderedCards.map((card) => (
            <CardView
              key={card.instanceId}
              card={card}
              disabled={canPlayCard ? !canPlayCard(card) : false}
              onClick={onCardClick ? () => onCardClick(card) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          {emptyText}
        </div>
      )}
    </section>
  );
}
