import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { useFocusTrap } from "../useFocusTrap";
import { useDismiss } from "./useDismiss";

function Menu() {
  const [open, setOpen] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useDismiss(open, () => setOpen(false), root, toggle);
  return (
    <>
      <button type="button">Outside</button>
      <div ref={root}>
        <button type="button" ref={toggle} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          Toggle
        </button>
        {open ? <ul aria-label="Menu" /> : null}
      </div>
    </>
  );
}

const withLayout = () =>
  vi
    .spyOn(Element.prototype, "getClientRects")
    .mockReturnValue([new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList);

afterEach(() => vi.restoreAllMocks());

describe("useDismiss", () => {
  it("closes on Escape and focuses the toggle", async () => {
    const user = userEvent.setup();
    withLayout();
    render(<Menu />);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("list", { name: "Menu" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle" })).toHaveFocus();
  });

  it("closes on a press outside, but not inside", async () => {
    const user = userEvent.setup();
    withLayout();
    render(<Menu />);
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.queryByRole("list", { name: "Menu" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("list", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("counts a second element, such as a portalled popup, as inside", async () => {
    function Portalled() {
      const [open, setOpen] = useState(true);
      const root = useRef<HTMLDivElement>(null);
      const popup = useRef<HTMLUListElement>(null);
      useDismiss(open, () => setOpen(false), root, undefined, popup);
      return (
        <>
          <button type="button">Outside</button>
          <div ref={root} />
          {open ? (
            <ul ref={popup} aria-label="Menu">
              <li>Item</li>
            </ul>
          ) : null}
        </>
      );
    }
    const user = userEvent.setup();
    withLayout();
    render(<Portalled />);
    await user.click(screen.getByText("Item"));
    expect(screen.getByRole("list", { name: "Menu" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("list", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("ignores a copy that has no layout boxes", async () => {
    const user = userEvent.setup();
    render(<Menu />); // jsdom has no layout: every getClientRects() is empty
    await user.keyboard("{Escape}");
    expect(screen.getByRole("list", { name: "Menu" })).toBeInTheDocument();
  });
});

describe("useDismiss inside a focus trap", () => {
  function DialogWithMenu() {
    const [dialogOpen, setDialogOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(true);
    const dialog = useRef<HTMLDivElement>(null);
    const root = useRef<HTMLDivElement>(null);
    useFocusTrap(dialogOpen, dialog, { onEscape: () => setDialogOpen(false) });
    useDismiss(menuOpen, () => setMenuOpen(false), root);
    return dialogOpen ? (
      <div ref={dialog} role="dialog" aria-label="Dialog" tabIndex={-1}>
        <div ref={root}>
          <button type="button">Menu</button>
          {menuOpen ? <ul aria-label="Menu" /> : null}
        </div>
      </div>
    ) : null;
  }

  it("closes only the popup on the first Escape and the dialog on the second", async () => {
    const user = userEvent.setup();
    withLayout();
    render(<DialogWithMenu />);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("list", { name: "Menu" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("useDismiss with an inline close", () => {
  // The page menu stays open behind a dialog opened without a pointer press. Re-rendering the owner passes a new inline
  // `close`; that must not move the menu's layer above the dialog.
  function PageMenuThenDialog() {
    const [menuOpen, setMenuOpen] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const dialog = useRef<HTMLDivElement>(null);
    useDismiss(menuOpen, () => setMenuOpen(false), root);
    return (
      <>
        <div ref={root}>
          {menuOpen ? <ul aria-label="Menu" /> : null}
          <button type="button" onClick={() => setDialogOpen(true)}>
            Open dialog
          </button>
        </div>
        {dialogOpen ? <Dialog dialog={dialog} onClose={() => setDialogOpen(false)} /> : null}
      </>
    );
  }
  function Dialog({
    dialog,
    onClose,
  }: {
    dialog: React.RefObject<HTMLDivElement | null>;
    onClose: () => void;
  }) {
    useFocusTrap(true, dialog, { onEscape: onClose });
    return <div ref={dialog} role="dialog" aria-label="Dialog" tabIndex={-1} />;
  }

  it("keeps the dialog on top after the owner re-renders", async () => {
    const user = userEvent.setup();
    withLayout();
    render(<PageMenuThenDialog />);
    screen.getByRole("button", { name: "Open dialog" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Menu" })).toBeInTheDocument();
  });
});
