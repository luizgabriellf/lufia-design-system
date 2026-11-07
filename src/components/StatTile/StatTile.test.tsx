import { readFileSync } from "node:fs";
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
