import { applyEffects } from "./game-engine-effects.js";

export function runTriggers(definition, eventName, context, hooks = {}) {
  const triggers = definition.triggers ?? [];
  let nextState = context.state;
  let didRun = false;
  const triggerContext = {
    ...context,
  };

  for (const trigger of triggers) {
    if (trigger.event !== eventName) {
      continue;
    }
    if (!evaluateTriggerWhen(nextState, trigger.when)) {
      continue;
    }

    didRun = true;
    const result = applyEffects(
      definition,
      nextState,
      context.action,
      trigger.effects,
      triggerContext,
      hooks,
    );
    nextState = result.state;
    Object.assign(triggerContext, result.context);
  }

  return {
    state: nextState,
    context: triggerContext,
    didRun,
  };
}

function evaluateTriggerWhen(state, when) {
  if (!when || when.type === "always") {
    return true;
  }
  if (when.type === "zoneCountEquals") {
    return (state.zones[when.zone] ?? []).length === when.count;
  }
  if (when.type === "zoneCountAtLeast") {
    return (state.zones[when.zone] ?? []).length >= when.count;
  }
  if (when.type === "zoneCountAtMost") {
    return (state.zones[when.zone] ?? []).length <= when.count;
  }

  return false;
}
