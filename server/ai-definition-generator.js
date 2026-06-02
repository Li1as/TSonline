export const definitionGenerationPrompt = `You generate TSonline game definition modules.

Return only JavaScript source code. Do not wrap the answer in Markdown.

The output must export exactly one GameDefinition object:

export const generatedGameDefinition = {
  type: "uniqueCamelCaseType",
  title: "Readable Game Title",
  version: 1,
  runtime: "generic",
  players: {
    min: 2,
    max: 2,
    required: 2,
    attributes: {
      hp: { initial: 3, min: 0, max: 3 }
    }
  },
  config: {},
  setup: {
    initialPhase: "playing",
    deck: { from: "cardTemplates", shuffle: true, zone: "deck" },
    deal: { strategy: "fixedCountToPlayers", from: "deck", to: "hand:<playerId>", count: 3 },
    emptyVars: {
      currentPlayerId: null,
      winnerId: null,
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      turnPlayCountByPlayerId: "$zeroScoresByPlayerId"
    },
    vars: {
      currentPlayerId: "$players.0.id",
      winnerId: null,
      playerAttributesByPlayerId: "$initialPlayerAttributes",
      turnPlayCountByPlayerId: "$zeroScoresByPlayerId"
    }
  },
  turn: { minPlays: 0, maxPlays: 1, allowPass: true },
  victory: [],
  zones: [],
  actions: [],
  triggers: [],
  cardTemplates: [],
  ui: { cardDisplayFields: ["name", "description", "props"], showScoreboard: false, showRoundInfo: false }
};

Supported conditions:
- currentPlayerIsActor
- followSuitIfPossible
- phaseIs
- varEquals
- playerAttributeBelow

Supported effects:
- moveCard
- moveAllCards
- setVar
- addScore
- setCurrentPlayer
- setPhase
- modifyPlayerAttribute
- drawCards
- shuffleZone
- resolveTrick

Supported triggers:
- event: TURN_STARTED, CARD_PLAYED
- when.type: always, zoneCountEquals

Supported victory conditions:
- playerAttributeAtLeast
- playerAttributeAtMost
- zoneCountAtLeast
- zoneCountAtMost
- scoreAtLeast

Victory objects must use this exact shape:
{ condition: "playerAttributeAtMost", target: "anyPlayer", attribute: "hp", value: 0, winner: "opponentOfMatchedPlayer" }
Do not use "type" inside victory objects.

Zone objects must use this exact shape:
{ id: "deck", label: "Deck", owner: "game", visibility: "hidden", accepts: ["card"] }
{ id: "discard", label: "Discard", owner: "game", visibility: "public", accepts: ["card"] }
{ id: "hand", label: "Hand", owner: "player", visibility: "owner", accepts: ["card"] }

The default card play action should use this exact shape:
{
  type: "card:play",
  label: "Play Card",
  source: "hand",
  target: "discard",
  conditions: [{ type: "currentPlayerIsActor" }],
  effects: [{ type: "moveCard", from: "hand:<actor>", to: "discard", cardId: "$payload.cardId", recordPlayedMetadata: true }]
}

Keep the game within these limits:
- exactly 2 players
- zones should normally be deck, discard, and player hand
- cards may have playConditions and effects.onPlay
- immediate card effects are allowed
- turn-start draw is allowed
- do not invent unsupported condition or effect types
- prefer runtime: "generic"
- generate concise cards and repeated cards with Array.from when useful
`;

export async function generateDefinitionFromDescription(apiUrl, description, options = {}) {
  if (!apiUrl || !description?.trim()) {
    throw new Error("API URL and description are required.");
  }

  const prompt = `${definitionGenerationPrompt}

User game description:
${description.trim()}
`;

  if (options.apiKey) {
    return requestOpenAiCompatibleCompletion(apiUrl, prompt, description.trim(), options);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `AI API request failed with ${response.status}.`);
  }

  return {
    prompt,
    responseText: text,
  };
}

async function requestOpenAiCompatibleCompletion(apiUrl, prompt, description, options) {
  const endpoint = apiUrl.includes("/chat/completions")
    ? apiUrl
    : `${apiUrl.replace(/\/$/, "")}/v1/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? "gpt-5.4-mini",
      messages: [
        { role: "system", content: definitionGenerationPrompt },
        { role: "user", content: description },
      ],
      max_tokens: options.maxTokens ?? 1600,
    }),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `AI API request failed with ${response.status}.`);
  }

  return {
    prompt,
    responseText: extractOpenAiCompatibleContent(text),
    rawResponseText: text,
  };
}

function extractOpenAiCompatibleContent(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed.choices?.[0]?.message?.content ?? text;
  } catch {
    return text;
  }
}
