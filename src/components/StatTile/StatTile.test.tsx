import { readFileSync } from "node:fs";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { AnimatedNumber } from "../../motion";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Sparkline } from "../Sparkline";
import { StatTile } from "./StatTile";

const css = readFileSync("src/components/StatTile/StatTile.module.css", "utf8");

describe("StatTile", () => {
  it("renders the label, the figure and the hint", () => {
    render(<StatTile label="Open items" value="12" hint="3 due today" />);
    expect(screen.getByText("Open items")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3 due today")).toBeInTheDocument();
  });

  it("is neither a link nor a button by default", () => {
    const { container } = render(<StatTile label="Open items" value="12" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("data-interactive");
  });

  it("works with AnimatedNumber as the value", () => {
    render(<StatTile label="Open items" value={<AnimatedNumber value={42} />} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("says the direction of the change in words, and hides the arrow", () => {
    const { container } = render(
      <StatTile
        label="Open items"
        value="12"
        delta="3 since yesterday"
        trend="up"
        trendLabel="Up"
        deltaTone="danger"
      />,
    );
    const delta = screen.getByText(/3 since yesterday/);
    expect(delta).toHaveTextContent("Up 3 since yesterday");
    expect(delta).toHaveAttribute("data-tone", "danger");
    expect(delta).toHaveAttribute("data-trend", "up");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes the tone and renders the sparkline slot", () => {
    const { container } = render(
      <StatTile
        label="Late"
        value="4"
        tone="danger"
        sparkline={<Sparkline values={[1, 2, 3]} label={null} />}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("data-tone", "danger");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("href: one link, named by the label, described by the figure and the lines under it", () => {
    render(<StatTile label="Open items" value="12" delta="+3" hint="3 due today" href="/items" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]!).toHaveAccessibleName("Open items");
    expect(links[0]!).toHaveAttribute("href", "/items");
    expect(links[0]!).toHaveAccessibleDescription("12 +3 3 due today");
  });

  it("href: navigates through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <StatTile label="Open items" value="12" href="/items" />
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-custom");
  });

  it("onClick alone: one button, named by the label, that calls back", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StatTile label="Open items" value="12" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Open items" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  describe("pressed", () => {
    it("a button tile exposes aria-pressed, true and false", () => {
      const { container, rerender } = render(<StatTile label="Open" value="1" onClick={() => {}} pressed />);
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "true");
      expect(container.firstElementChild).toHaveAttribute("data-pressed");
      rerender(<StatTile label="Open" value="1" onClick={() => {}} pressed={false} />);
      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("aria-pressed", "false");
      expect(container.firstElementChild).not.toHaveAttribute("data-pressed");
    });

    it("has no aria-pressed when pressed is not given", () => {
      render(<StatTile label="Open" value="1" onClick={() => {}} />);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
    });

    it("is ignored by link, plain and loading tiles", () => {
      const { container } = render(
        <div>
          <StatTile label="Link" value="1" href="/a" pressed />
          <StatTile label="Plain" value="2" pressed />
          <StatTile label="Busy" value="3" onClick={() => {}} pressed loading />
        </div>,
      );
      expect(container.querySelector("[aria-pressed]")).toBeNull();
      expect(container.querySelector("[data-pressed]")).toBeNull();
      expect(container.querySelector("svg[class*=check]")).toBeNull();
    });

    it("toggles when the consumer flips it on click", async () => {
      const user = userEvent.setup();
      function Filters() {
        const [active, setActive] = useState("a");
        return (
          <div>
            {["a", "b"].map((key) => (
              <StatTile
                key={key}
                label={`Tile ${key}`}
                value="1"
                pressed={active === key}
                onClick={() => setActive(key)}
              />
            ))}
          </div>
        );
      }
      render(<Filters />);
      const a = screen.getByRole("button", { name: "Tile a" });
      const b = screen.getByRole("button", { name: "Tile b" });
      expect(a).toHaveAttribute("aria-pressed", "true");
      expect(b).toHaveAttribute("aria-pressed", "false");
      await user.click(b);
      expect(a).toHaveAttribute("aria-pressed", "false");
      expect(b).toHaveAttribute("aria-pressed", "true");
    });

    it("has no axe violations, pressed and unpressed", async () => {
      const { container } = render(
        <div>
          <StatTile label="One" value="1" onClick={() => {}} pressed />
          <StatTile label="Two" value="2" onClick={() => {}} pressed={false} tone="warning" />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("uses tokens, a non-colour cue, motion tokens and no transition under reduced motion", () => {
      const rule = css.match(/\.root\[data-pressed\] \{([^}]*)\}/)![1]!;
      expect(rule).toMatch(/accent-default/);
      expect(rule).toMatch(/accent-subtle/);
      expect(rule).toMatch(/box-shadow:\s*inset/);
      expect(css).toMatch(/\.check \{[^}]*var\(--lufia-motion-duration-instant\)/);
      const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
      expect(reduced?.[1]).toMatch(/\.check[\s\S]*transition:\s*none/);
    });
  });

  it("href together with onClick runs the callback on the link", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(<StatTile label="Open items" value="12" href="/items" onClick={onClick} />);
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("loading: skeletons instead of the figure, busy, and no link or button", () => {
    const { container } = render(
      <StatTile
        label="Open items"
        value="12"
        hint="3 due"
        href="/items"
        loading
        loadingLabel="Loading open items"
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading open items");
    expect(screen.queryByText("12")).not.toBeInTheDocument();
    expect(screen.queryByText("3 due")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Open items")).toBeInTheDocument();
  });

  it("loading: holds one skeleton per line the loaded tile has, each one line box tall", () => {
    const { container, rerender } = render(<StatTile label="Open items" value="12" loading />);
    const skeletons = () => [...container.querySelectorAll<HTMLElement>("[data-variant]")];
    expect(skeletons()).toHaveLength(1);
    expect(skeletons()[0]!.className).toMatch(/skeletonValue/);
    rerender(<StatTile label="Open items" value="12" delta="+3" loading />);
    expect(skeletons()).toHaveLength(2);
    rerender(<StatTile label="Open items" value="12" delta="+3" hint="3 due" loading />);
    expect(skeletons()).toHaveLength(3);
    expect(
      skeletons()
        .slice(1)
        .map((el) => /skeletonLine/.test(el.className)),
    ).toEqual([true, true]);
    rerender(<StatTile label="Open items" value="12" hint="3 due" sparkline={<span />} loading />);
    expect(skeletons().map((el) => el.dataset.variant)).toEqual(["text", "rect", "text"]);
  });

  it("loading: the loaded and loading tiles have the same lines in the same order", () => {
    const props = { label: "Open items", value: "12", delta: "+3", hint: "3 due" } as const;
    const { container, rerender } = render(<StatTile {...props} sparkline={<span data-spark />} />);
    const loaded = () => container.querySelector("[class*=body]")!.children.length;
    const loadedLines = loaded();
    const valueRow = () => container.querySelector("[class*=valueRow]")!.children.length;
    const loadedRow = valueRow();
    rerender(<StatTile {...props} sparkline={<span data-spark />} loading />);
    expect(loaded()).toBe(loadedLines);
    expect(valueRow()).toBe(loadedRow);
  });

  it("loading: heights are 1lh with a rem fallback for engines without lh", () => {
    expect(css).toMatch(/\.skeletonValue \{\s*--skeleton-height: 1\.75rem;/);
    expect(css).toMatch(/\.skeletonLine \{\s*--skeleton-height: 1\.125rem;/);
    expect(css).toMatch(/@supports \(block-size: 1lh\) \{[^}]*\{\s*--skeleton-height: 1lh;/);
  });

  it("loading: skeleton lines use the typography of the lines they replace", () => {
    const rule = (selector: string) =>
      css.match(new RegExp(`${selector.replace(".", "\\.")} \\{([^}]*)\\}`))![1]!;
    const decl = (block: string, prop: string) => block.match(new RegExp(`${prop}:\\s*([^;]+);`))?.[1];
    for (const line of [".delta", ".hint"]) {
      expect(decl(rule(".skeletonLine"), "font-size")).toBe(decl(rule(line), "font-size"));
      expect(decl(rule(".skeletonLine"), "line-height")).toBe(decl(rule(line), "line-height"));
    }
    expect(decl(rule(".skeletonSpark"), "aspect-ratio")).toBe("5 / 1");
  });

  it("passes className and rest props to the root", () => {
    render(<StatTile label="Open items" value="12" className="extra" data-testid="t" />);
    expect(screen.getByTestId("t")).toHaveClass("extra");
  });

  it("has no axe violations, plain, interactive, with a delta and loading", async () => {
    const { container } = render(
      <div>
        <StatTile label="One" value="1" delta="+1" trend="up" trendLabel="Up" hint="Hint" />
        <StatTile label="Two" value="2" href="/two" tone="warning" />
        <StatTile label="Three" value="3" onClick={() => {}} />
        <StatTile label="Four" value="4" loading loadingLabel="Loading four" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps its width in a flex row: the root is not a size container and fills its track", () => {
    const root = css.match(/\.root \{([^}]*)\}/)![1]!;
    expect(root).not.toMatch(/container-type/);
    expect(root).toMatch(/inline-size:\s*100%/);
    expect(css.match(/\.body \{([^}]*)\}/)![1]).toMatch(/container-type:\s*inline-size/);
  });

  it("hover and press use motion tokens and are switched off under reduced motion", () => {
    const rule = css.match(/\.root\[data-interactive\] \{([^}]*)\}/);
    expect(rule?.[1]).toMatch(/var\(--lufia-motion-duration-instant\)/);
    expect(rule?.[1]).toMatch(/var\(--lufia-motion-easing-out\)/);
    expect(css).toMatch(/\[data-interactive\]:hover \{[^}]*var\(--lufia-motion-distance-nudge\)/);
    expect(css).toMatch(/\[data-interactive\]:active \{[^}]*scale\(/);
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/:hover[\s\S]*:active[\s\S]*transform:\s*none/);
  });
});
