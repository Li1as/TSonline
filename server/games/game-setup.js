import { randomUUID } from "node:crypto";
import { shuffleCards } from "./game-engine-utils.js";

export function createEmptyStateFromDefinition(definition, players = []) {
  const phase =
    players.length >= definition.players.required ? "ready" : "not_started";

  return {
    gameType: definition.type,
    status: phase,
    phase,
    roundId: null,
    players,
    zones: createZonesFromDefinition(definition, players),
    vars: resolveSetupVars(definition.setup?.emptyVars ?? {}, players, definition),
    lastErrorsByPlayerId: {},
    version: 0,
  };
}

export function startGameFromDefinition(definition, players) {
  if (players.length !== definition.players.required) {
    throw new Error(`${definition.title} requires exactly ${definition.players.required} players.`);
  }

  const setup = definition.setup ?? {};
  const zones = createZonesFromDefinition(definition, players);
  const deck = setup.deck?.from === "cardTemplates" ? createDeck(definition) : [];
  const cardsToDeal = setup.deck?.shuffle ? shuffle(deck) : deck;
  if (setup.deck?.zone) {
    zones[setup.deck.zone] = cardsToDeal;
  }

  if (setup.deal?.strategy === "evenlyToPlayers") {
    dealEvenlyToPlayers(zones, cardsToDeal, players, setup.deal);
  }
  if (setup.deal?.strategy === "fixedCountToPlayers") {
    dealFixedCountToPlayers(zones, players, setup.deal);
  }

  return {
    gameType: definition.type,
    status: "running",
    phase: setup.initialPhase ?? "playing",
    roundId: randomUUID(),
    players,
    zones,
    vars: resolveSetupVars(setup.vars ?? {}, players, definition),
    lastErrorsByPlayerId: {},
    lastAction: {
      type: "game:new",
      at: Date.now(),
    },
    version: 1,
  };
}

function createZonesFromDefinition(definition, players) {
  const zones = {};

  for (const zone of definition.zones) {
    if (zone.owner === "player") {
      for (const player of players) {
        zones[resolvePlayerZoneId(zone.id, player.id)] = [];
      }
    } else {
      zones[zone.id] = [];
    }
  }

  return zones;
}

function createDeck(definition) {
  return (definition.cardTemplates ?? []).map((template) => {
    const instanceId = randomUUID();
    return {
      ...template,
      instanceId,
      id: instanceId,
    };
  });
}

function shuffle(cards) {
  return shuffleCards(cards);
}

function dealEvenlyToPlayers(zones, cards, players, deal) {
  if (!players.length) {
    return;
  }

  cards.forEach((card, index) => {
    const player = players[index % players.length];
    const zoneId = deal.to.replace("<playerId>", player.id);
    zones[zoneId] = [...(zones[zoneId] ?? []), card];
  });
  if (deal.from) {
    zones[deal.from] = [];
  }
}

function dealFixedCountToPlayers(zones, players, deal) {
  const sourceZone = zones[deal.from] ?? [];
  let nextIndex = 0;

  for (const player of players) {
    const zoneId = deal.to.replace("<playerId>", player.id);
    const cards = sourceZone.slice(nextIndex, nextIndex + deal.count);
    zones[zoneId] = [...(zones[zoneId] ?? []), ...cards];
    nextIndex += deal.count;
  }

  zones[deal.from] = sourceZone.slice(nextIndex);
}

function resolveSetupVars(varsConfig, players, definition) {
  return Object.fromEntries(
    Object.entries(varsConfig).map(([key, value]) => [
      key,
      resolveSetupValue(value, players, definition),
    ]),
  );
}

function resolveSetupValue(value, players, definition) {
  if (value === "$players.0.id") {
    return players[0]?.id ?? null;
  }

  if (value === "$zeroScoresByPlayerId") {
    return Object.fromEntries(players.map((player) => [player.id, 0]));
  }

  if (value === "$initialPlayerAttributes") {
    return Object.fromEntries(
      players.map((player) => [
        player.id,
        createInitialPlayerAttributes(definition),
      ]),
    );
  }

  return value;
}

function createInitialPlayerAttributes(definition) {
  const attributes = definition?.players?.attributes ?? {};
  return Object.fromEntries(
    Object.entries(attributes).map(([key, config]) => [
      key,
      config.initial ?? 0,
    ]),
  );
}

function resolvePlayerZoneId(zoneId, playerId) {
  return `${zoneId}:${playerId}`;
}
