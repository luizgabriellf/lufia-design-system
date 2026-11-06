/**
 * Test helper: jsdom does not implement `<dialog>` modal behaviour. Installs a `showModal` and a `close` that toggle the
 * `open` attribute, makes `:modal` match a dialog opened with `showModal()`, and returns the spies.
 * Call `restore()` in `afterEach`.
 */
export function mockDialog() {
  const proto = HTMLDialogElement.prototype;
  const original = { showModal: proto.showModal, close: proto.close };
  const modal = new WeakSet<Element>();
  const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
    modal.add(this);
  });
  const close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    modal.delete(this);
  });
  const matches = Element.prototype.matches;
  proto.showModal = showModal;
  proto.close = close;
  Object.defineProperty(proto, "matches", {
    configurable: true,
    value(this: HTMLDialogElement, selector: string) {
      return selector === ":modal"
        ? modal.has(this) && this.hasAttribute("open")
        : matches.call(this, selector);
    },
  });
  return {
    showModal,
    close,
    restore() {
      proto.showModal = original.showModal;
      proto.close = original.close;
      // Removes the own property so the inherited `Element.prototype.matches` applies again.
      Reflect.deleteProperty(proto, "matches");
    },
  };
}
