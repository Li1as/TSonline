const attackCards = Array.from({ length: 10 }, (_, index) => ({
  templateId: `attribute-duel-attack-${index + 1}`,
  name: "Strike",
  description: "Deal 1 damage to the opponent.",
  imageUrl: "",
  suit: "S",
  rank: "A",
  value: 1,
  props: { kind: "attack" },
  effects: {
    onPlay: [
      {
        type: "modifyPlayerAttribute",
        target: "opponent",
        attribute: "hp",
        amount: -1,
      },
    ],
  },
}));

const healCards = Array.from({ length: 10 }, (_, index) => ({
  templateId: `attribute-duel-heal-${index + 1}`,
  name: "Recover",
  description: "Restore 1 HP if you are below full HP.",
  imageUrl: "",
  suit: "H",
  rank: "2",
  value: 1,
  props: { kind: "heal" },
  playConditions: [
    {
      type: "playerAttributeBelow",
      target: "actor",
      attribute: "hp",
      value: 3,
    },
  ],
  effects: {
    onPlay: [
      {
        type: "modifyPlayerAttribute",
        target: "actor",
        attribute: "hp",
        amount: 1,
      },
    ],
  },
}));

export const attributeDuelDefinition = {
  type: "attributeDuel",
  title: "Attribute Duel",
  version: 1,
  runtime: "generic",
  players: {
    min: 2,
    max: 2,
    required: 2,
    attributes: {
      hp: {
        initial: 3,
        min: 0,
        max: 3,
      },
    },
  },
  config: {},
  setup: {
    initialPhase: "playing",
    deck: {
      from: "cardTemplates",
      shuffle: true,
      zone: "deck",
    },
    deal: {
      strategy: "fixedCountToPlayers",
      from: "deck",
      to: "hand:<playerId>",
      count: 3,
    },
    emptyVars: {
      currentPlayerId: null,
      winnerId: null,
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      turnPlayCountByPlayerId: "$zeroScoresByPlayerId",
    },
    vars: {
      currentPlayerId: "$players.0.id",
      winnerId: null,
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      turnPlayCountByPlayerId: "$zeroScoresByPlayerId",
    },
  },
  turn: {
    minPlays: 0,
    maxPlays: 1,
    allowPass: true,
  },
  victory: [
    {
      condition: "playerAttributeAtMost",
      target: "anyPlayer",
      attribute: "hp",
      value: 0,
      winner: "opponentOfMatchedPlayer",
    },
  ],
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
      label: "Discard",
      owner: "game",
      visibility: "public",
      accepts: ["card"],
    },
    {
      id: "hand",
      label: "Hand",
      owner: "player",
      visibility: "owner",
      accepts: ["card"],
    },
  ],
  actions: [
    {
      type: "game:new",
      label: "New Game",
    },
    {
      type: "card:play",
      label: "Play Card",
      source: "hand",
      target: "discard",
      conditions: [{ type: "currentPlayerIsActor" }],
      effects: [
        {
          type: "moveCard",
          from: "hand:<actor>",
          to: "discard",
          cardId: "$payload.cardId",
          recordPlayedMetadata: true,
        },
      ],
    },
    {
      type: "round:pass",
      label: "Pass",
      conditions: [{ type: "currentPlayerIsActor" }],
      effects: [],
    },
  ],
  triggers: [
    {
      event: "TURN_STARTED",
      when: { type: "always" },
      effects: [
        {
          type: "drawCards",
          from: "deck",
          to: "hand:<currentPlayer>",
          count: 1,
        },
      ],
    },
  ],
  cardTemplates: [...attackCards, ...healCards],
  ui: {
    cardDisplayFields: ["name", "description", "props"],
    showScoreboard: false,
    showRoundInfo: false,
  },
};
