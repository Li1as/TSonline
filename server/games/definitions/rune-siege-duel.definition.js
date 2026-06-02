const iconUrl = "/favicon.svg";

function copies(count, template) {
  return Array.from({ length: count }, (_, index) => ({
    ...template,
    templateId: `${template.templateId}-${index + 1}`,
  }));
}

const strike = copies(8, {
  templateId: "rune-strike",
  name: "Rune Strike",
  description: "Deal 1 damage to the opponent.",
  imageUrl: iconUrl,
  suit: "ATK",
  rank: "1",
  value: 1,
  props: { kind: "attack", timing: "instant" },
  effects: {
    onPlay: [
      {
        type: "dealDamage",
        target: "opponent",
        amount: 1,
        shieldAttribute: "shield",
        hpAttribute: "hp",
      },
    ],
  },
});

const blast = copies(4, {
  templateId: "rune-blast",
  name: "Arcane Blast",
  description: "Deal 2 damage to the opponent.",
  imageUrl: iconUrl,
  suit: "ATK",
  rank: "2",
  value: 2,
  props: { kind: "attack", timing: "instant" },
  effects: {
    onPlay: [
      {
        type: "dealDamage",
        target: "opponent",
        amount: 2,
        shieldAttribute: "shield",
        hpAttribute: "hp",
      },
    ],
  },
});

const recover = copies(5, {
  templateId: "rune-recover",
  name: "Mending Glyph",
  description: "Restore 2 HP if you are below full HP.",
  imageUrl: iconUrl,
  suit: "HEAL",
  rank: "H",
  value: 2,
  props: { kind: "heal", timing: "instant" },
  playConditions: [
    {
      type: "playerAttributeBelow",
      target: "actor",
      attribute: "hp",
      value: 8,
    },
  ],
  effects: {
    onPlay: [
      {
        type: "modifyPlayerAttribute",
        target: "actor",
        attribute: "hp",
        amount: 2,
      },
    ],
  },
});

const focus = copies(5, {
  templateId: "rune-focus",
  name: "Focus Rune",
  description: "Gain 2 energy.",
  imageUrl: iconUrl,
  suit: "FOC",
  rank: "E",
  value: 2,
  props: { kind: "resource", timing: "instant" },
  effects: {
    onPlay: [
      {
        type: "modifyPlayerAttribute",
        target: "actor",
        attribute: "energy",
        amount: 2,
      },
    ],
  },
});

const guard = copies(5, {
  templateId: "rune-guard",
  name: "Ward Shell",
  description: "Gain 2 shield.",
  imageUrl: iconUrl,
  suit: "DEF",
  rank: "S",
  value: 2,
  props: { kind: "defense", timing: "instant" },
  effects: {
    onPlay: [
      {
        type: "modifyPlayerAttribute",
        target: "actor",
        attribute: "shield",
        amount: 2,
      },
    ],
  },
});

const insight = copies(4, {
  templateId: "rune-insight",
  name: "Scholar's Insight",
  description: "Draw 2 cards.",
  imageUrl: iconUrl,
  suit: "DRAW",
  rank: "D",
  value: 2,
  props: { kind: "draw", timing: "instant" },
  effects: {
    onPlay: [{ type: "drawCards", from: "deck", to: "hand:<actor>", count: 2 }],
  },
});

const recycle = copies(2, {
  templateId: "rune-recycle",
  name: "Archive Recall",
  description: "Shuffle the discard pile back into the deck.",
  imageUrl: iconUrl,
  suit: "UTIL",
  rank: "R",
  value: 0,
  props: { kind: "utility", timing: "instant" },
  effects: {
    onPlay: [
      { type: "moveAllCards", from: "discard", to: "deck", shuffleAfter: true },
    ],
  },
});

export const runeSiegeDuelDefinition = {
  type: "runeSiegeDuel",
  title: "Rune Siege Duel",
  version: 1,
  runtime: "generic",
  players: {
    min: 2,
    max: 2,
    required: 2,
    attributes: {
      hp: { initial: 8, min: 0, max: 8 },
      energy: { initial: 0, min: 0, max: 10 },
      shield: { initial: 0, min: 0, max: 10 },
    },
  },
  config: {},
  setup: {
    initialPhase: "playing",
    deck: { from: "cardTemplates", shuffle: true, zone: "deck" },
    deal: {
      strategy: "fixedCountToPlayers",
      from: "deck",
      to: "hand:<playerId>",
      count: 5,
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
  turn: { minPlays: 0, maxPlays: 1, allowPass: true },
  victory: [
    {
      condition: "playerAttributeAtMost",
      target: "anyPlayer",
      attribute: "hp",
      value: 0,
      winner: "opponentOfMatchedPlayer",
    },
    {
      condition: "playerAttributeAtLeast",
      target: "anyPlayer",
      attribute: "energy",
      value: 10,
      winner: "matchedPlayer",
    },
  ],
  zones: [
    {
      id: "deck",
      label: "Rune Deck",
      owner: "game",
      visibility: "hidden",
      accepts: ["card"],
    },
    {
      id: "discard",
      label: "Archive",
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
    { type: "game:new", label: "New Game" },
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
  cardTemplates: [
    ...strike,
    ...blast,
    ...recover,
    ...focus,
    ...guard,
    ...insight,
    ...recycle,
  ],
  ui: {
    cardDisplayFields: ["name", "description", "props"],
    showScoreboard: false,
    showRoundInfo: false,
  },
};
