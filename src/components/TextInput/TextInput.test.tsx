import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { TextInput } from "./TextInput";

const fieldCss = readFileSync("src/components/FormField/fieldControl.module.css", "utf8");
const [baseCss = "", forcedCss = ""] = fieldCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("@media (forced-colors: active) {");

/** Declarations of the first rule whose selector list contains `selector`. */
const declarationsFor = (css: string, selector: string) =>
  [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].find((m) =>
    (m[1] ?? "").split(",").some((x) => x.trim() === selector),
  )?.[2] ?? "";

describe("TextInput", () => {
  it.each([".native:-webkit-autofill", ".native:autofill"])(
    "styles %s from tokens, and hands colours to the system when forced",
    (selector) => {
      const declarations = declarationsFor(baseCss, selector);
      expect(declarations).toContain("var(--lufia-color-bg-field-autofill)");
      expect(declarations).toContain("-webkit-text-fill-color: var(--lufia-color-text-default)");
      expect(declarationsFor(forcedCss, selector)).toContain("box-shadow: none");
    },
  );

  it("renders a native input of the given type and forwards rest props and ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TextInput ref={ref} aria-label="Email" type="email" name="email" placeholder="you@example.com" />,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(ref.current).toBe(input);
  });

  it("types like a normal input, controlled or not", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput aria-label="Name" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "Ada");
    expect(screen.getByRole("textbox")).toHaveValue("Ada");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("renders prefix and suffix around the input", () => {
    render(<TextInput aria-label="Amount" prefix="EUR" suffix="kg" />);
    const input = screen.getByRole("textbox");
    expect(input.previousElementSibling).toHaveTextContent("EUR");
    expect(input.nextElementSibling).toHaveTextContent("kg");
  });

  it("takes its id, description, required and invalid state from a FormField", () => {
    render(
      <FormField label="Name" hint="Hint" error="Error" required>
        <TextInput />
      </FormField>,
    );
    const input = screen.getByLabelText(/Name/);
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Hint Error");
  });

  it("is disabled by its field", () => {
    render(
      <FormField label="Name" disabled>
        <TextInput />
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("marks itself invalid and flags the box without a field", () => {
    const { container } = render(<TextInput aria-label="Name" invalid />);
    expect(screen.getByRole("textbox")).toBeInvalid();
    expect(container.firstElementChild).toHaveAttribute("data-invalid");
  });

  it("flags read-only and keeps the value focusable", async () => {
    const user = userEvent.setup();
    const { container } = render(<TextInput aria-label="Number" readOnly defaultValue="INV-1" />);
    await user.type(screen.getByRole("textbox"), "x");
    expect(screen.getByRole("textbox")).toHaveValue("INV-1");
    expect(container.firstElementChild).toHaveAttribute("data-readonly");
  });

  it("merges its own aria-describedby with the field's", () => {
    render(
      <FormField label="Name" hint="Hint">
        <TextInput aria-describedby="extra" />
      </FormField>,
    );
    expect(screen.getByLabelText("Name").getAttribute("aria-describedby")).toMatch(/-hint extra$/);
  });

  it("puts className on the box", () => {
    const { container } = render(<TextInput aria-label="Name" className="extra" />);
    expect(container.firstElementChild).toHaveClass("box", "extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Name" hint="Hint" error="Error" required>
        <TextInput prefix="EUR" suffix="kg" />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
