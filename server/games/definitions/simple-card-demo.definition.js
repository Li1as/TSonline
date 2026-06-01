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
    attributes: {
      score: {
        initial: 0,
      },
    },
  },
  config: {
    winScore: 5,
  },
  victory: [
    {
      condition: "playerAttributeAtLeast",
      target: "anyPlayer",
      attribute: "score",
      valueFrom: "config.winScore",
      winner: "matchedPlayer",
    },
  ],
  setup: {
    initialPhase: "playing",
    deck: {
      from: "cardTemplates",
      shuffle: true,
    },
    deal: {
      strategy: "evenlyToPlayers",
      to: "hand:<playerId>",
    },
    emptyVars: {
      roundNumber: 0,
      currentPlayerId: null,
      roundLeaderId: null,
      scoresByPlayerId: "$zeroScoresByPlayerId",
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      winnerId: null,
      lastRoundResult: undefined,
    },
    vars: {
      roundNumber: 1,
      currentPlayerId: "$players.0.id",
      roundLeaderId: "$players.0.id",
      scoresByPlayerId: "$zeroScoresByPlayerId",
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      winnerId: null,
      lastRoundResult: undefined,
    },
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
      conditions: [
        { type: "currentPlayerIsActor" },
        { type: "followSuitIfPossible", zone: "roundPlay" },
      ],
      effects: [
        {
          type: "moveCard",
          from: "hand:<actorId>",
          to: "roundPlay",
          cardId: "$payload.cardId",
          recordPlayedMetadata: true,
        },
      ],
    },
  ],
  triggers: [
    {
      event: "CARD_PLAYED",
      when: {
        type: "zoneCountEquals",
        zone: "roundPlay",
        count: 2,
      },
      effects: [
        {
          type: "resolveTrick",
          zone: "roundPlay",
          resultKey: "roundResult",
          rule: "higherValueInLeadSuit",
          suitField: "suit",
          valueField: "value",
        },
        {
          type: "addScore",
          playerId: "$context.roundResult.winnerId",
          amount: 1,
        },
        {
          type: "modifyPlayerAttribute",
          target: "$context.roundResult.winnerId",
          attribute: "score",
          amount: 1,
        },
        {
          type: "moveAllCards",
          from: "roundPlay",
          to: "discard",
        },
        {
          type: "setVar",
          key: "lastRoundResult",
          value: "$context.roundResult",
        },
        {
          type: "setVar",
          key: "roundNumber",
          value: "$context.nextRoundNumber",
        },
        {
          type: "setVar",
          key: "roundLeaderId",
          value: "$context.roundResult.winnerId",
        },
        {
          type: "setCurrentPlayer",
          playerId: "$context.roundResult.winnerId",
        },
      ],
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
