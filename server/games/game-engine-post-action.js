import { applyEffects } from "./game-engine-effects.js";
import { runTriggers } from "./game-engine-triggers.js";
import { evaluateVictory } from "./game-engine-victory.js";
import {
  appendUniqueCards,
  getNextPlayerId,
} from "./game-engine-utils.js";

export function applyPostAction(definition, state, action, actionResult, hooks) {
  if (action.type === "round:pass") {
    return finishAction(
      definition,
      advanceTurn(state, action),
      action,
      actionResult,
      true,
      hooks,
    );
  }

  if (action.type !== "card:play") {
    return finishAction(definition, state, action, actionResult, false, hooks);
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
      ...onPlayResult.context,
      state: onPlayResult.state,
      action,
      actionResult,
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
  const stateWithTurnCount = incrementTurnPlayCount(
    resolvedResult.state,
    action.actorId,
  );
  const shouldAdvance = shouldAdvanceAfterCardPlay(definition, stateWithTurnCount, action);
  const nextState = triggerResult.didRun
    ? resetTurnPlayCount(stateWithTurnCount, stateWithTurnCount.vars.currentPlayerId)
    : shouldAdvance
      ? advanceTurn(stateWithTurnCount, action)
      : stateWithTurnCount;

  return finishAction(definition, nextState, action, actionResult, shouldAdvance, hooks);
}

function finishAction(definition, state, action, actionResult, didAdvance, hooks) {
  const stateAfterTurnStart = didAdvance
    ? runTurnStarted(definition, state, action, actionResult, hooks)
    : state;
  const victoryResult = evaluateVictory(definition, stateAfterTurnStart);
  const isGameFinished = Boolean(victoryResult.winnerId);

  return {
    ...stateAfterTurnStart,
    phase: isGameFinished ? "finished" : stateAfterTurnStart.phase,
    vars: {
      ...stateAfterTurnStart.vars,
      phase: isGameFinished ? "finished" : stateAfterTurnStart.vars.phase,
      winnerId: victoryResult.winnerId,
      currentPlayerId: isGameFinished ? null : stateAfterTurnStart.vars.currentPlayerId,
    },
    lastErrorsByPlayerId: {
      ...state.lastErrorsByPlayerId,
      [action.actorId]: "",
    },
    lastAction: {
      type: action.type,
      playerId: action.actorId,
      cardId: actionResult.movedCard?.instanceId,
      at: actionResult.playedAt,
    },
    version: stateAfterTurnStart.version + 1,
  };
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

function incrementTurnPlayCount(state, playerId) {
  const counts = state.vars.turnPlayCountByPlayerId ?? {};
  return {
    ...state,
    vars: {
      ...state.vars,
      turnPlayCountByPlayerId: {
        ...counts,
        [playerId]: (counts[playerId] ?? 0) + 1,
      },
    },
  };
}

function resetTurnPlayCount(state, playerId) {
  if (!playerId) {
    return state;
  }
  return {
    ...state,
    vars: {
      ...state.vars,
      turnPlayCountByPlayerId: {
        ...(state.vars.turnPlayCountByPlayerId ?? {}),
        [playerId]: 0,
      },
    },
  };
}

function shouldAdvanceAfterCardPlay(definition, state, action) {
  const turn = definition.turn;
  if (!turn) {
    return true;
  }
  return (state.vars.turnPlayCountByPlayerId?.[action.actorId] ?? 0) >= turn.maxPlays;
}

function advanceTurn(state, action) {
  const nextPlayerId = getNextPlayerId(state.players, action.actorId);
  return resetTurnPlayCount(
    {
      ...state,
      vars: {
        ...state.vars,
        currentPlayerId: nextPlayerId,
      },
    },
    nextPlayerId,
  );
}

function runTurnStarted(definition, state, action, actionResult, hooks) {
  const nextActorId = state.vars.currentPlayerId;
  if (!nextActorId) {
    return state;
  }
  return runTriggers(
    definition,
    "TURN_STARTED",
    {
      state,
      action: {
        type: "turn:started",
        actorId: nextActorId,
        payload: {},
      },
      actionResult,
    },
    hooks,
  ).state;
}
