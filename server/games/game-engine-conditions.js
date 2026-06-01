import {
  findCardInZone,
  getPathValue,
  getRoundPlaysFromZone,
} from "./game-engine-utils.js";

export function evaluateConditions(
  definition,
  state,
  action,
  conditions,
  context = {},
) {
  for (const condition of conditions) {
    const result = evaluateCondition(definition, state, action, condition, context);
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}

export function evaluateCondition(definition, state, action, condition, context = {}) {
  if (condition.type === "currentPlayerIsActor") {
    return state.vars.currentPlayerId === action.actorId
      ? { ok: true }
      : { ok: false, reason: "It is not your turn." };
  }

  if (condition.type === "followSuitIfPossible") {
    return evaluateFollowSuit(state, action, context, condition);
  }

  if (condition.type === "phaseIs") {
    return state.phase === condition.phase
      ? { ok: true }
      : { ok: false, reason: `Game phase must be ${condition.phase}.` };
  }

  if (condition.type === "varEquals") {
    return getPathValue(state.vars, condition.path) === condition.value
      ? { ok: true }
      : { ok: false, reason: "Action condition was not met." };
  }

  if (condition.type === "playerAttributeBelow") {
    const playerId = action.actorId;
    const currentValue =
      state.vars.playerAttributesByPlayerId?.[playerId]?.[condition.attribute] ?? 0;
    return currentValue < condition.value
      ? { ok: true }
      : { ok: false, reason: `${condition.attribute} is already full.` };
  }

  return { ok: false, reason: `Unsupported condition: ${condition.type}` };
}

export function getSelectedActionCard(state, actionDefinition, action) {
  if (!action.payload?.cardId) {
    return null;
  }

  const sourceZoneId = actionDefinition.source
    ? `${actionDefinition.source}:${action.actorId}`
    : handZoneId(action.actorId);
  return findCardInZone(state, sourceZoneId, action.payload.cardId);
}

function evaluateFollowSuit(state, action, context, condition) {
  const firstPlay = getRoundPlaysFromZone(state, condition.zone ?? "roundPlay")[0];
  if (!firstPlay) {
    return { ok: true };
  }

  const suitField = condition.suitField ?? "suit";
  const selectedCard = context.selectedCard;
  const requiredSuit = firstPlay.card[suitField];
  const handZone = state.zones[handZoneId(action.actorId)] ?? [];
  const hasRequiredSuit = handZone.some((card) => card[suitField] === requiredSuit);
  if (hasRequiredSuit && selectedCard?.[suitField] !== requiredSuit) {
    return {
      ok: false,
      reason: `You must follow suit with ${requiredSuit}.`,
    };
  }

  return { ok: true };
}

function handZoneId(playerId) {
  return `hand:${playerId}`;
}
