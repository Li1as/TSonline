import { simpleCardDemoDefinition } from "./definitions/simple-card-demo.definition.js";
import {
  applyGameActionWithEngine,
} from "./game-engine.js";
import {
  createEmptyStateFromDefinition,
  startGameFromDefinition,
} from "./game-setup.js";
import {
  getRoundPlaysFromZone,
  getVisibleZones,
} from "./game-engine-utils.js";

export function createEmptySimpleCardState(players = []) {
  return createEmptyStateFromDefinition(simpleCardDemoDefinition, players);
}

export function startSimpleCardGame(players) {
  return startGameFromDefinition(simpleCardDemoDefinition, players);
}

export function playSimpleCard(state, playerId, cardId) {
  return applyGameActionWithEngine(
    simpleCardDemoDefinition,
    state,
    {
      type: "card:play",
      actorId: playerId,
      payload: { cardId },
    },
  );
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

export function toPublicSimpleCardState(state, viewerId) {
  const currentRoundPlays = getRoundPlays(state);
  const scoresByPlayerId = state.vars.scoresByPlayerId ?? {};

  return {
    gameType: "simpleCardDemo",
    status: state.status,
    phase: state.phase,
    winnerId: state.vars.winnerId,
    roundId: state.roundId,
    zones: getVisibleZones(simpleCardDemoDefinition, state, viewerId),
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
