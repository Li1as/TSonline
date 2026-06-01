import {
  getRoundPlaysFromZone,
  moveTopCardsBetweenZones,
  getVictoryScoreToWin,
  moveAllCardsBetweenZones,
  moveCardBetweenZones,
  resolvePlayerSelector,
  resolveEffectValue,
  resolveZoneSelector,
  shuffleCards,
} from "./game-engine-utils.js";

export function applyEffects(
  definition,
  state,
  action,
  effects,
  initialContext = {},
  hooks = {},
) {
  const context = {
    now: Date.now(),
    movedCards: [],
    ...initialContext,
  };
  let nextState = state;

  for (const effect of effects) {
    const result = applyEffect(definition, nextState, action, effect, context, hooks);
    nextState = result.state;
    if (result.movedCard) {
      context.movedCards.push(result.movedCard);
    }
    if (result.movedCards) {
      context.movedCards.push(...result.movedCards);
    }
  }

  return {
    state: nextState,
    movedCard: context.movedCards[0] ?? null,
    movedCards: context.movedCards,
    playedAt: context.now,
    context,
  };
}

export function applyEffect(definition, state, action, effect, context = {}, hooks = {}) {
  if (effect.type === "moveCard") {
    return moveCardBetweenZones(state, {
      fromZoneId: resolveZoneSelector(effect.from, state, action, context),
      toZoneId: resolveZoneSelector(effect.to, state, action, context),
      cardId: resolveEffectValue(effect.cardId, action, context),
      transformCard: effect.recordPlayedMetadata
        ? (card) => ({
            ...card,
            playedByPlayerId: action.actorId,
            playedAt: context.now,
          })
        : undefined,
    });
  }

  if (effect.type === "moveAllCards") {
    const result = moveAllCardsBetweenZones(state, {
      fromZoneId: resolveZoneSelector(effect.from, state, action, context),
      toZoneId: resolveZoneSelector(effect.to, state, action, context),
    });
    if (!effect.shuffleAfter) {
      return result;
    }
    const toZoneId = resolveZoneSelector(effect.to, state, action, context);
    return {
      ...result,
      state: {
        ...result.state,
        zones: {
          ...result.state.zones,
          [toZoneId]: shuffleCards(result.state.zones[toZoneId] ?? []),
        },
      },
    };
  }

  if (effect.type === "setVar") {
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          [effect.key]: resolveEffectValue(effect.value, action, context),
        },
      },
    };
  }

  if (effect.type === "addScore") {
    const playerId = resolveEffectValue(effect.playerId, action, context);
    const amount = resolveEffectValue(effect.amount, action, context);
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          scoresByPlayerId: {
            ...state.vars.scoresByPlayerId,
            [playerId]: (state.vars.scoresByPlayerId[playerId] ?? 0) + amount,
          },
        },
      },
    };
  }

  if (effect.type === "setCurrentPlayer") {
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          currentPlayerId: resolveEffectValue(effect.playerId, action, context),
        },
      },
    };
  }

  if (effect.type === "setPhase") {
    const phase = resolveEffectValue(effect.phase, action, context);
    return {
      state: {
        ...state,
        phase,
        vars: {
          ...state.vars,
          phase,
        },
      },
    };
  }

  if (effect.type === "modifyPlayerAttribute") {
    const playerId = resolvePlayerSelector(effect.target, state, action, context);
    const amount = resolveEffectValue(effect.amount, action, context);
    const attributesByPlayerId = state.vars.playerAttributesByPlayerId ?? {};
    const currentAttributes = attributesByPlayerId[playerId] ?? {};
    return {
      state: {
        ...state,
        vars: {
          ...state.vars,
          playerAttributesByPlayerId: {
            ...attributesByPlayerId,
            [playerId]: {
              ...currentAttributes,
              [effect.attribute]: (currentAttributes[effect.attribute] ?? 0) + amount,
            },
          },
        },
      },
    };
  }

  if (effect.type === "drawCards") {
    return moveTopCardsBetweenZones(state, {
      fromZoneId: resolveZoneSelector(effect.from, state, action, context),
      toZoneId: resolveZoneSelector(effect.to, state, action, context),
      count: resolveEffectValue(effect.count, action, context),
    });
  }

  if (effect.type === "shuffleZone") {
    const zoneId = resolveZoneSelector(effect.zone, state, action, context);
    return {
      state: {
        ...state,
        zones: {
          ...state.zones,
          [zoneId]: shuffleCards(state.zones[zoneId] ?? []),
        },
      },
    };
  }

  if (effect.type === "resolveTrick") {
    const roundPlays = getRoundPlaysFromZone(state, effect.zone);
    const roundResult = {
      ...resolveTrick(roundPlays, effect, hooks),
      roundNumber: state.vars.roundNumber,
    };
    const nextScore =
      (state.vars.scoresByPlayerId[roundResult.winnerId] ?? 0) + 1;
    context[effect.resultKey] = roundResult;
    context.nextRoundNumber =
      nextScore >= getVictoryScoreToWin(definition)
        ? state.vars.roundNumber
        : state.vars.roundNumber + 1;

    return { state };
  }

  throw new Error(`Unsupported effect: ${effect.type}`);
}

function resolveTrick(roundPlays, effect, hooks) {
  if (hooks.resolveTrick) {
    return hooks.resolveTrick(roundPlays);
  }

  const [leadPlay, responsePlay] = roundPlays;
  if (!leadPlay || !responsePlay) {
    throw new Error("A round requires two played cards.");
  }

  const suitField = effect.suitField ?? "suit";
  const valueField = effect.valueField ?? "value";
  const responseFollows = responsePlay.card[suitField] === leadPlay.card[suitField];
  const responseWins =
    responseFollows && responsePlay.card[valueField] > leadPlay.card[valueField];
  const winnerPlay = responseWins ? responsePlay : leadPlay;
  const loserPlay = responseWins ? leadPlay : responsePlay;

  return {
    winnerId: winnerPlay.playerId,
    loserId: loserPlay.playerId,
    leadSuit: leadPlay.card[suitField],
    winningCard: winnerPlay.card,
    plays: roundPlays,
  };
}
