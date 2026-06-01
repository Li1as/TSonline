import { randomUUID } from "node:crypto";
import { simpleCardDemoDefinition } from "./definitions/simple-card-demo.definition.js";

function createDeck() {
  return simpleCardDemoDefinition.cardTemplates.map((template) => {
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
    [nextCards[index], nextCards[swapIndex]] = [
      nextCards[swapIndex],
      nextCards[index],
    ];
  }
  return nextCards;
}

export function createEmptySimpleCardState(players = []) {
  return {
    gameType: "simpleCardDemo",
    status:
      players.length === simpleCardDemoDefinition.players.required
        ? "ready"
        : "not_started",
    phase:
      players.length === simpleCardDemoDefinition.players.required
        ? "ready"
        : "not_started",
    winnerId: null,
    roundId: null,
    roundNumber: 0,
    roundLeaderId: null,
    players,
    currentPlayerId: null,
    currentRoundPlays: [],
    scoresByPlayerId: createScores(players),
    deck: [],
    handsByPlayerId: {},
    discardPile: [],
    lastErrorsByPlayerId: {},
    version: 0,
  };
}

export function startSimpleCardGame(players) {
  if (players.length !== simpleCardDemoDefinition.players.required) {
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
    phase: "playing",
    winnerId: null,
    roundId: randomUUID(),
    roundNumber: 1,
    roundLeaderId: players[0].id,
    players,
    currentPlayerId: players[0].id,
    currentRoundPlays: [],
    scoresByPlayerId: createScores(players),
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
  if (state.phase !== "playing") {
    throw new Error("The game is finished. Start a new game to play again.");
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
  const roundResult = isRoundComplete ? resolveRound(currentRoundPlays) : null;
  const nextRoundLeaderId = roundResult?.winnerId ?? state.roundLeaderId;
  const scoresByPlayerId = roundResult
    ? {
        ...state.scoresByPlayerId,
        [roundResult.winnerId]:
          (state.scoresByPlayerId[roundResult.winnerId] ?? 0) + 1,
      }
    : state.scoresByPlayerId;
  const winnerId = getGameWinnerId(scoresByPlayerId);
  const isGameFinished = Boolean(winnerId);

  return {
    ...state,
    phase: isGameFinished ? "finished" : state.phase,
    winnerId,
    handsByPlayerId: {
      ...state.handsByPlayerId,
      [playerId]: hand.filter((item) => item.id !== cardId),
    },
    discardPile: [...state.discardPile, card],
    scoresByPlayerId,
    lastRoundResult: roundResult
      ? {
          ...roundResult,
          roundNumber: state.roundNumber,
        }
      : state.lastRoundResult,
    lastErrorsByPlayerId: {
      ...state.lastErrorsByPlayerId,
      [playerId]: "",
    },
    currentRoundPlays:
      isRoundComplete || isGameFinished ? [] : currentRoundPlays,
    roundNumber:
      isRoundComplete && !isGameFinished
        ? state.roundNumber + 1
        : state.roundNumber,
    roundLeaderId: nextRoundLeaderId,
    currentPlayerId: isGameFinished
      ? null
      : isRoundComplete
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

function getGameWinnerId(scoresByPlayerId) {
  return (
    Object.entries(scoresByPlayerId).find(
      ([, score]) => score >= simpleCardDemoDefinition.config.winScore,
    )?.[0] ?? null
  );
}

export function resolveRound(roundPlays) {
  const [leadPlay, responsePlay] = roundPlays;
  if (!leadPlay || !responsePlay) {
    throw new Error("A round requires two played cards.");
  }

  const didFollowSuit = responsePlay.card.suit === leadPlay.card.suit;
  const didBeatLead =
    didFollowSuit && responsePlay.card.value > leadPlay.card.value;
  const winnerPlay = didBeatLead ? responsePlay : leadPlay;

  return {
    winnerId: winnerPlay.playerId,
    leadSuit: leadPlay.card.suit,
    winningCard: winnerPlay.card,
    plays: roundPlays,
  };
}

function createScores(players) {
  return Object.fromEntries(players.map((player) => [player.id, 0]));
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
  const currentIndex = players.findIndex(
    (player) => player.id === currentPlayerId,
  );
  if (currentIndex === -1) {
    return players[0]?.id ?? null;
  }
  return players[(currentIndex + 1) % players.length]?.id ?? null;
}

export function toPublicSimpleCardState(state, viewerId) {
  return {
    gameType: "simpleCardDemo",
    status: state.status,
    phase: state.phase,
    winnerId: state.winnerId,
    roundId: state.roundId,
    roundNumber: state.roundNumber,
    roundLeaderId: state.roundLeaderId,
    currentPlayerId: state.currentPlayerId,
    currentRoundPlays: state.currentRoundPlays,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      handCount: state.handsByPlayerId[player.id]?.length ?? 0,
      score: state.scoresByPlayerId?.[player.id] ?? 0,
    })),
    myHand: state.handsByPlayerId[viewerId] ?? [],
    discardPile: state.discardPile,
    scoresByPlayerId: state.scoresByPlayerId ?? {},
    lastRoundResult: state.lastRoundResult,
    lastError: state.lastErrorsByPlayerId?.[viewerId] ?? "",
    lastAction: state.lastAction,
    version: state.version,
  };
}
