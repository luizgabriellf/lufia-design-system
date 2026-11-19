import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { Disclosure, disclosureClasses } from "./Disclosure";

const details = (container: HTMLElement) => container.querySelector("details")!;

describe("Disclosure", () => {
  it("renders a real details and summary", () => {
    const { container } = render(<Disclosure summary="More">Hidden text</Disclosure>);
    expect(details(container).tagName).toBe("DETAILS");
    expect(container.querySelector("summary")).toHaveTextContent("More");
    expect(details(container)).not.toHaveAttribute("open");
  });

  it("adds a description under the summary and a meta slot before the indicator", () => {
    const { container } = render(
      <Disclosure
        summary="Alerts"
        description="Choose what reaches you"
        meta={<span data-testid="meta">4</span>}
      >
        Body
      </Disclosure>,
    );
    const summary = container.querySelector("summary")!;
    expect(summary).toHaveTextContent("Alerts");
    expect(summary).toHaveTextContent("Choose what reaches you");
    expect(summary.querySelector("[data-testid=meta]")).not.toBeNull();
    expect(summary.lastElementChild).toBe(screen.getByTestId("meta").parentElement);
    expect(summary).toHaveAccessibleName(/Alerts.*Choose what reaches you.*4/);
  });

  it("leaves the summary markup unchanged without description and meta", () => {
    const { container } = render(<Disclosure summary="More">Body</Disclosure>);
    expect(container.querySelector("summary")!.children).toHaveLength(0);
  });

  it("keeps meta before a custom indicator", () => {
    const { container } = render(
      <Disclosure summary="More" meta="3" indicator={<i data-testid="ind" />}>
        Body
      </Disclosure>,
    );
    const summary = container.querySelector("summary")!;
    expect(summary.children).toHaveLength(2);
    expect(summary.lastElementChild).toBe(screen.getByTestId("ind").parentElement);
  });

  it("starts open with defaultOpen", () => {
    const { container } = render(
      <Disclosure summary="More" defaultOpen>
        Shown text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("open");
  });

  it("opens and closes from the summary with the mouse", async () => {
    const user = userEvent.setup();
    const { container } = render(<Disclosure summary="More">Text</Disclosure>);
    await user.click(screen.getByText("More"));
    expect(details(container)).toHaveAttribute("open");
    await user.click(screen.getByText("More"));
    expect(details(container)).not.toHaveAttribute("open");
  });

  // Enter and Space on a summary are the browser's own behaviour, which jsdom does not run: tests/browser covers them.
  it("puts the summary in the tab order", async () => {
    const user = userEvent.setup();
    const { container } = render(<Disclosure summary="More">Text</Disclosure>);
    await user.tab();
    expect(container.querySelector("summary")).toHaveFocus();
  });

  it("passes name through for an exclusive group", () => {
    const { container } = render(
      <>
        <Disclosure summary="One" name="faq">
          1
        </Disclosure>
        <Disclosure summary="Two" name="faq">
          2
        </Disclosure>
      </>,
    );
    const all = container.querySelectorAll("details");
    expect([...all].map((d) => d.getAttribute("name"))).toEqual(["faq", "faq"]);
  });

  it("follows open when it is controlled", () => {
    const { container, rerender } = render(
      <Disclosure summary="More" open={false}>
        Text
      </Disclosure>,
    );
    expect(details(container)).not.toHaveAttribute("open");
    rerender(
      <Disclosure summary="More" open>
        Text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("open");
  });

  it("sets the variant and merges classes onto the root and the panel", () => {
    const { container } = render(
      <Disclosure summary="More" variant="plain" className="extra" panelClassName="inner">
        Text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("data-variant", "plain");
    expect(details(container)).toHaveClass("extra");
    expect(container.querySelector(".inner")).toHaveTextContent("Text");
  });

  it("changes nothing by default: no custom indicator, the default size", () => {
    const { container } = render(<Disclosure summary="More">Text</Disclosure>);
    expect(details(container)).toHaveAttribute("data-size", "default");
    expect(details(container)).not.toHaveAttribute("data-indicator");
    expect(container.querySelector("summary")!.children).toHaveLength(0);
  });

  it("sets the compact size", () => {
    const { container } = render(
      <Disclosure summary="More" size="compact">
        Text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("data-size", "compact");
  });

  it("merges summaryClassName onto the summary only", () => {
    const { container } = render(
      <Disclosure summary="More" summaryClassName="row" className="extra">
        Text
      </Disclosure>,
    );
    expect(container.querySelector("summary")).toHaveClass("row");
    expect(container.querySelector("summary")).toHaveClass(disclosureClasses.summary);
    expect(details(container)).not.toHaveClass("row");
  });

  it("replaces the chevron with a decorative custom indicator", () => {
    const { container } = render(
      <Disclosure summary="More" indicator={<span data-testid="plus">+</span>}>
        Text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("data-indicator", "custom");
    const wrapper = screen.getByTestId("plus").parentElement!;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("summary")).toContainElement(wrapper);
  });

  it("removes the chevron with indicator null and adds no element", () => {
    const { container } = render(
      <Disclosure summary="More" indicator={null}>
        Text
      </Disclosure>,
    );
    expect(details(container)).toHaveAttribute("data-indicator", "none");
    expect(container.querySelector("summary")!.children).toHaveLength(0);
  });

  it("exports the class names for an existing native details", () => {
    const { container } = render(<Disclosure summary="More">Text</Disclosure>);
    expect(details(container)).toHaveClass(disclosureClasses.root);
    expect(container.querySelector("summary")).toHaveClass(disclosureClasses.summary);
    expect(Object.isFrozen(disclosureClasses)).toBe(true);
  });

  it("has no axe violations closed or open", async () => {
    const { container } = render(
      <div>
        <Disclosure summary="Closed">Text</Disclosure>
        <Disclosure summary="Open" defaultOpen variant="plain">
          <p>Text</p>
        </Disclosure>
        <Disclosure summary="Compact" size="compact" indicator={<span>+</span>} summaryClassName="row">
          Text
        </Disclosure>
        <Disclosure summary="No indicator" indicator={null}>
          Text
        </Disclosure>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
