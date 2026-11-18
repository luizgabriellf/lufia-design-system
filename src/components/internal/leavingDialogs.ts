/**
 * The native `<dialog>` modals that are animating out. A native modal dialog stays `showModal()`-open for its exit, and while
 * it is open it covers and inerts everything else, so a modal layer that opens meanwhile (the same click may close one dialog
 * and open another) could not take focus. Such a layer flushes the registry first: every leaving dialog skips the rest of
 * its exit, closes synchronously and releases without moving focus, and the layer that opens gives focus back to what the
 * dialog would have (its opener) when it closes in turn. Same rule as the motion docs: a second action mid-animation goes
 * straight to the new state.
 */
type Finish = () => HTMLElement | null;

const leaving = new Set<Finish>();

/** Registers a leaving dialog's "finish now": it closes the dialog and returns the element focus would have gone back to. */
export function registerLeavingDialog(finish: Finish): () => void {
  leaving.add(finish);
  return () => void leaving.delete(finish);
}

/**
 * Finishes every leaving native dialog at once. Returns the opener the first of them would have restored focus to (when it is
 * still in the document), for the layer that is opening to restore to on its own close; `null` when nothing was leaving.
 */
export function flushLeavingDialogs(): HTMLElement | null {
  let opener: HTMLElement | null = null;
  for (const finish of [...leaving]) {
    const target = finish();
    if (!opener && target?.isConnected) opener = target;
  }
  return opener;
}
