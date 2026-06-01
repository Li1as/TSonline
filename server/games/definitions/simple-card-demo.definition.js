const suits = ["S", "H", "D", "C"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const rankValues = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  "10": 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2,
};

export const simpleCardDemoDefinition = {
  type: "simpleCardDemo",
  title: "Simple Card Demo",
  version: 1,
  players: {
    min: 2,
    max: 2,
    required: 2,
  },
  config: {
    winScore: 5,
  },
  zones: [
    {
      id: "deck",
      label: "Deck",
      owner: "game",
      visibility: "hidden",
      accepts: ["card"],
    },
    {
      id: "discard",
      label: "Discard Pile",
      owner: "game",
      visibility: "public",
      accepts: ["card"],
    },
    {
      id: "roundPlay",
      label: "Current Round Plays",
      owner: "game",
      visibility: "public",
      accepts: ["card"],
    },
    {
      id: "hand",
      label: "Player Hand",
      owner: "player",
      visibility: "owner",
      accepts: ["card"],
    },
  ],
  actions: [
    {
      type: "game:new",
      label: "New Game",
      description: "Shuffle the configured deck and deal it evenly to both players.",
    },
    {
      type: "card:play",
      label: "Play Card",
      description: "Move one card from the current player's hand into the round.",
      source: "hand",
      target: "roundPlay",
    },
  ],
  cardTemplates: suits.flatMap((suit) =>
    ranks.map((rank) => ({
      templateId: `standard-${suit}-${rank}`,
      name: `${rank}${suit}`,
      description: `Standard ${rank} of ${suit}`,
      imageUrl: "",
      suit,
      rank,
      value: rankValues[rank],
      props: {},
    })),
  ),
  ui: {
    cardDisplayFields: ["name", "suit", "rank", "value", "description", "imageUrl"],
    showScoreboard: true,
    showRoundInfo: true,
  },
};
