import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { axe } from "../../test/axe";
import { RadioGroup, type RadioOption } from "./RadioGroup";

const options: RadioOption[] = [
  { value: "card", label: "Card", description: "Charged today" },
  { value: "transfer", label: "Bank transfer" },
  { value: "invoice", label: "Invoice", disabled: true },
  { value: "cash", label: "Cash" },
];

const policyOptions: RadioOption[] = [
  { value: "off", label: "Off" },
  { value: "optional", label: "Optional" },
  { value: "required", label: "Required" },
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

  it("resets to the latest default after a form action changes it, like native radios", async () => {
    const user = userEvent.setup();
    function Settings() {
      const [policy, setPolicy] = useState("off");
      return (
        <form
          action={() => {
            setPolicy("required");
          }}
        >
          <RadioGroup label="Policy" options={policyOptions} defaultValue={policy} />
          <button type="submit">Save</button>
        </form>
      );
    }
    render(<Settings />);
    await user.click(screen.getByRole("radio", { name: "Optional" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("radio", { name: "Required" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Off" })).toHaveAttribute("aria-checked", "false");
  });

  it("dispatches bubbling input and change events to the form for a click and for an arrow key", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    const { container } = render(
      <form
        ref={(form) => {
          for (const type of ["input", "change"]) {
            form?.addEventListener(type, (event) => {
              const target = event.target as HTMLInputElement;
              seen.push(`${event.type}:${target.name}=${target.value}:${event.bubbles}`);
            });
          }
        }}
      >
        <RadioGroup label="Payment" options={options} name="payment" defaultValue="card" />
      </form>,
    );
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(seen).toEqual(["input:payment=cash:true", "change:payment=cash:true"]);
    await user.keyboard("{ArrowUp}");
    expect(seen.slice(2)).toEqual(["input:payment=transfer:true", "change:payment=transfer:true"]);
    expect(container.querySelector('input[name="payment"]')).toHaveValue("transfer");
  });

  it("dispatches from the group when it has no name, and not for what the user did not do", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const withValue = (value: string, extra?: string) => (
      <form ref={(form) => form?.addEventListener("change", onChange)}>
        <RadioGroup
          label="Payment"
          options={options}
          value={value}
          onValueChange={() => undefined}
          hint={extra}
        />
        <button type="reset">Reset</button>
      </form>
    );
    const { rerender } = render(withValue("card"));
    // The parent sets the value: no event.
    rerender(withValue("cash"));
    // Choosing the chosen option is not a change, and must not leave an event waiting for the next render.
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    rerender(withValue("cash", "A later, unrelated render"));
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onChange).not.toHaveBeenCalled();
    // The parent refuses the choice (value stays "cash"): no event, and none when it later sets "card" itself.
    await user.click(screen.getByRole("radio", { name: "Card" }));
    rerender(withValue("cash", "Another render"));
    // The parent sets something else: the refused choice is forgotten.
    rerender(withValue("transfer"));
    rerender(withValue("card"));
    expect(onChange).not.toHaveBeenCalled();
    // The user's own choice, accepted by the parent in the same update, is an event from the group (no name).
    const target = vi.fn();
    const listener = (event: Event) => target(event.target);
    function Parent() {
      const [value, setValue] = useState("card");
      return (
        <form ref={(form) => form?.addEventListener("change", listener)}>
          <RadioGroup label="Payment" options={options} value={value} onValueChange={setValue} />
        </form>
      );
    }
    render(<Parent />);
    await user.click(screen.getAllByRole("radio", { name: "Cash" })[1]!);
    expect(target).toHaveBeenCalledTimes(1);
    expect(target).toHaveBeenCalledWith(screen.getAllByRole("radiogroup")[1]!.parentElement);
  });

  it("forgets a refused choice once the parent shows another value, but not before (documented edge)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const withValue = (value: string) => (
      <form ref={(form) => form?.addEventListener("change", onChange)}>
        <RadioGroup label="Payment" options={options} value={value} onValueChange={() => undefined} />
      </form>
    );
    const { rerender } = render(withValue("cash"));
    await user.click(screen.getByRole("radio", { name: "Card" }));
    rerender(withValue("transfer"));
    rerender(withValue("card"));
    expect(onChange).not.toHaveBeenCalled();
    // The edge: refused, commits keep showing the old value, the parent later sets that same value.
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    rerender(withValue("cash"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("shows the message and moves focus to the radio when a submit is refused", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <RadioGroup label="Payment" options={options} required requiredMessage="Choose a payment method" />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
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

  it("stays silent about focus on checkValidity() while the person types in another field", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <input aria-label="Name" />
        <RadioGroup label="Payment" options={options} required />
      </form>,
    );
    await user.click(screen.getByLabelText("Name"));
    act(() => void container.querySelector("form")!.checkValidity());
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).toBeInvalid();
  });

  it("moves focus to the radio when a submit button is clicked, also inside a fieldset", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <fieldset>
          <input aria-label="Name" defaultValue="x" required />
          <RadioGroup label="Payment" options={options} required />
        </fieldset>
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
  });

  it("moves focus to the radio on Enter in a valid text field", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <input aria-label="Name" defaultValue="x" required />
        <RadioGroup label="Payment" options={options} required />
        <button type="submit">Send</button>
      </form>,
    );
    await user.type(screen.getByLabelText("Name"), "{Enter}");
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
  });

  it("does not take focus when an earlier field is the first invalid one", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <input aria-label="Name" required />
        <RadioGroup label="Payment" options={options} required />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("radio", { name: "Card" })).not.toHaveFocus();
  });

  it("clears the error as soon as a radio is chosen", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} required />
      </form>,
    );
    act(() => void container.querySelector("form")!.checkValidity());
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup")).not.toBeInvalid();
  });

  it("clears the required message on choosing and on reset, and announces a second refusal anew", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <RadioGroup label="Payment" options={options} required />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = container.querySelector("form")!;
    act(() => void form.checkValidity());
    const first = screen.getByRole("alert");
    act(() => void form.checkValidity());
    expect(screen.getByRole("alert")).not.toBe(first);
    await user.click(screen.getByRole("radio", { name: "Cash" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    act(() => void form.checkValidity());
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("focuses the first radio that is not disabled", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <RadioGroup
          label="Payment"
          options={[{ value: "a", label: "A", disabled: true }, ...options.slice(0, 2)]}
          required
          value=""
        />
        <button type="submit">Send</button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("radio", { name: "Card" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RadioGroup label="Payment" options={options} defaultValue="card" required hint="Hint" error="Error" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("card variant", () => {
    const cards: RadioOption[] = [
      {
        value: "basic",
        label: "Basic",
        description: "For one site",
        meta: "9 / month",
        content: "Two seats",
      },
      { value: "team", label: "Team", meta: "29 / month" },
      { value: "off", label: "Enterprise", disabled: true },
      { value: "pro", label: "Pro" },
    ];

    it("is the default variant unless asked", () => {
      render(<RadioGroup label="Plan" options={cards} />);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-variant", "default");
    });

    it("keeps the radio semantics and reads meta and content as the description", () => {
      render(<RadioGroup label="Plan" options={cards} variant="card" defaultValue="team" />);
      expect(screen.getByRole("radiogroup")).toHaveAttribute("data-variant", "card");
      const basic = screen.getByRole("radio", { name: "Basic" });
      expect(basic).toHaveAccessibleDescription("For one site Two seats 9 / month");
      expect(screen.getByRole("radio", { name: "Team" })).toHaveAccessibleDescription("29 / month");
      expect(screen.getByRole("radio", { name: "Pro" })).not.toHaveAttribute("aria-describedby");
      expect(screen.getAllByRole("radio").map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
    });

    it("moves and chooses with the arrow keys, skipping the disabled card, and chooses on click", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <RadioGroup
          label="Plan"
          options={cards}
          variant="card"
          defaultValue="team"
          onValueChange={onValueChange}
        />,
      );
      screen.getByRole("radio", { name: "Team" }).focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus();
      expect(onValueChange).toHaveBeenLastCalledWith("pro");
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "Basic" })).toHaveFocus();
      await user.keyboard("{ArrowUp}");
      expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus();
      await user.click(screen.getByRole("radio", { name: "Team" }));
      expect(onValueChange).toHaveBeenLastCalledWith("team");
    });

    it("submits its value with the form", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <RadioGroup label="Plan" options={cards} variant="card" name="plan" />
        </form>,
      );
      await user.click(screen.getByRole("radio", { name: "Pro" }));
      expect(new FormData(container.querySelector("form")!).get("plan")).toBe("pro");
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <RadioGroup label="Plan" options={cards} variant="card" defaultValue="basic" hint="Hint" required />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
