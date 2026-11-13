import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
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

  describe("compact (size sm)", () => {
    it("marks the box, leaving the default unmarked", () => {
      const { container, rerender } = render(<TextInput aria-label="Name" />);
      const box = container.firstElementChild as HTMLElement;
      expect(box).not.toHaveAttribute("data-size");
      rerender(<TextInput aria-label="Name" size="sm" />);
      expect(box).toHaveAttribute("data-size", "sm");
      rerender(<TextInput aria-label="Name" size="md" />);
      expect(box).not.toHaveAttribute("data-size");
    });

    it("does not pass size to the native input, which would set its character width", () => {
      render(<TextInput aria-label="Name" size="sm" />);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("size");
    });

    it("matches the metrics of the compact Select in the stylesheet", () => {
      const select = readFileSync("src/components/Select/Select.module.css", "utf8");
      const text = readFileSync("src/components/TextInput/TextInput.module.css", "utf8");
      const value = (css: string, rule: RegExp, property: string) =>
        new RegExp(`${property}:\\s*([^;]+);`).exec(rule.exec(css)?.[1] ?? "")?.[1];
      const selectBox = /\.box\[data-size="sm"\]\s*\{([^}]*)\}/;
      const selectNative = /\.box\[data-size="sm"\] \.native\s*\{([^}]*)\}/;
      const textBox = /\.box\[data-size="sm"\]\s*\{([^}]*)\}/;
      const textNative = /\.box\[data-size="sm"\] > input\s*\{([^}]*)\}/;
      expect(value(text, textBox, "min-block-size")).toBe(value(select, selectBox, "min-block-size"));
      for (const property of ["padding-block", "padding-inline-start", "font-size"]) {
        expect(value(text, textNative, property)).toBe(value(select, selectNative, property));
      }
      // Touch screens and phones get the finger-sized target, as the compact Select does.
      expect(text).toMatch(
        /@media \(pointer: coarse\), \(width < 40rem\) \{\s*\.box\[data-size="sm"\] \{\s*min-block-size: var\(--lufia-target-touch, 2\.75rem\);/,
      );
    });

    it("keeps its behaviour, affixes, field state and a ref", async () => {
      const user = userEvent.setup();
      const ref = createRef<HTMLInputElement>();
      render(
        <FormField label="Weight" error="Too heavy" required>
          <TextInput size="sm" prefix="~" suffix="kg" ref={ref} />
        </FormField>,
      );
      const input = screen.getByLabelText(/Weight/);
      await user.type(input, "12");
      expect(ref.current).toHaveValue("12");
      expect(input).toBeInvalid();
      expect(input.previousElementSibling).toHaveTextContent("~");
      expect(input.nextElementSibling).toHaveTextContent("kg");
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <div>
          <TextInput aria-label="Name" size="sm" />
          <TextInput aria-label="Amount" size="sm" prefix="EUR" suffix="kg" invalid />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
