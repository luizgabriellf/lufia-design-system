/**
 * Test helper: jsdom does not implement `<dialog>` modal behaviour. Installs a `showModal` and a `close` that toggle the
 * `open` attribute, and returns the spies. Call `restore()` in `afterEach`.
 */
export function mockDialog() {
  const proto = HTMLDialogElement.prototype;
  const original = { showModal: proto.showModal, close: proto.close };
  const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  const close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
  proto.showModal = showModal;
  proto.close = close;
  return {
    showModal,
    close,
    restore() {
      proto.showModal = original.showModal;
      proto.close = original.close;
    },
  };
}
