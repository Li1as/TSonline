import { randomUUID } from "node:crypto";
import { simpleCardDemoDefinition } from "./definitions/simple-card-demo.definition.js";

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

function createStandardTemplates() {
  return suits.flatMap((suit) =>
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
  );
}

function createDeck() {
  return createStandardTemplates().map((template) => {
    const instanceId = randomUUID();
    return {
      ...template,
      instanceId,
      id: instanceId,
    };
  });
}

function shuffle(cards) {
  const nextCards = [...cards];
  for (let index = nextCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextCards[index], nextCards[swapIndex]] = [nextCards[swapIndex], nextCards[index]];
  }
  return nextCards;
}

export function createEmptySimpleCardState(players = []) {
  return {
    gameType: "simpleCardDemo",
    status: players.length === simpleCardDemoDefinition.requiredPlayers ? "ready" : "not_started",
    roundId: null,
    roundNumber: 0,
    roundLeaderId: null,
    players,
    currentPlayerId: null,
    currentRoundPlays: [],
    deck: [],
    handsByPlayerId: {},
    discardPile: [],
    lastErrorsByPlayerId: {},
    version: 0,
  };
}

export function startSimpleCardGame(players) {
  if (players.length !== simpleCardDemoDefinition.requiredPlayers) {
    throw new Error("Simple Card Demo requires exactly 2 players.");
  }

  const deck = shuffle(createDeck());
  const handsByPlayerId = {
    [players[0].id]: deck.slice(0, 26),
    [players[1].id]: deck.slice(26),
  };

  return {
    gameType: "simpleCardDemo",
    status: "running",
    roundId: randomUUID(),
    roundNumber: 1,
    roundLeaderId: players[0].id,
    players,
    currentPlayerId: players[0].id,
    currentRoundPlays: [],
    deck: [],
    handsByPlayerId,
    discardPile: [],
    lastErrorsByPlayerId: {},
    lastAction: {
      type: "game:new",
      at: Date.now(),
    },
    version: 1,
  };
}

export function playSimpleCard(state, playerId, cardId) {
  if (state.status !== "running") {
    throw new Error("Start a new game before playing cards.");
  }
  if (state.currentPlayerId !== playerId) {
    throw new Error("It is not your turn.");
  }

  const hand = state.handsByPlayerId[playerId] ?? [];
  const card = hand.find((item) => item.id === cardId);
  if (!card) {
    throw new Error("Card is not in your hand.");
  }
  const legality = canPlayCard(state, playerId, card);
  if (!legality.ok) {
    throw new Error(legality.reason);
  }

  const currentRoundPlays = [
    ...state.currentRoundPlays,
    {
      playerId,
      card,
      playedAt: Date.now(),
    },
  ];
  const isRoundComplete = currentRoundPlays.length === state.players.length;
  const nextRoundLeaderId = isRoundComplete
    ? getNextPlayerId(state.players, state.roundLeaderId)
    : state.roundLeaderId;

  return {
    ...state,
    handsByPlayerId: {
      ...state.handsByPlayerId,
      [playerId]: hand.filter((item) => item.id !== cardId),
    },
    discardPile: [...state.discardPile, card],
    lastErrorsByPlayerId: {
      ...state.lastErrorsByPlayerId,
      [playerId]: "",
    },
    currentRoundPlays: isRoundComplete ? [] : currentRoundPlays,
    roundNumber: isRoundComplete ? state.roundNumber + 1 : state.roundNumber,
    // Minimal demo policy: next round leader alternates between the two players.
    roundLeaderId: nextRoundLeaderId,
    currentPlayerId: isRoundComplete
      ? nextRoundLeaderId
      : getNextPlayerId(state.players, playerId),
    lastAction: {
      type: "card:play",
      playerId,
      cardId: card.instanceId,
      at: Date.now(),
    },
    version: state.version + 1,
  };
}

export function canPlayCard(state, playerId, card) {
  if (state.currentPlayerId !== playerId) {
    return { ok: false, reason: "It is not your turn." };
  }

  const firstPlay = state.currentRoundPlays[0];
  if (!firstPlay) {
    return { ok: true };
  }

  const hand = state.handsByPlayerId[playerId] ?? [];
  const requiredSuit = firstPlay.card.suit;
  const hasRequiredSuit = hand.some((item) => item.suit === requiredSuit);
  if (hasRequiredSuit && card.suit !== requiredSuit) {
    return {
      ok: false,
      reason: `You must follow suit with ${requiredSuit}.`,
    };
  }

  return { ok: true };
}

function getNextPlayerId(players, currentPlayerId) {
  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  if (currentIndex === -1) {
    return players[0]?.id ?? null;
  }
  return players[(currentIndex + 1) % players.length]?.id ?? null;
}

export function toPublicSimpleCardState(state, viewerId) {
  return {
    gameType: "simpleCardDemo",
    status: state.status,
    roundId: state.roundId,
    roundNumber: state.roundNumber,
    roundLeaderId: state.roundLeaderId,
    currentPlayerId: state.currentPlayerId,
    currentRoundPlays: state.currentRoundPlays,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      handCount: state.handsByPlayerId[player.id]?.length ?? 0,
    })),
    myHand: state.handsByPlayerId[viewerId] ?? [],
    discardPile: state.discardPile,
    lastError: state.lastErrorsByPlayerId?.[viewerId] ?? "",
    lastAction: state.lastAction,
    version: state.version,
  };
}
