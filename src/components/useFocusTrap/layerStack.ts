/**
 * The stack of open layers (focus traps and dismissable popups). Only the topmost layer reacts to Escape and to an outside
 * press, so a menu inside an open dialog closes alone, and the dialog closes on the next Escape (WAI-ARIA APG).
 *
 * The stack lives on `globalThis.__lufiaOverlayStack`, not in module scope, so every copy of this module (a duplicated
 * bundle, a micro-frontend) and an app's own legacy trap that registers through `registerOverlayLayer` agree on which layer
 * is topmost.
 */
type OverlayStackHost = typeof globalThis & { __lufiaOverlayStack?: symbol[] };

function stack(): symbol[] {
  const host = globalThis as OverlayStackHost;
  return (host.__lufiaOverlayStack ??= []);
}

/** Registers a new topmost layer and returns its id. */
export function pushLayer(): symbol {
  const id = Symbol("layer");
  stack().push(id);
  return id;
}

export function removeLayer(id: symbol): void {
  const layers = stack();
  const index = layers.indexOf(id);
  if (index !== -1) layers.splice(index, 1);
}

export function isTopLayer(id: symbol): boolean {
  const layers = stack();
  return layers[layers.length - 1] === id;
}

/** A layer registered on the shared overlay stack. */
export type OverlayLayer = {
  /** Whether this layer is the topmost one right now. Check it before reacting to Escape, Tab or an outside press. */
  isTop: () => boolean;
  /** Removes the layer from the stack. Safe to call more than once. */
  release: () => void;
};

/**
 * Pushes a layer onto the stack shared by `useFocusTrap`, `useDismiss` and every other overlay that registers here, and
 * returns a handle. Use it to make an overlay the package does not own (an app's legacy modal or trap) take part: the package's
 * traps then leave Escape and Tab alone while it is on top, and it can ask `isTop()` before handling them itself.
 * Release it when the overlay closes.
 *
 * Registering again moves a layer to the top, so register once per open (an effect keyed on `open` only), not on every render.
 * A legacy overlay portaled into `document.body` above a package `Modal` must carry `data-lufia-inert-exempt`, otherwise the
 * Modal makes it `inert` with the rest of the page.
 */
export function registerOverlayLayer(): OverlayLayer {
  const id = pushLayer();
  return { isTop: () => isTopLayer(id), release: () => removeLayer(id) };
}

/** Whether `layer` is the topmost registered layer. Same as `layer.isTop()`. */
export function isTopOverlayLayer(layer: OverlayLayer): boolean {
  return layer.isTop();
}
