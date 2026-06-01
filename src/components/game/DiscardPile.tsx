import type { CardInstance } from "../../types/game";
import { ZoneView } from "./ZoneView";

interface DiscardPileProps {
  cards: CardInstance[];
}

export function DiscardPile({ cards }: DiscardPileProps) {
  return (
    <ZoneView
      title="Discard Pile"
      cards={cards}
      emptyText="Played cards will appear here."
      limit={6}
      reverse
    />
  );
}
