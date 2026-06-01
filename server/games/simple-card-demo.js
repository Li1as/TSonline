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
  const phase =
    players.length === simpleCardDemoDefinition.players.required
      ? "ready"
      : "not_started";

  return {
    gameType: "simpleCardDemo",
    status: phase,
    phase,
    roundId: null,
    players,
    zones: createEmptyZones(players),
    vars: {
      roundNumber: 0,
      currentPlayerId: null,
      roundLeaderId: null,
      scoresByPlayerId: createScores(players),
      winnerId: null,
      lastRoundResult: undefined,
    },
    lastErrorsByPlayerId: {},
    version: 0,
  };
}

export function startSimpleCardGame(players) {
  if (players.length !== simpleCardDemoDefinition.players.required) {
    throw new Error("Simple Card Demo requires exactly 2 players.");
  }

  const deck = shuffle(createDeck());
  const zones = createEmptyZones(players);
  zones[handZoneId(players[0].id)] = deck.slice(0, 26);
  zones[handZoneId(players[1].id)] = deck.slice(26);

  return {
    gameType: "simpleCardDemo",
    status: "running",
    phase: "playing",
    roundId: randomUUID(),
    players,
    zones,
    vars: {
      roundNumber: 1,
      currentPlayerId: players[0].id,
      roundLeaderId: players[0].id,
      scoresByPlayerId: createScores(players),
      winnerId: null,
      lastRoundResult: undefined,
    },
    lastErrorsByPlayerId: {},
    lastAction: {
      type: "game:new",
      at: Date.now(),
    },
    version: 1,
  };
}

export function playSimpleCard(state, playerId, cardId) {
  return applyGameAction(state, {
    type: "card:play",
    actorId: playerId,
    payload: { cardId },
  });
}

export function applyGameAction(state, action) {
  validateAction(state, action);
  const actionResult = applyActionEffects(state, action);
  return applyPostAction(actionResult.state, action, actionResult);
}

function validateAction(state, action) {
  if (state.status !== "running") {
    throw new Error("Start a new game before playing cards.");
  }
  if (state.phase !== "playing") {
    throw new Error("The game is finished. Start a new game to play again.");
  }

  const actionDefinition = findActionDefinition(action.type);
  if (!actionDefinition) {
    throw new Error(`Unsupported action: ${action.type}`);
  }

  const card = findCardInZone(state, handZoneId(action.actorId), action.payload.cardId);
  if (!card) {
    throw new Error("Card is not in your hand.");
  }

  const legality = evaluateConditions(state, action, actionDefinition.conditions ?? [], {
    selectedCard: card,
  });
  if (!legality.ok) {
    throw new Error(legality.reason);
  }
}

function findActionDefinition(actionType) {
  return simpleCardDemoDefinition.actions.find((action) => action.type === actionType);
}

export function evaluateConditions(state, action, conditions, context = {}) {
  for (const condition of conditions) {
    const result = evaluateCondition(state, action, condition, context);
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}

export function evaluateCondition(state, action, condition, context = {}) {
  if (condition.type === "currentPlayerIsActor") {
    return state.vars.currentPlayerId === action.actorId
      ? { ok: true }
      : { ok: false, reason: "It is not your turn." };
  }

  if (condition.type === "followSuitIfPossible") {
    return canPlayCard(state, action.actorId, context.selectedCard);
  }

  return { ok: false, reason: `Unsupported condition: ${condition.type}` };
}

function applyActionEffects(state, action) {
  const actionDefinition = findActionDefinition(action.type);
  if (!actionDefinition) {
    throw new Error(`Unsupported action: ${action.type}`);
  }

  return applyEffects(state, action, actionDefinition.effects ?? []);
}

export function applyEffects(state, action, effects, initialContext = {}) {
  const context = {
    now: Date.now(),
    movedCards: [],
    ...initialContext,
  };
  let nextState = state;

  for (const effect of effects) {
    const result = applyEffect(nextState, action, effect, context);
    nextState = result.state;
    if (result.movedCard) {
      context.movedCards.push(result.movedCard);
    }
    if (result.movedCards) {
      context.movedCards.push(...result.movedCards);
    }
  }

  return {
    state: nextState,
    movedCard: context.movedCards[0] ?? null,
    movedCards: context.movedCards,
    playedAt: context.now,
    context,
  };
}

export function applyEffect(state, action, effect, context = {}) {
  if (effect.type === "moveCard") {
    const result = moveCardBetweenZones(state, {
      fromZoneId: resolveZoneId(effect.from, action),
      toZoneId: resolveZoneId(effect.to, action),
      cardId: resolveEffectValue(effect.cardId, action, context),
      transformCard: effect.recordPlayedMetadata
        ? (card) => ({
            ...card,
            playedByPlayerId: action.actorId,
            playedAt: context.now,
          })
        : undefined,
    });
    return result;
  }

  if (effect.type === "moveAllCards") {
    return moveAllCardsBetweenZones(state, {
      fromZoneId: resolveZoneId(effect.from, action),
      toZoneId: resolveZoneId(effect.to, action),
    });
  }

  if (effect.type === "setVar") {
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          [effect.key]: resolveEffectValue(effect.value, action, context),
        },
      },
    };
  }

  if (effect.type === "addScore") {
    const playerId = resolveEffectValue(effect.playerId, action, context);
    const amount = resolveEffectValue(effect.amount, action, context);
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          scoresByPlayerId: {
            ...state.vars.scoresByPlayerId,
            [playerId]: (state.vars.scoresByPlayerId[playerId] ?? 0) + amount,
          },
        },
      },
    };
  }

  if (effect.type === "setCurrentPlayer") {
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          currentPlayerId: resolveEffectValue(effect.playerId, action, context),
        },
      },
    };
  }

  if (effect.type === "resolveTrick") {
    const roundPlays = getRoundPlaysFromZone(state, effect.zone);
    const roundResult = {
      ...resolveRound(roundPlays),
      roundNumber: state.vars.roundNumber,
    };
    const nextScore =
      (state.vars.scoresByPlayerId[roundResult.winnerId] ?? 0) + 1;
    context[effect.resultKey] = roundResult;
    context.nextRoundNumber =
      nextScore >= getVictoryScoreToWin()
        ? state.vars.roundNumber
        : state.vars.roundNumber + 1;

    return { state };
  }

  throw new Error(`Unsupported effect: ${effect.type}`);
}

