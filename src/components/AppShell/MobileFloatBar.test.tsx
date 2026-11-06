import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { MobileFloatBar, MobileFloatBarButton, MobileFloatBarSeparator } from "./MobileFloatBar";

describe("MobileFloatBar", () => {
  it("is a named group of controls", () => {
    render(
      <MobileFloatBar label="Quick navigation">
        <MobileFloatBarButton label="Search" />
        <MobileFloatBarSeparator />
        <MobileFloatBarButton variant="icon" label="Menu" icon={<svg />} />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("group", { name: "Quick navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Search", "Menu"]);
  });

  it("calls onClick on a button and passes aria state through", async () => {
    const onClick = vi.fn();
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="icon" label="Menu" aria-expanded={false} onClick={onClick} />
      </MobileFloatBar>,
    );
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a link through the link component when it has an href", () => {
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="primary" label="New item" href="/new" />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("link", { name: "New item" })).toHaveAttribute("href", "/new");
  });

  it("keeps the name of an icon-only control", () => {
    render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton variant="icon" label="Menu" icon={<svg data-testid="i" />} />
      </MobileFloatBar>,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName("Menu");
    expect(screen.getByTestId("i").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MobileFloatBar label="Bar">
        <MobileFloatBarButton label="Search" />
        <MobileFloatBarButton variant="primary" label="New" href="/new" />
        <MobileFloatBarButton variant="icon" label="Menu" />
      </MobileFloatBar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
