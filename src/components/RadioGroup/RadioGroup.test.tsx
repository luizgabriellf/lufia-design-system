import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { RadioGroup, type RadioOption } from "./RadioGroup";

const options: RadioOption[] = [
  { value: "card", label: "Card", description: "Charged today" },
  { value: "transfer", label: "Bank transfer" },
  { value: "invoice", label: "Invoice", disabled: true },
  { value: "cash", label: "Cash" },
];

describe("RadioGroup", () => {
  it("is a radiogroup named by its label with one radio per option", () => {
    render(<RadioGroup label="Payment" options={options} defaultValue="transfer" />);
    const group = screen.getByRole("radiogroup", { name: "Payment" });
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "true", "false", "false"]);
    expect(screen.getByRole("radio", { name: "Card" })).toHaveAccessibleDescription("Charged today");
  });

  it("keeps exactly one radio in the tab order: the chosen one, else the first enabled", () => {
    const { rerender } = render(<RadioGroup label="Payment" options={options} defaultValue="cash" />);
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([-1, -1, -1, 0]);
    rerender(<RadioGroup label="Payment" options={options} value="" />);
    expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("moves and chooses with the arrow keys, wrapping and skipping disabled options", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Payment" options={options} defaultValue="card" onValueChange={onValueChange} />,
    );
    screen.getByRole("radio", { name: "Card" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Cash" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("radio", { name: "Cash" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toHaveFocus();
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual([
      "transfer",
      "cash",
      "card",
      "cash",
      "transfer",
    ]);
  });

  it("chooses on click", async () => {
    const user = userEvent.setup();
    render(<RadioGroup label="Payment" options={options} />);
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(screen.getByRole("radio", { name: "Cash" })).toHaveAttribute("aria-checked", "true");
  });

  it("does not choose a disabled option", async () => {
    const user = userEvent.setup();
    render(<RadioGroup label="Payment" options={options} />);
    await user.click(screen.getByRole("radio", { name: "Invoice" }));
    expect(screen.getByRole("radio", { name: "Invoice" })).toHaveAttribute("aria-checked", "false");
  });

  it("disables every radio when the group is disabled", () => {
    render(<RadioGroup label="Payment" options={options} disabled />);
    screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled());
  });

  it("submits the chosen value under name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} name="payment" />
      </form>,
    );
    expect(container.querySelector('input[name="payment"]')).toBeNull();
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(container.querySelector('input[name="payment"]')).toHaveValue("cash");
  });

  it("states required and invalid, and describes the group", () => {
    render(<RadioGroup label="Payment" options={options} required hint="Hint" error="Choose one." />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toBeInvalid();
    expect(group).toHaveAccessibleDescription("Hint Choose one.");
    expect(screen.getByText(/\(required\)/)).toBeInTheDocument();
  });

  it("reverses Left and Right in a right-to-left layout", async () => {
    const user = userEvent.setup();
    render(<RadioGroup label="Payment" options={options} defaultValue="card" style={{ direction: "rtl" }} />);
    screen.getByRole("radio", { name: "Card" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
  });

  it("blocks submit while required and nothing is chosen, without submitting the mirror", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} name="payment" required />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(form.checkValidity()).toBe(false);
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("payment")).toEqual(["cash"]);
    expect(Array.from(new FormData(form).keys())).toEqual(["payment"]);
  });

  it("is not validated when not required or disabled", () => {
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} disabled required />
      </form>,
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
  });

  it("goes back to its default when the form is reset", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <RadioGroup
          label="Payment"
          options={options}
          name="payment"
          defaultValue="card"
          onValueChange={onValueChange}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("radio", { name: "Card" })).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector('input[name="payment"]')).toHaveValue("card");
  });

  it("shows the message and moves focus to the radio when the browser reports it missing", () => {
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} required requiredMessage="Choose a payment method" />
      </form>,
    );
    const mirror = container.querySelector("input[aria-hidden]")!;
    const event = new Event("invalid", { cancelable: true });
    act(() => void mirror.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a payment method");
    expect(screen.getByRole("radiogroup")).toBeInvalid();
    return userEvent
      .setup()
      .click(screen.getByRole("radio", { name: "Cash" }))
      .then(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
  });

  it("focuses the chosen radio, or skips a disabled first one", () => {
    const { container } = render(
      <form>
        <RadioGroup
          label="Payment"
          options={[{ value: "a", label: "A", disabled: true }, ...options.slice(0, 2)]}
          required
          value=""
        />
      </form>,
    );
    act(
      () =>
        void container
          .querySelector("input[aria-hidden]")!
          .dispatchEvent(new Event("invalid", { cancelable: true })),
    );
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RadioGroup label="Payment" options={options} defaultValue="card" required hint="Hint" error="Error" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
