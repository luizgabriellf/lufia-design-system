/** Test helper: stubs `window.matchMedia` for `prefers-reduced-motion` and lets a test flip it. */
export function mockReducedMotion(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query.includes("prefers-reduced-motion") && matches;
    },
    media: query,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }));
  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((fn) => fn());
    },
  };
}

/**
 * Test helper: ends an animation on `element`. React in jsdom listens for the vendor-prefixed event name (jsdom has no
 * `AnimationEvent`), so `fireEvent.animationEnd` never reaches `onAnimationEnd`; real browsers use `animationend`.
 */
export function endAnimation(element: Element) {
  for (const type of ["animationend", "webkitAnimationEnd"]) {
    element.dispatchEvent(new Event(type, { bubbles: true }));
  }
}
