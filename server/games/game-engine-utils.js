export function getVisibleZones(definition, state, viewerId) {
  const zones = {};

  for (const [zoneId, cards] of Object.entries(state.zones)) {
    zones[zoneId] = getVisibleZoneCards(definition, zoneId, cards, viewerId);
  }

  return zones;
}

export function getRoundPlaysFromZone(state, zoneId) {
  return (state.zones[zoneId] ?? []).map((card) => ({
    playerId: card.playedByPlayerId,
    card,
    playedAt: card.playedAt,
  }));
}

export function getPlayerIds(state) {
  return state.players.map((player) => player.id);
}

export function getOpponentId(state, playerId) {
  return getPlayerIds(state).find((id) => id !== playerId) ?? null;
}

export function resolvePlayerSelector(selector, state, action, context = {}) {
  if (!selector || selector === "actor") {
    return action.actorId;
  }
  if (selector === "opponent") {
    return getOpponentId(state, action.actorId);
  }
  if (selector === "currentPlayer") {
    return state.vars.currentPlayerId;
  }
  if (selector === "roundWinner") {
    return context.roundResult?.winnerId ?? null;
  }
  if (selector === "roundLoser") {
    return getOpponentId(state, context.roundResult?.winnerId);
  }
  if (selector === "matchedPlayer") {
    return context.matchedPlayerId ?? null;
  }
  if (typeof selector === "string" && selector.startsWith("$context.")) {
    return getPathValue(context, selector.slice("$context.".length));
  }
  return selector;
}

export function getPathValue(source, path) {
  return path?.split(".").reduce((value, key) => value?.[key], source);
}

export function moveCardBetweenZones(state, move) {
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

export function moveAllCardsBetweenZones(state, move) {
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

export function moveTopCardsBetweenZones(state, move) {
  const sourceZone = state.zones[move.fromZoneId] ?? [];
  const movedCards = sourceZone.slice(0, move.count);
  if (movedCards.length === 0) {
    return { movedCards: [], state };
  }

  return {
    movedCards,
    state: {
      ...state,
      zones: {
        ...state.zones,
        [move.fromZoneId]: sourceZone.slice(movedCards.length),
        [move.toZoneId]: [...(state.zones[move.toZoneId] ?? []), ...movedCards],
      },
    },
  };
}

export function appendUniqueCards(existingCards, cardsToAppend) {
  const existingIds = new Set(existingCards.map((card) => card.id));
  return [
    ...existingCards,
    ...cardsToAppend.filter((card) => card && !existingIds.has(card.id)),
  ];
}

export function resolveZoneId(zoneId, action) {
  return zoneId.replace("<actorId>", action.actorId);
}

export function resolveZoneSelector(zoneId, state, action, context = {}) {
  return zoneId
    .replace("<actor>", action.actorId)
    .replace("<actorId>", action.actorId)
    .replace("<currentPlayer>", state.vars.currentPlayerId ?? "")
    .replace("<opponent>", getOpponentId(state, action.actorId) ?? "")
    .replace("<roundWinner>", context.roundResult?.winnerId ?? "")
    .replace("<roundLoser>", getOpponentId(state, context.roundResult?.winnerId) ?? "");
}

export function replacePlayerToken(value, playerId) {
  return value.replace("<playerId>", playerId);
}

export function resolveEffectValue(value, action, context) {
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

export function findCardInZone(state, zoneId, cardId) {
  return (state.zones[zoneId] ?? []).find((item) => item.id === cardId);
}

export function getVictoryScoreToWin(definition) {
  const victory = Array.isArray(definition.victory)
    ? definition.victory[0]
    : definition.victory;
  return victory?.value ?? getPathValue(definition, victory?.valueFrom);
}

export function shuffleCards(cards) {
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

export function getNextPlayerId(players, currentPlayerId) {
  const currentIndex = players.findIndex(
    (player) => player.id === currentPlayerId,
  );
  if (currentIndex === -1) {
    return players[0]?.id ?? null;
  }
  return players[(currentIndex + 1) % players.length]?.id ?? null;
}

function getVisibleZoneCards(definition, zoneId, cards, viewerId) {
  const zoneDefinition = getZoneDefinition(definition, zoneId);
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

function getZoneDefinition(definition, zoneId) {
  const baseZoneId = zoneId.split(":")[0];
  return definition.zones.find((zone) => zone.id === baseZoneId);
}

function getZoneOwnerId(zoneId, zoneDefinition) {
  if (zoneDefinition.owner !== "player") {
    return null;
  }

  return zoneId.split(":")[1] ?? null;
}
