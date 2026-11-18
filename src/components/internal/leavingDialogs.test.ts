import { flushLeavingDialogs, registerLeavingDialog } from "./leavingDialogs";

describe("leaving dialogs registry", () => {
  it("finishes every registered dialog once and returns the first connected opener", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    const first = vi.fn(() => opener);
    const second = vi.fn(() => null);
    const off = [registerLeavingDialog(first), registerLeavingDialog(second)];
    expect(flushLeavingDialogs()).toBe(opener);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    off.forEach((unregister) => unregister());
    opener.remove();
  });

  it("forgets a dialog that unregistered, and returns null when nothing was leaving", () => {
    const finish = vi.fn(() => null);
    registerLeavingDialog(finish)();
    expect(flushLeavingDialogs()).toBeNull();
    expect(finish).not.toHaveBeenCalled();
  });

  it("ignores an opener that is no longer in the document", () => {
    const gone = document.createElement("button");
    const off = registerLeavingDialog(() => gone);
    expect(flushLeavingDialogs()).toBeNull();
    off();
  });
});
