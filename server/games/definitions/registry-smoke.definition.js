export const registrySmokeDefinition = {
  type: "registrySmoke",
  title: "Registry Smoke",
  version: 1,
  players: {
    min: 1,
    max: 2,
    required: 1,
  },
  config: {},
  setup: {
    initialPhase: "playing",
    emptyVars: {},
    vars: {},
  },
  zones: [
    {
      id: "table",
      label: "Table",
      owner: "game",
      visibility: "public",
      accepts: ["card"],
    },
  ],
  actions: [],
  triggers: [],
  cardTemplates: [],
  ui: {
    cardDisplayFields: ["name"],
    showScoreboard: false,
    showRoundInfo: false,
  },
};
