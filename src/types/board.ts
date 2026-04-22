export interface BoardSummary {
  title: string;
  phase: string;
  turn: number;
  activePlayer: string;
  layers: string[];
  zones: string[];
  decks: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}
