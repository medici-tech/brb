import type { DecisionRecord, RouteChange, RouteState, RouteStatus, GameState } from "./types";
import { pushUnique } from "./state-helpers";

function addRouteTransition(
  route: RouteState,
  decision: DecisionRecord,
  change: RouteChange,
  to: RouteStatus,
): void {
  route.transitions.push({
    from: route.status,
    to,
    effect: change.effect,
    decisionId: decision.id,
    turn: decision.turn,
    stepId: change.stepId ?? null,
    reason: change.reason ?? decision.summary,
  });
  route.status = to;
}

function touchRoute(route: RouteState, decision: DecisionRecord, change: RouteChange): void {
  if (route.status !== "unseen") return;
  addRouteTransition(route, decision, { ...change, effect: "touch" }, "touched");
  route.touchedByDecisionId = decision.id;
  route.touchedTurn = decision.turn;
}

export function getRouteCompletionKind(
  route: RouteState,
): "normal" | "reconciled" | "invalid" | null {
  if (route.status !== "completed") return null;
  const completion = [...route.transitions].reverse().find((transition) => transition.effect === "complete");
  if (!completion || !route.completedByDecisionId || route.completedTurn === null) return "invalid";
  if (completion.from === "reopened") return "reconciled";
  if (completion.from === "open") return "normal";
  return "invalid";
}

export function validateRouteIntegrity(route: RouteState): string[] {
  const errors: string[] = [];
  let status: RouteStatus = "unseen";
  for (const transition of route.transitions) {
    if (transition.from !== status) {
      errors.push(`Transition ${transition.decisionId} expected ${status} but recorded ${transition.from}.`);
    }
    const legal =
      (transition.effect === "touch" && transition.from === "unseen" && transition.to === "touched") ||
      (transition.effect === "open" && transition.from === "touched" && transition.to === "open") ||
      (transition.effect === "advance" && ["open", "reopened"].includes(transition.from) && transition.to === transition.from) ||
      (transition.effect === "close" && ["touched", "open", "reopened"].includes(transition.from) && transition.to === "closed") ||
      (transition.effect === "reopen" && transition.from === "closed" && transition.to === "reopened") ||
      (transition.effect === "complete" && ["open", "reopened"].includes(transition.from) && transition.to === "completed");
    if (!legal) errors.push(`Illegal route transition ${transition.from} -> ${transition.to} (${transition.effect}).`);
    status = transition.to;
  }
  if (route.status !== status) errors.push(`Route status ${route.status} does not match history status ${status}.`);
  if (route.status === "completed" && getRouteCompletionKind(route) === "invalid") {
    errors.push("Completed route has no legitimate open or reopen provenance.");
  }
  return errors;
}

export function applyRouteChange(
  state: GameState,
  decision: DecisionRecord,
  change: RouteChange,
): void {
  const route = state.routes[change.routeId];
  if (change.stepId) pushUnique(route.discoveredSteps, change.stepId);
  if (change.effect !== "reopen") touchRoute(route, decision, change);
  if (change.effect === "touch") return;
  if (change.effect === "open") {
    if (route.status === "open" || route.status === "reopened") return;
    if (route.status !== "touched") {
      throw new Error(`Illegal ${change.routeId} transition ${route.status} -> open; use an explicit reopen.`);
    }
    addRouteTransition(route, decision, change, "open");
    route.openedByDecisionId = decision.id;
    route.openedTurn = decision.turn;
    pushUnique(decision.routesOpened, change.routeId);
  } else if (change.effect === "advance") {
    if (route.status !== "open" && route.status !== "reopened") {
      throw new Error(`Illegal ${change.routeId} transition ${route.status} -> advance.`);
    }
    addRouteTransition(route, decision, change, route.status);
    pushUnique(decision.routesAdvanced, change.routeId);
  } else if (change.effect === "complete") {
    if (route.status === "completed") return;
    if (route.status !== "open" && route.status !== "reopened") {
      throw new Error(`Illegal ${change.routeId} transition ${route.status} -> completed.`);
    }
    addRouteTransition(route, decision, change, "completed");
    route.completedByDecisionId = decision.id;
    route.completedTurn = decision.turn;
    pushUnique(decision.routesCompleted, change.routeId);
  } else if (change.effect === "reopen") {
    if (route.status === "open" || route.status === "reopened") return;
    if (route.status !== "closed") {
      throw new Error(`Illegal ${change.routeId} transition ${route.status} -> reopened.`);
    }
    addRouteTransition(route, decision, change, "reopened");
    route.reopenedByDecisionId = decision.id;
    route.reopenedTurn = decision.turn;
    pushUnique(decision.routesReopened, change.routeId);
  } else if (route.status !== "closed") {
    if (route.status === "completed") {
      throw new Error(`Illegal ${change.routeId} transition completed -> closed.`);
    }
    addRouteTransition(route, decision, change, "closed");
    route.closedByDecisionId = decision.id;
    route.closedTurn = decision.turn;
    pushUnique(decision.routesClosed, change.routeId);
  }
}
