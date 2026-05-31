import type { Card } from "../../types/game";
import { CardView } from "./CardView";

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (cardId: string) => void;
  canPlay: boolean;
}

export function PlayerHand({ cards, onPlayCard, canPlay }: PlayerHandProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Your Hand</h3>
        <span className="text-xs font-medium text-zinc-500">{cards.length} cards</span>
      </div>
      {!canPlay ? (
        <p className="mb-3 text-xs text-zinc-500">Wait for your turn to play a card.</p>
      ) : null}
      {cards.length ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {cards.map((card) => (
            <CardView
              key={card.id}
              card={card}
              disabled={!canPlay}
              onClick={() => onPlayCard(card.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
          No cards in hand.
        </div>
      )}
    </section>
  );
}
