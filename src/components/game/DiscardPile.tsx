import type { CardInstance } from "../../types/game";
import { CardView } from "./CardView";

interface DiscardPileProps {
  cards: CardInstance[];
}

export function DiscardPile({ cards }: DiscardPileProps) {
  const topCards = cards.slice(-6).reverse();

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Discard Pile</h3>
        <span className="text-xs font-medium text-zinc-500">{cards.length} cards</span>
      </div>
      {topCards.length ? (
        <div className="flex flex-wrap gap-3">
          {topCards.map((card) => (
            <CardView key={card.instanceId} card={card} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          Played cards will appear here.
        </div>
      )}
    </section>
  );
}
