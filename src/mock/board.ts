import type { BoardSummary } from "../types/board";

export const boardSummary: BoardSummary = {
  title: "Harbor District",
  phase: "Setup",
  turn: 3,
  activePlayer: "Ava",
  layers: ["Base Map", "Objects", "Fog", "Annotations"],
  zones: ["North Seat", "Market Row", "Quest Area", "Discard Zone"],
  decks: [
    { id: "D-1", name: "Market Deck", count: 28 },
    { id: "D-2", name: "Quest Deck", count: 12 },
    { id: "D-3", name: "Discard Pile", count: 9 },
  ],
};
