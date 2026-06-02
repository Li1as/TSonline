import { readdir } from "node:fs/promises";

export async function loadGameDefinitions({ cacheKey = "" } = {}) {
  const definitionsDirectory = new URL("./definitions/", import.meta.url);
  const files = await readdir(definitionsDirectory);
  const definitionFiles = files
    .filter((file) => file.endsWith(".definition.js"))
    .sort();
  const definitions = [];

  for (const file of definitionFiles) {
    const moduleUrl = new URL(file, definitionsDirectory);
    const importUrl = cacheKey ? `${moduleUrl.href}?reload=${cacheKey}` : moduleUrl.href;
    const module = await import(importUrl);
    for (const value of Object.values(module)) {
      if (isGameDefinition(value)) {
        definitions.push(value);
      }
    }
  }

  validateDefinitions(definitions);
  return definitions;
}

function isGameDefinition(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    value.players &&
    Array.isArray(value.zones) &&
    Array.isArray(value.actions)
  );
}

function validateDefinitions(definitions) {
  const seenTypes = new Set();

  for (const definition of definitions) {
    if (seenTypes.has(definition.type)) {
      throw new Error(`Duplicate game definition type: ${definition.type}`);
    }
    seenTypes.add(definition.type);

    if (!definition.players.required || !definition.players.max) {
      throw new Error(`Invalid players config for game definition: ${definition.type}`);
    }
    if (!definition.setup) {
      throw new Error(`Missing setup config for game definition: ${definition.type}`);
    }
    if (!definition.ui) {
      throw new Error(`Missing ui config for game definition: ${definition.type}`);
    }
  }
}
