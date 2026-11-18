/**
 * The native `<dialog>` modals that are animating out. A native modal dialog stays `showModal()`-open for its exit, and while
 * it is open it covers and inerts everything else, so a modal layer that opens meanwhile (the same click may close one dialog
 * and open another) could not take focus. Such a layer flushes the registry first: every leaving dialog skips the rest of
 * its exit, closes synchronously and releases without moving focus, and the layer that opens gives focus back to what the
 * dialog would have (its opener) when it closes in turn. Same rule as the motion docs: a second action mid-animation goes
 * straight to the new state.
 *
 * Effects of sibling components run in tree order, so a layer can record its own return target (a button inside the dialog
 * that is about to go) before that dialog has registered. The registry therefore remembers what it flushed, and
 * `resolveReturnFocus` maps a target that lived inside a flushed dialog to that dialog's opener, whenever it is asked.
 */
type Finish = () => HTMLElement | null;

const leaving = new Map<Finish, HTMLDialogElement>();
const flushed: { dialog: HTMLDialogElement; opener: HTMLElement | null }[] = [];
const REMEMBERED = 8;

/** Registers a leaving dialog's "finish now": it closes the dialog and returns the element focus would have gone back to. */
export function registerLeavingDialog(dialog: HTMLDialogElement, finish: Finish): () => void {
  leaving.set(finish, dialog);
  return () => void leaving.delete(finish);
}

/**
 * Finishes every leaving native dialog at once, except those that contain `layer` (a layer opening inside a dialog must not
 * end it). Returns the opener the first of them would have restored focus to (when it is still in the document), for the
 * layer that is opening to restore to on its own close; `null` when nothing was leaving.
 */
export function flushLeavingDialogs(layer?: Element | null): HTMLElement | null {
  let opener: HTMLElement | null = null;
  for (const [finish, dialog] of [...leaving]) {
    if (layer && dialog.contains(layer)) continue;
    const target = finish();
    flushed.push({ dialog, opener: target });
    if (flushed.length > REMEMBERED) flushed.shift();
    if (!opener && target?.isConnected) opener = target;
  }
  return opener;
}

/** Whether `element` could take focus now: in the document, and not inside an inert subtree or a dialog that is not open. */
function isFocusable(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest("[inert]")) return false;
  const dialog = element.closest("dialog");
  return !dialog || dialog.hasAttribute("open");
}

/**
 * Where a layer should give focus back to. A target that lived inside a flushed dialog maps to that dialog's opener first (a
 * keep-mounted dialog stays in the document, inert, after it closes). Otherwise `target` itself when it can take focus: one
 * inside an inert subtree or a closed dialog cannot, and gives way to `null`.
 */
export function resolveReturnFocus(target: HTMLElement | null): HTMLElement | null {
  let current = target;
  for (let hops = 0; current && hops <= REMEMBERED; hops += 1) {
    const record = flushed.find(({ dialog }) => dialog.contains(current));
    if (!record) return isFocusable(current) ? current : null;
    current = record.opener;
  }
  return null;
}
