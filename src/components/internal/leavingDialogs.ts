/**
 * The native `<dialog>` modals that are animating out. A native modal dialog stays `showModal()`-open for its exit, and while
 * it is open it covers and inerts everything else, so a modal layer that opens meanwhile (the same click may close one dialog
 * and open another) could not take focus. Such a layer flushes the registry first: every leaving dialog skips the rest of
 * its exit, closes synchronously and releases without moving focus, and the layer that opens gives focus back to what the
 * dialog would have (its opener) when it closes in turn. Same rule as the motion docs: a second action mid-animation goes
 * straight to the new state.
 *
 * Effects of sibling components run in tree order, so a layer can record its own return target (a button inside the dialog
 * that is about to go) before that dialog has registered. The registry therefore remembers, per dialog element, the opener of
 * a dialog it flushed, and `resolveReturnFocus` maps a target that lived inside such a dialog to that opener. A record is
 * valid only while that dialog is closed: it is dropped when the dialog opens again (`forgetFlushedDialog`), and a record for
 * a dialog that opened again is never consulted.
 */
type Finish = () => HTMLElement | null;

const leaving = new Map<Finish, HTMLDialogElement>();
const flushed = new WeakMap<HTMLDialogElement, { opener: HTMLElement | null }>();
const MAX_HOPS = 8;

/** Registers a leaving dialog's "finish now": it closes the dialog and returns the element focus would have gone back to. */
export function registerLeavingDialog(dialog: HTMLDialogElement, finish: Finish): () => void {
  leaving.set(finish, dialog);
  return () => void leaving.delete(finish);
}

/** Drops what was remembered about `dialog`: call it when the dialog opens again. */
export function forgetFlushedDialog(dialog: HTMLDialogElement) {
  flushed.delete(dialog);
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
    flushed.set(dialog, { opener: target });
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

/** The record of the closest closed, flushed dialog around `element` (it works for a subtree that was already removed). */
function flushedAround(element: HTMLElement) {
  for (
    let dialog = element.closest("dialog");
    dialog;
    dialog = dialog.parentElement?.closest("dialog") ?? null
  ) {
    const record = flushed.get(dialog);
    if (record && !dialog.hasAttribute("open")) return record;
  }
  return undefined;
}

/**
 * Where a layer should give focus back to. A target that lived inside a flushed dialog that is still closed maps to that
 * dialog's opener first (a keep-mounted dialog stays in the document, inert, after it closes). Otherwise `target` itself when
 * it can take focus: one inside an inert subtree or a closed dialog cannot, and gives way to `null`.
 */
export function resolveReturnFocus(target: HTMLElement | null): HTMLElement | null {
  let current = target;
  for (let hops = 0; current && hops <= MAX_HOPS; hops += 1) {
    const record = flushedAround(current);
    if (!record) return isFocusable(current) ? current : null;
    current = record.opener;
  }
  return null;
}
