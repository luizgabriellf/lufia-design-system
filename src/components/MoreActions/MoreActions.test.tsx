import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { pushLayer, removeLayer } from "../useFocusTrap/layerStack";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { MoreActions, type MoreActionItem } from "./MoreActions";

/** jsdom has no layout. Every element gets a box, except those inside a CSS-hidden (`narrowOnly`) entry on a wide page. */
const withLayout = ({ narrow = false }: { narrow?: boolean } = {}) =>
  vi.spyOn(Element.prototype, "getClientRects").mockImplementation(function (this: Element) {
    const hidden = !narrow && this.closest("[data-narrow-only]");
    return (hidden ? [] : [new DOMRect(0, 0, 10, 10)]) as unknown as DOMRectList;
  });

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const onSelect = vi.fn();
const items: MoreActionItem[] = [
  { key: "dup", label: "Duplicate", onSelect },
  { key: "exp", label: "Export", description: "As CSV", onSelect },
  { key: "arc", label: "Archive", disabled: true, onSelect },
  { key: "del", label: "Delete", tone: "danger", onSelect },
];

function setup(list: readonly MoreActionItem[] = items) {
  withLayout();
  const user = userEvent.setup();
  const { container } = render(
    <>
      <button type="button">Before</button>
      <MoreActions label="More actions" items={list} />
      <button type="button">After</button>
    </>,
  );
  return { user, container, trigger: screen.getByRole("button", { name: "More actions" }) };
}

describe("MoreActions", () => {
  beforeEach(() => onSelect.mockClear());

  it("renders a closed menu button with the menu-button ARIA", () => {
    const { trigger } = setup();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on click, names the menu, focuses the first item and links trigger to menu", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const menu = screen.getByRole("menu", { name: "More actions" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("opens with Enter, Space and ArrowDown on the first item, ArrowUp on the last", async () => {
    const { user, trigger } = setup();
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("moves with arrows (wrapping, skipping disabled), Home and End", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("typeahead jumps to the item starting with the typed letter after the pause, and ignores disabled ones", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("e");
    expect(screen.getByRole("menuitem", { name: /Export/ })).toHaveFocus();
    await act(async () => vi.advanceTimersByTime(600));
    await user.keyboard("d");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await act(async () => vi.advanceTimersByTime(600));
    await user.keyboard("a"); // Archive is disabled: focus stays
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    vi.useRealTimers();
  });

  it("typeahead builds a prefix within the pause", async () => {
    const { user, trigger } = setup([
      { key: "1", label: "Download" },
      { key: "2", label: "Duplicate" },
      { key: "3", label: "Delete" },
    ]);
    await user.click(trigger);
    await user.keyboard("de");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("Escape closes through the layer stack and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a press outside", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "After" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Tab without trapping focus", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.tab();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles closed when the trigger is pressed again", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("selecting an item closes the menu, returns focus to the trigger and calls onSelect", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("Enter on a focused item selects it", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does not select a disabled item", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const archive = screen.getByRole("menuitem", { name: "Archive" });
    expect(archive).toHaveAttribute("aria-disabled", "true");
    await user.click(archive);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("renders href items as links through the configured link component", async () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    withLayout();
    const user = userEvent.setup();
    render(
      <LufiaProvider linkComponent={Custom}>
        <MoreActions label="More" items={[{ key: "a", label: "Open", href: "/open" }]} />
      </LufiaProvider>,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    const item = screen.getByRole("menuitem", { name: "Open" });
    expect(item).toHaveAttribute("href", "/open");
    expect(item).toHaveAttribute("data-custom");
  });

  it("skips narrowOnly items on a wide page and includes them on a narrow one", async () => {
    vi.restoreAllMocks();
    const list: MoreActionItem[] = [
      { key: "n", label: "Narrow item", narrowOnly: true },
      { key: "a", label: "Always" },
    ];
    const user = userEvent.setup();
    withLayout({ narrow: false });
    const { unmount } = render(<MoreActions label="More" items={list} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Always" })).toHaveFocus();
    unmount();
    vi.restoreAllMocks();
    withLayout({ narrow: true });
    render(<MoreActions label="More" items={list} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menuitem", { name: "Narrow item" })).toHaveFocus();
  });

  it("Escape closes only the menu when a higher layer is on top of it, then the menu once it is back on top", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    const above = pushLayer();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    removeLayer(above);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("has no axe violations, closed and open", async () => {
    const { user, trigger, container } = setup();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(trigger);
    expect(await axe(container)).toHaveNoViolations();
  });
});
