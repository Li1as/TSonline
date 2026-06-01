import { applyEffects } from "./game-engine-effects.js";
import { applyPostAction } from "./game-engine-post-action.js";
import {
  evaluateConditions,
  getSelectedActionCard,
} from "./game-engine-conditions.js";

export function applyGameActionWithEngine(definition, state, action, hooks = {}) {
  validateAction(definition, state, action, hooks);
  const actionResult = applyActionEffects(definition, state, action, hooks);
  return applyPostAction(definition, actionResult.state, action, actionResult, hooks);
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
  validateTurnLimits(definition, state, action);

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

  const cardLegality = evaluateConditions(
    definition,
    state,
    action,
    selectedCard?.playConditions ?? [],
    { selectedCard },
    hooks,
  );
  if (!cardLegality.ok) {
    throw new Error(cardLegality.reason);
  }
}

function applyActionEffects(definition, state, action, hooks) {
  const actionDefinition = findActionDefinition(definition, action.type);
  if (!actionDefinition) {
    throw new Error(`Unsupported action: ${action.type}`);
  }

  return applyEffects(definition, state, action, actionDefinition.effects ?? [], {}, hooks);
}

function validateTurnLimits(definition, state, action) {
  const turn = definition.turn;
  if (!turn) {
    return;
  }

  const playCount = state.vars.turnPlayCountByPlayerId?.[action.actorId] ?? 0;
  if (action.type === "card:play" && playCount >= turn.maxPlays) {
    throw new Error(`You can play at most ${turn.maxPlays} card(s) this turn.`);
  }
  if (action.type === "round:pass") {
    if (!turn.allowPass) {
      throw new Error("Pass is not allowed in this game.");
    }
    if (playCount < turn.minPlays) {
      throw new Error(`You must play at least ${turn.minPlays} card(s) this turn.`);
    }
  }
}

function findActionDefinition(definition, actionType) {
  return definition.actions.find((action) => action.type === actionType);
}
