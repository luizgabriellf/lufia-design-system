import { render } from "@testing-library/react";
import { isOpenModal, openAriaModals, portalHost } from "./portalContext";

const tree = (
  <>
    <dialog id="closed-dialog" aria-modal="true">
      <button id="in-closed-dialog" type="button" />
    </dialog>
    <div id="closed-panel" role="dialog" aria-modal="true" data-state="closed" hidden>
      <button id="in-closed-panel" type="button" />
    </div>
    <div id="inert-panel" role="dialog" aria-modal="true" inert>
      <button id="in-inert-panel" type="button" />
    </div>
    <dialog id="open-dialog" open>
      <button id="in-open-dialog" type="button" />
    </dialog>
    <div id="open-panel" role="dialog" aria-modal="true" data-state="open">
      <button id="in-open-panel" type="button" />
    </div>
    <button id="on-page" type="button" />
  </>
);

const at = (id: string) => document.getElementById(id)!;

describe("portalHost", () => {
  it("is the body for anything in a closed or hidden modal, and for the page", () => {
    render(tree);
    for (const id of ["in-closed-dialog", "in-closed-panel", "in-inert-panel", "on-page"])
      expect(portalHost(at(id))).toBe(document.body);
  });

  it("is the open modal that holds the element", () => {
    render(tree);
    expect(portalHost(at("in-open-dialog"))).toBe(at("open-dialog"));
    expect(portalHost(at("in-open-panel"))).toBe(at("open-panel"));
  });

  it("skips a closed modal to reach the open one around it", () => {
    render(
      <div id="outer" role="dialog" aria-modal="true">
        <dialog id="inner" aria-modal="true">
          <button id="deep" type="button" />
        </dialog>
      </div>,
    );
    expect(portalHost(at("deep"))).toBe(at("outer"));
  });
});

describe("openAriaModals", () => {
  it("lists only the open aria-modal ones, in document order", () => {
    render(tree);
    expect(openAriaModals().map((element) => element.id)).toEqual(["open-panel"]);
    expect(isOpenModal(at("closed-dialog"))).toBe(false);
  });
});
