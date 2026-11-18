import { flushLeavingDialogs, registerLeavingDialog, resolveReturnFocus } from "./leavingDialogs";

describe("leaving dialogs registry", () => {
  it("finishes every registered dialog once and returns the first connected opener", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    const first = vi.fn(() => opener);
    const second = vi.fn(() => null);
    const off = [
      registerLeavingDialog(document.createElement("dialog"), first),
      registerLeavingDialog(document.createElement("dialog"), second),
    ];
    expect(flushLeavingDialogs()).toBe(opener);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    off.forEach((unregister) => unregister());
    opener.remove();
  });

  it("forgets a dialog that unregistered, and returns null when nothing was leaving", () => {
    const finish = vi.fn(() => null);
    registerLeavingDialog(document.createElement("dialog"), finish)();
    expect(flushLeavingDialogs()).toBeNull();
    expect(finish).not.toHaveBeenCalled();
  });

  it("ignores an opener that is no longer in the document", () => {
    const gone = document.createElement("button");
    const off = registerLeavingDialog(document.createElement("dialog"), () => gone);
    expect(flushLeavingDialogs()).toBeNull();
    off();
  });
});

describe("leaving dialogs registry: ordering and nesting", () => {
  const dialog = () => {
    const element = document.createElement("dialog");
    document.body.append(element);
    return element;
  };

  it("does not flush a dialog that contains the layer that is opening", () => {
    const outer = dialog();
    const inner = document.createElement("div");
    outer.append(inner);
    const finish = vi.fn(() => null);
    const off = registerLeavingDialog(outer, finish);
    expect(flushLeavingDialogs(inner)).toBeNull();
    expect(finish).not.toHaveBeenCalled();
    expect(flushLeavingDialogs(document.body)).toBeNull();
    expect(finish).toHaveBeenCalledTimes(1);
    off();
    outer.remove();
  });

  it("maps a target that lived in a flushed, now removed dialog to that dialog's opener", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    const leavingDialog = dialog();
    const inside = document.createElement("button");
    leavingDialog.append(inside);
    const off = registerLeavingDialog(leavingDialog, () => opener);
    // A sibling layer recorded `inside` as its return target before the dialog had registered; the flush comes later.
    flushLeavingDialogs();
    off();
    expect(resolveReturnFocus(inside)).toBe(inside);
    leavingDialog.remove();
    expect(resolveReturnFocus(inside)).toBe(opener);
    opener.remove();
  });

  it("gives null for a detached target the registry never flushed", () => {
    expect(resolveReturnFocus(document.createElement("button"))).toBeNull();
    expect(resolveReturnFocus(null)).toBeNull();
  });
});
