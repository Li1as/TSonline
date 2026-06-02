import { loadGameDefinitions } from "./definition-loader.js";
import { createGenericGameAdapter } from "./generic-game-adapter.js";
import { toPublicSimpleCardState } from "./simple-card-demo.js";

let registeredDefinitions = [];
let definitionsByType = {};
let gameAdapters = {};
let definitionSignaturesByType = {};

export async function initializeGameRegistry(options = {}) {
  const nextDefinitions = await loadGameDefinitions(options);
  applyRegistryDefinitions(nextDefinitions);
}

export async function reloadGameRegistry() {
  const previousSignatures = definitionSignaturesByType;
  const nextDefinitions = await loadGameDefinitions({ cacheKey: Date.now() });
  const nextSignatures = createDefinitionSignatures(nextDefinitions);
  const changedTypes = getChangedDefinitionTypes(previousSignatures, nextSignatures);

  applyRegistryDefinitions(nextDefinitions, nextSignatures);
  return { changedTypes, definitions: registeredDefinitions };
}

export function getGameDefinition(gameType) {
  ensureInitialized();
  return definitionsByType[gameType];
}

export function listGameDefinitions() {
  ensureInitialized();
  return registeredDefinitions;
}

export function listPlayableGameDefinitions() {
  ensureInitialized();
  return registeredDefinitions.filter((definition) => gameAdapters[definition.type]);
}

export function isPlayableGameType(gameType) {
  ensureInitialized();
  return Boolean(gameAdapters[gameType]);
}

export function listGameDefinitionSummaries() {
  ensureInitialized();
  return registeredDefinitions.map((definition) => ({
    type: definition.type,
    title: definition.title,
    version: definition.version,
    players: definition.players,
    turn: definition.turn,
    playable: isPlayableGameType(definition.type),
    sourceFile: definition.sourceFile,
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

function createAdapterForDefinition(definition) {
  if (definition.type === "simpleCardDemo") {
    return createGenericGameAdapter(definition, {
      toPublicState: toPublicSimpleCardState,
    });
  }

  if (definition.runtime === "generic") {
    return createGenericGameAdapter(definition);
  }

  return null;
}

function getGameAdapter(gameType) {
  ensureInitialized();
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

function ensureInitialized() {
  if (!registeredDefinitions.length) {
    throw new Error("Game registry has not been initialized.");
  }
}

function applyRegistryDefinitions(nextDefinitions, nextSignatures = null) {
  registeredDefinitions = nextDefinitions;
  definitionsByType = Object.fromEntries(
    registeredDefinitions.map((definition) => [definition.type, definition]),
  );
  gameAdapters = Object.fromEntries(
    registeredDefinitions
      .map((definition) => [definition.type, createAdapterForDefinition(definition)])
      .filter(([, adapter]) => Boolean(adapter)),
  );
  definitionSignaturesByType = nextSignatures ?? createDefinitionSignatures(registeredDefinitions);
}

function createDefinitionSignatures(definitions) {
  return Object.fromEntries(
    definitions.map((definition) => [definition.type, JSON.stringify(definition)]),
  );
}

function getChangedDefinitionTypes(previousSignatures, nextSignatures) {
  const allTypes = new Set([
    ...Object.keys(previousSignatures),
    ...Object.keys(nextSignatures),
  ]);
  return Array.from(allTypes).filter(
    (type) => previousSignatures[type] !== nextSignatures[type],
  );
}
