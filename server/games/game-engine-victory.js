import {
  getOpponentId,
  getPathValue,
  getVictoryScoreToWin,
} from "./game-engine-utils.js";

export function evaluateVictory(definition, state) {
  const conditions = Array.isArray(definition.victory)
    ? definition.victory
    : [definition.victory].filter(Boolean);
  if (!conditions.length) {
    return { winnerId: null };
  }

  for (const victory of conditions) {
    const result = evaluateVictoryCondition(definition, state, victory);
    if (result.winnerId) {
      return result;
    }
  }

  return { winnerId: null };
}

function evaluateVictoryCondition(definition, state, victory) {
  if (victory.condition === "scoreAtLeast") {
    const scoresByPlayerId = getPathValue(state, victory.scoreSource) ?? {};
    const scoreToWin = getVictoryScoreToWin(definition);
    const winnerId =
      Object.entries(scoresByPlayerId).find(([, score]) => score >= scoreToWin)?.[0] ??
      null;

    return { winnerId };
  }

  if (victory.condition === "playerAttributeAtLeast") {
    const targetValue = resolveVictoryValue(definition, victory);
    return findAttributeVictory(state, victory, (value) => value >= targetValue);
  }

  if (victory.condition === "playerAttributeAtMost") {
    const targetValue = resolveVictoryValue(definition, victory);
    return findAttributeVictory(state, victory, (value) => value <= targetValue);
  }

  if (victory.condition === "zoneCountAtLeast") {
    return findZoneCountVictory(state, victory, (count) => count >= victory.count);
  }

  if (victory.condition === "zoneCountAtMost") {
    return findZoneCountVictory(state, victory, (count) => count <= victory.count);
  }

  return { winnerId: null };
}

function resolveVictoryValue(definition, victory) {
  return victory.value ?? getPathValue(definition, victory.valueFrom);
}

function findAttributeVictory(state, victory, predicate) {
  const attributesByPlayerId = state.vars.playerAttributesByPlayerId ?? {};
  for (const [playerId, attributes] of Object.entries(attributesByPlayerId)) {
    if (predicate(attributes[victory.attribute] ?? 0)) {
      return { winnerId: resolveVictoryWinner(state, victory.winner, playerId) };
    }
  }
  return { winnerId: null };
}

function findZoneCountVictory(state, victory, predicate) {
  const candidatePlayerIds =
    victory.owner === "anyPlayer" ? state.players.map((player) => player.id) : [null];
  for (const playerId of candidatePlayerIds) {
    const zoneId = playerId ? `${victory.zone}:${playerId}` : victory.zone;
    if (predicate((state.zones[zoneId] ?? []).length)) {
      return { winnerId: resolveVictoryWinner(state, victory.winner, playerId) };
    }
  }
  return { winnerId: null };
}

function resolveVictoryWinner(state, winner, matchedPlayerId) {
  if (winner === "opponentOfMatchedPlayer") {
    return getOpponentId(state, matchedPlayerId);
  }
  return matchedPlayerId;
}
