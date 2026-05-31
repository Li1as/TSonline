export const simpleCardDemoDefinition = {
  type: "simpleCardDemo",
  title: "Simple Card Demo",
  minPlayers: 2,
  maxPlayers: 2,
  requiredPlayers: 2,
  zones: [
    { id: "playerHand", label: "Player Hand", visibility: "owner" },
    { id: "discardPile", label: "Discard Pile", visibility: "public" },
  ],
  actions: [
    { type: "game:new", label: "New Game" },
    {
      type: "card:play",
      label: "Play Card",
      source: "playerHand",
      target: "discardPile",
    },
  ],
};
