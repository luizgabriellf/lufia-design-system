/**
 * Where a non-modal popup is portalled: inside the open modal it belongs to (a native `dialog` or a portal `Modal` panel,
 * whose focus trap and inert page would otherwise lock a popup on the body out), else `document.body`.
 */
const MODAL_HOST = 'dialog[open], [aria-modal="true"]';

export function portalHost(from: Element): HTMLElement {
  return from.closest<HTMLElement>(MODAL_HOST) ?? document.body;
}

/**
 * A portalled popup leaves the subtree of the element it belongs to, so what that subtree sets and the host does not is
 * copied over: a theme and mode scope (as the pair the scope declares, never a mix of an inner theme with an unrelated outer
 * mode), the writing direction and language, and the `--lufia-*` custom properties set inline on `from`.
 */
export function inheritContext(from: HTMLElement, popup: HTMLElement, host: HTMLElement) {
  // A holder that is also above the host (the document element, usually) already reaches the popup by inheritance.
  const copy = (name: string, holder: HTMLElement | null) => {
    if (holder && !holder.contains(host)) popup.setAttribute(name, holder.getAttribute(name) ?? "");
  };
  const theme = from.closest<HTMLElement>("[data-lufia-theme]");
  if (theme && !theme.contains(host)) {
    copy("data-lufia-theme", theme);
    // Theme CSS reads a mode only on the theme element itself, so copy the mode from that element alone.
    const mode = theme.getAttribute("data-lufia-mode");
    if (mode !== null) popup.setAttribute("data-lufia-mode", mode);
  } else copy("data-lufia-mode", from.closest<HTMLElement>("[data-lufia-mode]"));
  copy("dir", from.closest<HTMLElement>("[dir]"));
  copy("lang", from.closest<HTMLElement>("[lang]"));
  for (const name of Array.from(from.style)) {
    if (name.startsWith("--lufia-")) popup.style.setProperty(name, from.style.getPropertyValue(name));
  }
}
