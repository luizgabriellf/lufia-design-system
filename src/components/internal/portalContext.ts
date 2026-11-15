const MODAL_HOST = 'dialog[open], [aria-modal="true"]';

/**
 * Whether `element` is a modal that is open right now. A native `dialog` counts when it has `open`, or is a package `Modal`
 * mid-open (`aria-modal="true"` with `data-state="open"`, the frame before `showModal()` has run). A portal `Modal` panel
 * (a `div`) counts when it carries `aria-modal="true"` and is not marked `data-state="closed"`. Neither counts inside a
 * `hidden` or `inert` subtree. Attributes are tested, not computed style: they are what `Modal` writes when it is kept mounted
 * while closed, they hold under jsdom (which has no layout), and they do not change with a CSS theme. A closed `<dialog>`
 * that only carries `aria-modal` is never a host.
 */
export function isOpenModal(element: Element): boolean {
  if (element.closest("[hidden],[inert]")) return false;
  const state = element.getAttribute("data-state");
  const modal = element.getAttribute("aria-modal") === "true";
  if (element.localName === "dialog") return element.hasAttribute("open") || (modal && state === "open");
  return modal && state !== "closed";
}

/** Every open element that declares itself modal with `aria-modal="true"`, in document order (the last is the topmost). */
export function openAriaModals(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"]')).filter(isOpenModal);
}

/**
 * Where a non-modal popup is portalled: inside the open modal it belongs to (a native `dialog` or a portal `Modal` panel,
 * whose focus trap and inert page would otherwise lock a popup on the body out), else `document.body`. A closed modal that
 * is kept mounted never hosts anything: its content is `display: none`, so a popup inside it would render at no size.
 */
export function portalHost(from: Element): HTMLElement {
  for (
    let node = from.closest<HTMLElement>(MODAL_HOST);
    node;
    node = node.parentElement?.closest<HTMLElement>(MODAL_HOST) ?? null
  )
    if (isOpenModal(node)) return node;
  return document.body;
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
