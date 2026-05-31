import { simpleCardDemoDefinition } from "./definitions/simple-card-demo.definition.js";
import {
  createEmptySimpleCardState,
  playSimpleCard,
  startSimpleCardGame,
  toPublicSimpleCardState,
} from "./simple-card-demo.js";

const definitions = {
  simpleCardDemo: simpleCardDemoDefinition,
};

export function getGameDefinition(gameType) {
  return definitions[gameType];
}

export function createEmptyGameState(gameType, players = []) {
  if (gameType === "simpleCardDemo") {
    return createEmptySimpleCardState(players);
  }
  throw new Error(`Unsupported game type: ${gameType}`);
}

export function startGame(gameType, players) {
  if (gameType === "simpleCardDemo") {
    return startSimpleCardGame(players);
  }
  throw new Error(`Unsupported game type: ${gameType}`);
}

export function applyGameAction(gameType, state, playerId, action) {
  if (gameType === "simpleCardDemo" && action.type === "card:play") {
    return playSimpleCard(state, playerId, action.cardId);
  }
  throw new Error(`Unsupported game action: ${action.type}`);
}

export function toPublicGameState(gameType, state, viewerId) {
  if (gameType === "simpleCardDemo") {
    return toPublicSimpleCardState(state, viewerId);
  }
  throw new Error(`Unsupported game type: ${gameType}`);
}