function applyPostAction(state, action, actionResult) {
  if (action.type !== "card:play") {
    return state;
  }

  const stateWithDiscard = {
    ...state,
    zones: {
      ...state.zones,
      discard: appendUniqueCards(state.zones.discard, [actionResult.movedCard]),
    },
  };
  const triggerResult = runTriggers("CARD_PLAYED", {
    state: stateWithDiscard,
    action,
    actionResult,
  });
  const triggeredState = triggerResult.state;
  const victoryResult = evaluateVictory(triggeredState);
  const isGameFinished = Boolean(victoryResult.winnerId);

  return {
    ...triggeredState,
    phase: isGameFinished ? "finished" : triggeredState.phase,
    vars: {
      ...triggeredState.vars,
      phase: isGameFinished ? "finished" : triggeredState.vars.phase,
      winnerId: victoryResult.winnerId,
      currentPlayerId: isGameFinished
        ? null
        : triggerResult.didRun
          ? triggeredState.vars.currentPlayerId
          : getNextPlayerId(state.players, action.actorId),
    },
    lastErrorsByPlayerId: {
      ...state.lastErrorsByPlayerId,
      [action.actorId]: "",
    },
    lastAction: {
      type: action.type,
      playerId: action.actorId,
      cardId: actionResult.movedCard.instanceId,
      at: actionResult.playedAt,
    },
    version: triggeredState.version + 1,
  };
}

export function runTriggers(eventName, context) {
  const triggers = simpleCardDemoDefinition.triggers ?? [];
  let nextState = context.state;
  let didRun = false;
  const triggerContext = {
    ...context,
  };

  for (const trigger of triggers) {
    if (trigger.event !== eventName) {
      continue;
    }
    if (!evaluateTriggerWhen(nextState, trigger.when)) {
      continue;
    }

    didRun = true;
    const result = applyEffects(nextState, context.action, trigger.effects, triggerContext);
    nextState = result.state;
    Object.assign(triggerContext, result.context);
  }

  return {
    state: nextState,
    context: triggerContext,
    didRun,
  };
}

function evaluateTriggerWhen(state, when) {
  if (when.type === "zoneCountEquals") {
    return (state.zones[when.zone] ?? []).length === when.count;
  }

  return false;
}

function moveCardBetweenZones(state, move) {
  const sourceZone = state.zones[move.fromZoneId] ?? [];
  const card = sourceZone.find((item) => item.id === move.cardId);
  if (!card) {
    throw new Error(`Card not found in zone: ${move.fromZoneId}`);
  }

  const movedCard = move.transformCard ? move.transformCard(card) : card;

  return {
    movedCard,
    state: {
      ...state,
      zones: {
        ...state.zones,
        [move.fromZoneId]: sourceZone.filter((item) => item.id !== move.cardId),
        [move.toZoneId]: [...(state.zones[move.toZoneId] ?? []), movedCard],
      },
    },
  };
}

function moveAllCardsBetweenZones(state, move) {
  const sourceZone = state.zones[move.fromZoneId] ?? [];
  if (sourceZone.length === 0) {
    return {
      movedCards: [],
      state,
    };
  }

  return {
    movedCards: sourceZone,
    state: {
      ...state,
      zones: {
        ...state.zones,
        [move.fromZoneId]: [],
        [move.toZoneId]: appendUniqueCards(
          state.zones[move.toZoneId] ?? [],
          sourceZone,
        ),
      },
    },
  };
}

