import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Card } from "./Card";

const css = readFileSync("src/components/Card/Card.module.css", "utf8");

describe("Card", () => {
  it("renders the title as a heading of the chosen level, the body and the footer", () => {
    render(
      <Card title="Report" headingLevel={2} footer={<span>Foot</span>}>
        Body text
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Report" })).toBeInTheDocument();
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByText("Foot")).toBeInTheDocument();
  });

  it("defaults to a level 3 heading and renders no heading without a title", () => {
    const { rerender } = render(<Card title="Report">Body</Card>);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    rerender(<Card>Body</Card>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("is not a link and not interactive by default", () => {
    const { container } = render(<Card title="Report">Body</Card>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("data-interactive");
  });

  it("interactive: exactly one link, named by the title, inside the heading", () => {
    render(
      <Card title="Report" href="/reports/1" headerAction={<span>New</span>}>
        Body
      </Card>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]!).toHaveAccessibleName("Report");
    expect(links[0]!).toHaveAttribute("href", "/reports/1");
    expect(screen.getByRole("heading", { name: "Report" })).toContainElement(links[0]!);
  });

  it("interactive: navigates through the configured link component and keeps footer controls independent", async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <Card title="Report" href="/r" footer={<button onClick={onDownload}>Download</button>}>
          Body
        </Card>
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-custom");
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it.each(["none", "sm", "md", "lg"] as const)("exposes the %s padding", (padding) => {
    const { container } = render(<Card padding={padding}>Body</Card>);
    expect(container.firstElementChild).toHaveAttribute("data-padding", padding);
  });

  it("renders a description under the title, and ignores it without a title", () => {
    const { container, rerender } = render(
      <Card title="Report" description="Totals for the period">
        Body
      </Card>,
    );
    expect(screen.getByText("Totals for the period")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Report" })).toBeInTheDocument();
    rerender(<Card description="Orphan">Body</Card>);
    expect(container).not.toHaveTextContent("Orphan");
  });

  it("keeps the original header markup when there is no description", () => {
    render(<Card title="Report">Body</Card>);
    expect(screen.getByRole("heading").parentElement?.className).toMatch(/header/);
  });

  it("keeps the interactive link inside the heading when there is a description", () => {
    render(
      <Card title="Report" description="Totals" href="/r">
        Body
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Report" })).toContainElement(screen.getByRole("link"));
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("flush: exposes the flag so the body can span the card", () => {
    const { container, rerender } = render(<Card title="List">Body</Card>);
    expect(container.firstElementChild).not.toHaveAttribute("data-flush");
    rerender(
      <Card title="List" flush>
        Body
      </Card>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-flush");
    expect(css).toMatch(/\[data-flush\] > \.body \{\s*padding: 0;/);
  });

  it("passes className and rest props to the root", () => {
    render(
      <Card className="extra" data-testid="c" aria-label="Region">
        Body
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveClass("extra");
    expect(screen.getByTestId("c")).toHaveAttribute("aria-label", "Region");
  });

  it("has no axe violations, plain and interactive", async () => {
    const { container } = render(
      <div>
        <Card title="One" footer={<button>Act</button>}>
          Body
        </Card>
        <Card title="Two" href="/two">
          Body
        </Card>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lifts nested interactive elements above the stretched link, in the body too", () => {
    // jsdom has no hit testing, so this asserts the markup and the CSS contract; the real-browser click is checked by hand.
    const { container } = render(
      <Card title="Report" href="/r">
        <button type="button">In body</button>
      </Card>,
    );
    expect(container.firstElementChild).toHaveAttribute("data-interactive");
    expect(container.firstElementChild).toContainElement(screen.getByRole("button", { name: "In body" }));
    const rule = css.match(/\[data-interactive\] :is\(([^)]*)\):not\(\.link\) \{([^}]*)\}/);
    expect(rule?.[1]).toMatch(/\ba\b.*\bbutton\b/);
    expect(rule?.[2]).toMatch(/position:\s*relative/);
    expect(rule?.[2]).toMatch(/z-index:\s*1/);
  });
});
