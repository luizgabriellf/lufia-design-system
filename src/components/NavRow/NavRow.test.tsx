import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { LufiaProvider, type LinkComponent } from "../LufiaProvider";
import { NavRow } from "./NavRow";

describe("NavRow", () => {
  it("is a link with the title, description and meta in its name when given an href", () => {
    render(<NavRow title="Members" description="Manage roles" meta="Today" href="/members" badge={3} />);
    const link = screen.getByRole("link", { name: /Members.*3.*Manage roles.*Today/ });
    expect(link).toHaveAttribute("href", "/members");
  });

  it("renders through the configured link component", () => {
    const Custom: LinkComponent = ({ children, ...rest }) => (
      <a {...rest} data-custom="">
        {children}
      </a>
    );
    render(
      <LufiaProvider linkComponent={Custom}>
        <NavRow title="Members" href="/members" />
      </LufiaProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("data-custom");
  });

  it("is a button when given only onClick, and calls it", async () => {
    const onClick = vi.fn();
    render(<NavRow title="Open" onClick={onClick} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Open" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a plain block without href or onClick", () => {
    const { container } = render(<NavRow title="Info" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("disables a link: aria-disabled, out of the tab order, click prevented", async () => {
    const onClick = vi.fn();
    render(<NavRow title="Locked" href="/x" disabled onClick={onClick} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    await userEvent.setup().click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables a button natively", () => {
    render(<NavRow title="Locked" onClick={() => {}} disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("hides the icon and chevron from assistive technology", () => {
    const { container } = render(<NavRow title="A" href="/a" icon={<svg data-testid="i" />} />);
    expect(screen.getByTestId("i").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg[focusable='false']")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows a badge of 0", () => {
    render(<NavRow title="Inbox" href="/i" badge={0} />);
    expect(screen.getByRole("link")).toHaveTextContent("Inbox0");
  });

  it("has no axe violations in each form", async () => {
    const { container } = render(
      <ul>
        <li>
          <NavRow title="Link" href="/a" description="d" />
        </li>
        <li>
          <NavRow title="Button" onClick={() => {}} />
        </li>
        <li>
          <NavRow title="Static" />
        </li>
      </ul>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
