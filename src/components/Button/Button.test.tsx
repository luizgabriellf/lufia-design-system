import { readFileSync } from "node:fs";
import { createRef, type ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { Button } from "./Button";

/** Stands in for a router link that takes more than `href`: here a locale it turns into a path prefix. */
function RouteLink({ locale, href, children, ...rest }: ComponentProps<"a"> & { locale?: string }) {
  return (
    <a {...rest} href={locale ? `/${locale}${href}` : href} hrefLang={locale}>
      {children}
    </a>
  );
}

describe("Button", () => {
  it("renders a button of type button by default, with variant and size as data attributes", () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("defaults to the secondary variant and the md size", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
  });

  it("calls onClick, and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("while loading: aria-busy, ignores activation, stays focusable and keeps its name", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();
    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it("has no aria-busy when idle", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });

  it("hides decorative icons from assistive technology and keeps the label as the name", () => {
    render(
      <Button iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
        Next
      </Button>,
    );
    expect(screen.getByTestId("start").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("end").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("marks full width", () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-full-width");
  });

  it("forwards ref, className and rest props", () => {
    const ref = vi.fn();
    render(
      <Button ref={ref} className="extra" data-testid="b" aria-haspopup="menu">
        X
      </Button>,
    );
    expect(ref).toHaveBeenCalledWith(screen.getByTestId("b"));
    expect(screen.getByTestId("b")).toHaveClass("extra");
    expect(screen.getByTestId("b")).toHaveAttribute("aria-haspopup", "menu");
  });

  describe("as a link", () => {
    it("renders an anchor through the configured link component", () => {
      const Custom: LinkComponent = ({ children, ...rest }) => (
        <a {...rest} data-custom="">
          {children}
        </a>
      );
      render(
        <LufiaProvider linkComponent={Custom}>
          <Button href="/reports" variant="primary">
            Reports
          </Button>
        </LufiaProvider>,
      );
      const link = screen.getByRole("link", { name: "Reports" });
      expect(link).toHaveAttribute("href", "/reports");
      expect(link).toHaveAttribute("data-custom");
      expect(link).toHaveAttribute("data-variant", "primary");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("forwards ref to the anchor", () => {
      const ref = vi.fn();
      render(
        <Button href="/a" ref={ref}>
          Go
        </Button>,
      );
      expect(ref).toHaveBeenCalledWith(screen.getByRole("link"));
    });

    it("ignores activation when disabled or loading, and says so with aria-disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { rerender } = render(
        <Button href="/a" disabled onClick={onClick}>
          Go
        </Button>,
      );
      expect(screen.getByRole("link")).toHaveAttribute("aria-disabled", "true");
      await user.click(screen.getByRole("link"));
      rerender(
        <Button href="/a" loading onClick={onClick}>
          Go
        </Button>,
      );
      await user.click(screen.getByRole("link"));
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole("link")).toHaveAttribute("aria-busy", "true");
    });

    it("calls onClick when active", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((event) => event.preventDefault());
      render(
        <Button href="/a" onClick={onClick}>
          Go
        </Button>,
      );
      await user.click(screen.getByRole("link"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("with render", () => {
    it("renders the given element with the button's class, state and content, keeping its own props", () => {
      const ref = createRef<HTMLAnchorElement>();
      render(
        <Button
          variant="primary"
          size="sm"
          iconStart={<svg data-testid="icon" />}
          title="All reports"
          render={<RouteLink ref={ref} href="/reports" locale="en" className="own" />}
        >
          Reports
        </Button>,
      );
      const link = screen.getByRole("link", { name: "Reports" });
      expect(link).toHaveAttribute("href", "/en/reports");
      expect(link).toHaveAttribute("hreflang", "en");
      expect(link).toHaveAttribute("title", "All reports");
      expect(link).toHaveAttribute("data-variant", "primary");
      expect(link).toHaveAttribute("data-size", "sm");
      expect(link).toHaveClass("own");
      expect(link.className).toContain("root");
      expect(link).toContainElement(screen.getByTestId("icon"));
      expect(ref.current).toBe(link);
    });

    it("calls the element's onClick and the button's when active", async () => {
      const own = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} render={<RouteLink href="/a" onClick={own} />}>
          Go
        </Button>,
      );
      await userEvent.click(screen.getByRole("link", { name: "Go" }));
      expect(own).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ignores activation when disabled or loading, and says so with aria-disabled", async () => {
      const own = vi.fn();
      const onClick = vi.fn();
      const { rerender } = render(
        <Button disabled onClick={onClick} render={<RouteLink href="/a" onClick={own} />}>
          Go
        </Button>,
      );
      const link = screen.getByRole("link", { name: "Go" });
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(fireEvent.click(link)).toBe(false);
      rerender(
        <Button loading onClick={onClick} render={<RouteLink href="/a" onClick={own} />}>
          Go
        </Button>,
      );
      expect(link).toHaveAttribute("aria-busy", "true");
      expect(fireEvent.click(link)).toBe(false);
      expect(own).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("throws a clear error for a lazy reference, which is what a Server Component's element can arrive as", () => {
      const lazy = { $$typeof: Symbol.for("react.lazy") } as unknown as ComponentProps<
        typeof Button
      >["render"];
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<Button render={lazy}>Go</Button>)).toThrow(
        /`render` must be a React element created in a Client Component/,
      );
      error.mockRestore();
    });
  });

  describe("link variant", () => {
    it("is a button with no size by default, so the text inherits the font size", () => {
      render(<Button variant="link">Undo</Button>);
      const button = screen.getByRole("button", { name: "Undo" });
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-variant", "link");
      expect(button).not.toHaveAttribute("data-size");
    });

    it("takes a size when one is given, and other variants still default to md", () => {
      const { rerender } = render(
        <Button variant="link" size="sm">
          Undo
        </Button>,
      );
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
      rerender(<Button variant="ghost">Undo</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "md");
    });

    it("activates from the keyboard and not when disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { rerender } = render(
        <Button variant="link" onClick={onClick}>
          Undo
        </Button>,
      );
      await user.tab();
      expect(screen.getByRole("button")).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
      rerender(
        <Button variant="link" onClick={onClick} disabled>
          Undo
        </Button>,
      );
      await user.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("hides icons from assistive technology and reports loading", () => {
      render(
        <Button variant="link" loading iconStart={<svg data-testid="a" />} iconEnd={<svg data-testid="b" />}>
          Show more
        </Button>,
      );
      expect(screen.getByTestId("a").parentElement).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByTestId("b").parentElement).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-busy", "true");
    });

    it("renders as a link and through render, with the variant", () => {
      render(
        <div>
          <Button variant="link" href="/more">
            More
          </Button>
          <Button variant="link" render={<RouteLink href="/other" />}>
            Other
          </Button>
        </div>,
      );
      expect(screen.getByRole("link", { name: "More" })).toHaveAttribute("data-variant", "link");
      expect(screen.getByRole("link", { name: "Other" })).toHaveAttribute("data-variant", "link");
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <p>
          Archived, or{" "}
          <Button variant="link" iconEnd={<svg />}>
            undo that
          </Button>
          .
        </p>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  it("has no axe violations in every state", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">A</Button>
        <Button variant="danger" loading>
          B
        </Button>
        <Button variant="ghost" disabled>
          C
        </Button>
        <Button href="/x">D</Button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Button surface hooks (stylesheet)", () => {
  const css = readFileSync("src/components/Button/Button.module.css", "utf8");
  const rule = (selector: string) =>
    css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`))?.[1] ?? "";

  it("never uses the fill hook as a border colour, so a gradient fill cannot turn the border into currentcolor", () => {
    expect(css).not.toMatch(/border-color:\s*var\(--lufia-button-\w+-bg/);
    expect(rule('.root[data-variant="primary"]')).toContain(
      "border-color: var(--lufia-button-primary-border, transparent)",
    );
    expect(rule('.root[data-variant="danger"]')).toContain(
      "border-color: var(--lufia-button-danger-border, transparent)",
    );
  });

  it("paints the fill under the border, so an unset border hook looks like a border of the fill colour", () => {
    for (const variant of ["primary", "secondary", "danger"])
      expect(rule(`.root[data-variant="${variant}"]`)).toContain("background-origin: border-box");
  });

  it("offers a shadow and a hovered shadow for every variant, defaulting to none", () => {
    for (const variant of ["primary", "secondary", "ghost", "danger"]) {
      expect(css).toContain(`box-shadow: var(--lufia-button-${variant}-shadow, none)`);
      expect(css).toContain(
        `--lufia-button-${variant}-shadow-hover, var(--lufia-button-${variant}-shadow, none)`,
      );
    }
  });

  it("lifts through translate, only with a hovering pointer and without reduced motion, and the press resets it", () => {
    const media = css.match(
      /@media \(hover: hover\) and \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/,
    );
    expect(media?.[1]).toContain(':not(:disabled, [aria-disabled="true"], [data-loading])');
    expect(media?.[1]).toContain("translate: 0 calc(var(--lufia-button-hover-lift, 0px) * -1)");
    expect(media?.[1]).toContain("::after");
    expect(css.match(/:hover:not\(:disabled, \[aria-disabled="true"\]\)/g)).toBeNull();
    expect(css.indexOf("--lufia-button-hover-lift")).toBeLessThan(css.indexOf(".root:active"));
    expect(rule('.root:active:not(:disabled, [aria-disabled="true"])')).toContain("translate: none");
  });
});

describe("Button link variant (stylesheet)", () => {
  const css = readFileSync("src/components/Button/Button.module.css", "utf8");

  it("sits on the text baseline and inherits the font size when no size is given", () => {
    expect(css).toMatch(/\.root\[data-variant="link"\]:not\(\[data-size\]\) \{\s*font-size: inherit;/);
    expect(css).toMatch(/vertical-align: baseline;/);
  });

  it("stays text-sized on coarse pointers and takes the touch through a pseudo-element", () => {
    const coarse = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(coarse).toMatch(/\.root\[data-variant="link"\]\[data-size\] \{\s*min-block-size: 0;/);
    expect(coarse).toMatch(
      /\.root\[data-variant="link"\]::before \{[^}]*block-size: max\(100%, var\(--lufia-target-touch/,
    );
  });

  it("keeps a link icon button free of a minimum height at every size, after the icon-only floors", () => {
    const linkRule = /\.root\[data-icon-only\]\[data-variant="link"\] \{\s*min-block-size: 0;/;
    const base = css.slice(0, css.indexOf("@media (pointer: coarse)"));
    const coarse = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(base).toMatch(linkRule);
    expect(coarse).toMatch(linkRule);
    expect(base.search(linkRule)).toBeGreaterThan(
      base.lastIndexOf('.root[data-icon-only][data-size="xl"] {'),
    );
    expect(coarse.search(linkRule)).toBeGreaterThan(coarse.indexOf("--lufia-icon-button-size, 0px"));
  });
});
