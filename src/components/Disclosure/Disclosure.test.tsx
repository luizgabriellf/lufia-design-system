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
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
