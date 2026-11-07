// Vendored verbatim from the v0.7.0 release, to test that an older copy of the package and the current one coexist.
/**
 * Makes everything in `document.body` except the overlay's own root `inert`, so the page behind a modal cannot be
 * reached by keyboard, pointer or assistive technology (WAI-ARIA APG: "Dialog (Modal)" asks for exactly this; `aria-modal`
 * alone is not honoured everywhere). Reference counted per element so stacked modals compose, and an element that was
 * already inert is left alone. A subtree marked `data-lufia-inert-exempt` (the notification region) stays live.
 *
 * The counts live on `globalThis.__lufiaInertState`, like the layer stack, so duplicated copies of the package do not
 * un-inert an element while another copy's modal is still open.
 */
type InertState = { counts: Map<Element, number>; foreign: WeakSet<Element> };
type InertHost = typeof globalThis & { __lufiaInertState?: InertState };

const state: InertState = ((globalThis as InertHost).__lufiaInertState ??= {
  counts: new Map<Element, number>(),
  foreign: new WeakSet<Element>(),
});
const { counts, foreign } = state;

const SKIPPED = "script, style, link, template, [data-lufia-inert-exempt]";

export function inertBackground(container: HTMLElement): () => void {
  const root = [...document.body.children].find((child) => child.contains(container));
  if (!root) return () => {};
  const targets = [...document.body.children].filter((child) => child !== root && !child.matches(SKIPPED));

  for (const element of targets) {
    const count = counts.get(element) ?? 0;
    if (count === 0) {
      if (element.hasAttribute("inert")) foreign.add(element);
      else element.setAttribute("inert", "");
    }
    counts.set(element, count + 1);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const element of targets) {
      const count = (counts.get(element) ?? 1) - 1;
      if (count > 0) {
        counts.set(element, count);
        continue;
      }
      counts.delete(element);
      if (foreign.has(element)) foreign.delete(element);
      else element.removeAttribute("inert");
    }
  };
}