function appendUniqueCards(existingCards, cardsToAppend) {
  const existingIds = new Set(existingCards.map((card) => card.id));
  return [
    ...existingCards,
    ...cardsToAppend.filter((card) => card && !existingIds.has(card.id)),
  ];
}

function resolveZoneId(zoneId, action) {
  return zoneId.replace("<actorId>", action.actorId);
}

function resolveEffectValue(value, action, context) {
  if (value === "$actorId") {
    return action.actorId;
  }
  if (value === "$now") {
    return context.now;
  }
  if (value === "$payload.cardId") {
    return action.payload.cardId;
  }
  if (typeof value === "string" && value.startsWith("$context.")) {
    return getPathValue(context, value.slice("$context.".length));
  }
  return value;
}

function getPathValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function findCardInZone(state, zoneId, cardId) {
  return (state.zones[zoneId] ?? []).find((item) => item.id === cardId);
}

export function evaluateVictory(state) {
  const victory = simpleCardDemoDefinition.victory;
  if (!victory) {
    return { winnerId: null };
  }

  if (victory.condition === "scoreAtLeast") {
    const scoresByPlayerId = getPathValue(state, victory.scoreSource) ?? {};
    const scoreToWin = getVictoryScoreToWin();
    const winnerId =
      Object.entries(scoresByPlayerId).find(([, score]) => score >= scoreToWin)?.[0] ??
      null;

    return { winnerId };
  }

  return { winnerId: null };
}

function getVictoryScoreToWin() {
  const victory = simpleCardDemoDefinition.victory;
  return victory?.value ?? getPathValue(simpleCardDemoDefinition, victory?.valueFrom);
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
  const firstPlay = getRoundPlays(state)[0];
  if (!firstPlay) {
    return { ok: true };
  }

  const hand = getPlayerHand(state, playerId);
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

function createEmptyZones(players) {
  return {
    deck: [],
    discard: [],
    roundPlay: [],
    ...Object.fromEntries(players.map((player) => [handZoneId(player.id), []])),
  };
}

function handZoneId(playerId) {
  return `hand:${playerId}`;
}

function getPlayerHand(state, playerId) {
  return state.zones[handZoneId(playerId)] ?? [];
}

function getRoundPlays(state) {
  return getRoundPlaysFromZone(state, "roundPlay");
}

function getRoundPlaysFromZone(state, zoneId) {
  return (state.zones[zoneId] ?? []).map((card) => ({
    playerId: card.playedByPlayerId,
    card,
    playedAt: card.playedAt,
  }));
}

export function toPublicSimpleCardState(state, viewerId) {
  const currentRoundPlays = getRoundPlays(state);
  const scoresByPlayerId = state.vars.scoresByPlayerId ?? {};

  return {
    gameType: "simpleCardDemo",
    status: state.status,
    phase: state.phase,
    winnerId: state.vars.winnerId,
    roundId: state.roundId,
    zones: getPublicZones(state, viewerId),
    vars: state.vars,
    roundNumber: state.vars.roundNumber,
    roundLeaderId: state.vars.roundLeaderId,
    currentPlayerId: state.vars.currentPlayerId,
    currentRoundPlays,
    players: state.players.map((player) => ({
      id: player.id,
      name: player.name,
      handCount: getPlayerHand(state, player.id).length,
      score: scoresByPlayerId[player.id] ?? 0,
    })),
    myHand: getPlayerHand(state, viewerId),
    discardPile: state.zones.discard,
    scoresByPlayerId,
    lastRoundResult: state.vars.lastRoundResult,
    lastError: state.lastErrorsByPlayerId?.[viewerId] ?? "",
    lastAction: state.lastAction,
    version: state.version,
  };
}

function getPublicZones(state, viewerId) {
  const zones = {};

  for (const [zoneId, cards] of Object.entries(state.zones)) {
    zones[zoneId] = getVisibleZoneCards(zoneId, cards, viewerId);
  }

  return zones;
}

function getVisibleZoneCards(zoneId, cards, viewerId) {
  const zoneDefinition = getZoneDefinition(zoneId);
  if (!zoneDefinition) {
    return [];
  }

  if (zoneDefinition.visibility === "public") {
    return cards;
  }

  if (zoneDefinition.visibility === "owner") {
    return getZoneOwnerId(zoneId, zoneDefinition) === viewerId ? cards : [];
  }

  return [];
}

function getZoneDefinition(zoneId) {
  const baseZoneId = zoneId.split(":")[0];
  return simpleCardDemoDefinition.zones.find((zone) => zone.id === baseZoneId);
}

function getZoneOwnerId(zoneId, zoneDefinition) {
  if (zoneDefinition.owner !== "player") {
    return null;
  }

  return zoneId.split(":")[1] ?? null;
}
