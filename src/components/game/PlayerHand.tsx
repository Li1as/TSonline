import type { CardInstance } from "../../types/game";
import { ZoneView } from "./ZoneView";

interface PlayerHandProps {
  cards: CardInstance[];
  onPlayCard: (cardId: string) => void;
  canPlay: boolean;
  canPlayCard: (card: CardInstance) => boolean;
}

export function PlayerHand({
  cards,
  onPlayCard,
  canPlay,
  canPlayCard,
}: PlayerHandProps) {
  return (
    <ZoneView
      title="Your Hand"
      cards={cards}
      emptyText="No cards in hand."
      helperText={!canPlay ? "Wait for your turn to play a card." : undefined}
      layout="row"
      canPlayCard={(card) => canPlay && canPlayCard(card)}
      onCardClick={(card) => onPlayCard(card.id)}
    />
  );
}
