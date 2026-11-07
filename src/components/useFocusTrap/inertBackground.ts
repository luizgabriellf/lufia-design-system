/**
 * Makes everything in `document.body` except the topmost modal's own root `inert`, so the page behind a modal cannot be
 * reached by keyboard, pointer or assistive technology (WAI-ARIA APG: "Dialog (Modal)" asks for exactly this; `aria-modal`
 * alone is not honoured everywhere). A subtree marked `data-lufia-inert-exempt` (the notification region) stays live, and
 * an element that was already inert is left alone.
 *
 * Every call registers a holder. Which body children are inert is recomputed from the list of holders whenever one comes or
 * goes: all of them except the root of the most recently opened holder. So a modal opened over another is never inert
 * itself, even when its root was in the document (and inerted) before it opened; the roots of the modals below it are
 * inert; and once the last holder is released nothing this module set stays inert, whatever the order of closing.
 *
 * The state lives on `globalThis.__lufiaInertState`, like the layer stack, so duplicated copies of the package agree.
 */
type Holder = { container: HTMLElement };
type InertState = {
  /** Open holders, oldest first. */
  holders: Holder[];
  /** Elements this module set `inert` on (and so may remove it from). */
  ours: Set<Element>;
  /** Elements that were already inert before this module wanted them to be: never touched. */
  foreign: WeakSet<Element>;
};
type InertHost = typeof globalThis & { __lufiaInertState?: Partial<InertState> };

function sharedState(): InertState {
  const host = globalThis as InertHost;
  const state = (host.__lufiaInertState ??= {});
  state.holders ??= [];
  state.ours ??= new Set<Element>();
  state.foreign ??= new WeakSet<Element>();
  return state as InertState;
}

const SKIPPED = "script, style, link, template, [data-lufia-inert-exempt]";

const rootOf = (container: HTMLElement) =>
  [...document.body.children].find((child) => child.contains(container));

function sync(state: InertState) {
  const { holders, ours, foreign } = state;
  let live: Element | undefined;
  for (let index = holders.length - 1; index >= 0 && !live; index -= 1)
    live = rootOf(holders[index]!.container);

  if (holders.length === 0 || !live) {
    for (const element of ours) element.removeAttribute("inert");
    ours.clear();
    return;
  }
  const present = new Set<Element>();
  for (const element of document.body.children) {
    if (element.matches(SKIPPED)) continue;
    present.add(element);
    if (element === live) {
      // The topmost modal's own root is live, even when it was inerted before this modal opened.
      if (ours.delete(element)) element.removeAttribute("inert");
    } else if (!ours.has(element)) {
      if (foreign.has(element)) continue;
      if (element.hasAttribute("inert")) foreign.add(element);
      else {
        element.setAttribute("inert", "");
        ours.add(element);
      }
    }
  }
  for (const element of ours) {
    if (present.has(element)) continue;
    // Gone from the body (or became exempt): nothing left to restore.
    ours.delete(element);
  }
}

export function inertBackground(container: HTMLElement): () => void {
  if (!rootOf(container)) return () => {};
  const state = sharedState();
  const holder: Holder = { container };
  state.holders.push(holder);
  sync(state);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const index = state.holders.indexOf(holder);
    if (index !== -1) state.holders.splice(index, 1);
    sync(state);
    // An element that was inert before and is still the same: forget it once nothing holds the page.
    if (state.holders.length === 0) state.foreign = new WeakSet<Element>();
  };
}
