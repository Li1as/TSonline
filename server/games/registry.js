import { attributeDuelDefinition } from "./definitions/attribute-duel.definition.js";
import { noRulesMinimalDefinition } from "./definitions/no-rules-minimal.definition.js";
import { simpleCardDemoDefinition } from "./definitions/simple-card-demo.definition.js";
import { createGenericGameAdapter } from "./generic-game-adapter.js";
import { toPublicSimpleCardState } from "./simple-card-demo.js";

const registeredDefinitions = [
  simpleCardDemoDefinition,
  attributeDuelDefinition,
  noRulesMinimalDefinition,
];

const definitionsByType = Object.fromEntries(
  registeredDefinitions.map((definition) => [definition.type, definition]),
);

const gameAdapters = {
  simpleCardDemo: createGenericGameAdapter(simpleCardDemoDefinition, {
    toPublicState: toPublicSimpleCardState,
  }),
  attributeDuel: createGenericGameAdapter(attributeDuelDefinition),
};

export function getGameDefinition(gameType) {
  return definitionsByType[gameType];
}

export function listGameDefinitions() {
  return registeredDefinitions;
}

export function listPlayableGameDefinitions() {
  return registeredDefinitions.filter((definition) => gameAdapters[definition.type]);
}

export function isPlayableGameType(gameType) {
  return Boolean(gameAdapters[gameType]);
}

export function listGameDefinitionSummaries() {
  return registeredDefinitions.map((definition) => ({
    type: definition.type,
    title: definition.title,
    version: definition.version,
    players: definition.players,
    turn: definition.turn,
    playable: isPlayableGameType(definition.type),
  }));
}

export function createEmptyGameState(gameType, players = []) {
  return getGameAdapter(gameType).createEmptyState(players);
}

export function startGame(gameType, players) {
  return getGameAdapter(gameType).start(players);
}

export function applyGameAction(gameType, state, playerId, action) {
  return getGameAdapter(gameType).applyAction(state, playerId, action);
}

export function toPublicGameState(gameType, state, viewerId) {
  return getGameAdapter(gameType).toPublicState(state, viewerId);
}

function getGameAdapter(gameType) {
  const adapter = gameAdapters[gameType];
  if (!adapter) {
    const definition = getGameDefinition(gameType);
    if (definition) {
      throw new Error(`Game type is defined but has no runtime adapter: ${gameType}`);
    }
    throw new Error(`Unsupported game type: ${gameType}`);
  }

  return adapter;
}
