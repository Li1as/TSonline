import {
  appendUniqueCards,
  getNextPlayerId,
} from "./game-engine-utils.js";
import { applyEffects } from "./game-engine-effects.js";
import {
  evaluateConditions,
  getSelectedActionCard,
} from "./game-engine-conditions.js";
import { evaluateVictory } from "./game-engine-victory.js";

export function applyGameActionWithEngine(definition, state, action, hooks = {}) {
  validateAction(definition, state, action, hooks);
  const actionResult = applyActionEffects(definition, state, action, hooks);
  return applyPostAction(definition, actionResult.state, action, actionResult, hooks);
}

export function runTriggers(definition, eventName, context, hooks = {}) {
  const triggers = definition.triggers ?? [];
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
    const result = applyEffects(
      definition,
      nextState,
      context.action,
      trigger.effects,
      triggerContext,
      hooks,
    );
    nextState = result.state;
    Object.assign(triggerContext, result.context);
  }

  return {
    state: nextState,
    context: triggerContext,
    didRun,
  };
}

function validateAction(definition, state, action, hooks) {
  if (state.status !== "running") {
    throw new Error("Start a new game before playing cards.");
  }
  if (state.phase !== "playing") {
    throw new Error("The game is finished. Start a new game to play again.");
  }

  const actionDefinition = findActionDefinition(definition, action.type);
  if (!actionDefinition) {
    throw new Error(`Unsupported action: ${action.type}`);
  }

  const selectedCard = getSelectedActionCard(state, actionDefinition, action);
  if (action.payload?.cardId && !selectedCard) {
    throw new Error("Card is not in your hand.");
  }

  const legality = evaluateConditions(
    definition,
    state,
    action,
    actionDefinition.conditions ?? [],
    { selectedCard },
    hooks,
  );
  if (!legality.ok) {
    throw new Error(legality.reason);
  }
}

function applyActionEffects(definition, state, action, hooks) {
  const actionDefinition = findActionDefinition(definition, action.type);
  if (!actionDefinition) {
    throw new Error(`Unsupported action: ${action.type}`);
  }

  return applyEffects(definition, state, action, actionDefinition.effects ?? [], {}, hooks);
}

function applyPostAction(definition, state, action, actionResult, hooks) {
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
  const onPlayResult = runCardEffects(definition, "onPlay", {
    state: stateWithDiscard,
    action,
    actionResult,
    cards: [actionResult.movedCard],
  });
  const triggerResult = runTriggers(
    definition,
    "CARD_PLAYED",
    {
      state: onPlayResult.state,
      action,
      actionResult,
      ...onPlayResult.context,
    },
    hooks,
  );
  const resolvedResult = triggerResult.context.roundResult
    ? runCardEffects(definition, "onRoundResolve", {
        state: triggerResult.state,
        action,
        actionResult,
        roundResult: triggerResult.context.roundResult,
        cards: triggerResult.context.roundResult.plays.map((play) => play.card),
      })
    : triggerResult;
  const triggeredState = resolvedResult.state;
  const victoryResult = evaluateVictory(definition, triggeredState);
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

function findActionDefinition(definition, actionType) {
  return definition.actions.find((action) => action.type === actionType);
}

function evaluateTriggerWhen(state, when) {
  if (when.type === "zoneCountEquals") {
    return (state.zones[when.zone] ?? []).length === when.count;
  }
  if (when.type === "zoneCountAtLeast") {
    return (state.zones[when.zone] ?? []).length >= when.count;
  }
  if (when.type === "zoneCountAtMost") {
    return (state.zones[when.zone] ?? []).length <= when.count;
  }

  return false;
}

function runCardEffects(definition, timing, context) {
  let nextState = context.state;
  const effectContext = { ...context };

  for (const card of context.cards) {
    const effects = card.effects?.[timing] ?? [];
    if (!effects.length) {
      continue;
    }
    const result = applyEffects(
      definition,
      nextState,
      context.action,
      effects,
      { ...effectContext, card },
    );
    nextState = result.state;
    Object.assign(effectContext, result.context);
  }

  return { state: nextState, context: effectContext };
}
