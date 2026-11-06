import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a labelled textarea with rows and forwards rest props", () => {
    render(<Textarea aria-label="Notes" name="notes" rows={6} />);
    const box = screen.getByRole("textbox", { name: "Notes" });
    expect(box.tagName).toBe("TEXTAREA");
    expect(box).toHaveAttribute("rows", "6");
    expect(box).toHaveAttribute("name", "notes");
  });

  it("takes its ids and states from a FormField", () => {
    render(
      <FormField label="Notes" hint="Hint" error="Error" required>
        <Textarea />
      </FormField>,
    );
    const box = screen.getByLabelText(/Notes/);
    expect(box).toBeRequired();
    expect(box).toBeInvalid();
    expect(box).toHaveAccessibleDescription("Hint Error");
  });

  it("counts characters against the limit and describes the control with the count", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" showCount maxLength={20} />);
    const box = screen.getByRole("textbox");
    expect(box).toHaveAccessibleDescription("0 / 20");
    await user.type(box, "Hello");
    expect(box).toHaveAccessibleDescription("5 / 20");
  });

  it("counts a controlled value", () => {
    render(<Textarea aria-label="Notes" showCount value="abc" readOnly />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("starts from the default value", () => {
    render(<Textarea aria-label="Notes" showCount maxLength={50} defaultValue="Hello" />);
    expect(screen.getByText("5 / 50")).toBeInTheDocument();
  });

  it("uses a custom count format", () => {
    render(
      <Textarea aria-label="Notes" showCount maxLength={10} formatCount={(n, max) => `${max! - n} left`} />,
    );
    expect(screen.getByText("10 left")).toBeInTheDocument();
  });

  it("announces the count only close to the limit", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" showCount maxLength={10} />);
    const status = screen.getByRole("status");
    await user.type(screen.getByRole("textbox"), "12345678");
    expect(status).toBeEmptyDOMElement();
    await user.type(screen.getByRole("textbox"), "9");
    expect(status).toHaveTextContent("9 of 10 characters");
    expect(screen.getByText("9 / 10")).toHaveAttribute("data-near");
  });

  it("shows no count unless asked", () => {
    render(<Textarea aria-label="Notes" maxLength={10} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("resets the count with the form", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Textarea aria-label="Notes" showCount maxLength={50} defaultValue="Hi" />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.type(screen.getByRole("textbox"), " there");
    expect(screen.getByText("8 / 50")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("2 / 50")).toBeInTheDocument();
  });

  it("does not re-run a callback ref on every render", async () => {
    const user = userEvent.setup();
    const ref = vi.fn();
    render(<Textarea aria-label="Notes" ref={ref} showCount />);
    const calls = ref.mock.calls.length;
    await user.type(screen.getByRole("textbox"), "abc");
    expect(ref.mock.calls.length).toBe(calls);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Notes" hint="Hint" error="Error">
        <Textarea showCount maxLength={100} />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
