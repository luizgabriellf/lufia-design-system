/**
 * The stack of open layers (focus traps and dismissable popups). Only the topmost layer reacts to Escape and to an outside
 * press, so a menu inside an open dialog closes alone, and the dialog closes on the next Escape (WAI-ARIA APG).
 * Internal: shared by `useFocusTrap` and `useDismiss`.
 */
const stack: symbol[] = [];

/** Registers a new topmost layer and returns its id. */
export function pushLayer(): symbol {
  const id = Symbol("layer");
  stack.push(id);
  return id;
}

export function removeLayer(id: symbol): void {
  const index = stack.indexOf(id);
  if (index !== -1) stack.splice(index, 1);
}

export function isTopLayer(id: symbol): boolean {
  return stack[stack.length - 1] === id;
}
