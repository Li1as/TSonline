import { applyGameActionWithEngine } from "./game-engine.js";
import { runTriggers } from "./game-engine-triggers.js";
import {
  createEmptyStateFromDefinition,
  startGameFromDefinition,
} from "./game-setup.js";
import { getVisibleZones } from "./game-engine-utils.js";

export function createGenericGameAdapter(definition, options = {}) {
  return {
    createEmptyState: (players = []) => createEmptyStateFromDefinition(definition, players),
    start: (players) => {
      const state = startGameFromDefinition(definition, players);
      return runInitialTurnStarted(definition, state);
    },
    applyAction: (state, playerId, action) =>
      applyGameActionWithEngine(definition, state, {
        type: action.type,
        actorId: playerId,
        payload: action,
      }),
    toPublicState:
      options.toPublicState ??
      ((state, viewerId) => toPublicGenericGameState(definition, state, viewerId)),
  };
}

export function toPublicGenericGameState(definition, state, viewerId) {
  return {
    gameType: definition.type,
    status: state.status,
    phase: state.phase,
    winnerId: state.vars.winnerId,
    roundId: state.roundId,
    zones: getVisibleZones(definition, state, viewerId),
    vars: state.vars,
    players: state.players.map((player) => ({
      ...player,
      attributes: state.vars.playerAttributesByPlayerId?.[player.id] ?? {},
    })),
    lastError: state.lastErrorsByPlayerId?.[viewerId] ?? "",
    lastAction: state.lastAction,
    version: state.version,
  };
}

function runInitialTurnStarted(definition, state) {
  const currentPlayerId = state.vars.currentPlayerId;
  if (!currentPlayerId) {
    return state;
  }

  return runTriggers(definition, "TURN_STARTED", {
    state,
    action: {
      type: "turn:started",
      actorId: currentPlayerId,
      payload: {},
    },
    actionResult: {
      playedAt: Date.now(),
    },
  }).state;
}
