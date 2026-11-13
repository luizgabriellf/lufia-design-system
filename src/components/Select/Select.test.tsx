import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { VisuallyHidden } from "../VisuallyHidden";
import { Select, type SelectOption } from "./Select";

const options: SelectOption[] = [
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Spain" },
  { value: "fr", label: "France", disabled: true },
];

describe("Select", () => {
  it("renders option groups as optgroups, after the flat options", async () => {
    const user = userEvent.setup();
    render(
      <Select
        aria-label="City"
        options={[{ value: "any", label: "Anywhere" }]}
        groups={[
          { label: "Portugal", options: [{ value: "lisbon", label: "Lisbon" }] },
          { label: "Spain", disabled: true, options: [{ value: "madrid", label: "Madrid" }] },
        ]}
      />,
    );
    const groups = screen.getAllByRole("group");
    expect(groups.map((g) => g.getAttribute("label"))).toEqual(["Portugal", "Spain"]);
    expect(groups[0]).toContainElement(screen.getByRole("option", { name: "Lisbon" }));
    expect(groups[1]).toBeDisabled();
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Anywhere", "Lisbon", "Madrid"]);
    await user.selectOptions(screen.getByRole("combobox"), "lisbon");
    expect(screen.getByRole("combobox")).toHaveValue("lisbon");
  });

  it("accepts two groups with the same label without a key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Select
        aria-label="City"
        groups={[
          { label: "Same", options: [{ value: "a", label: "A" }] },
          { label: "Same", options: [{ value: "b", label: "B" }] },
        ]}
      />,
    );
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("has no axe violations with groups", async () => {
    const { container } = render(
      <Select
        aria-label="City"
        groups={[{ label: "Portugal", options: [{ value: "l", label: "Lisbon" }] }]}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is a native select with the given options", () => {
    render(<Select aria-label="Country" options={options} name="country" />);
    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("name", "country");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Portugal", "Spain", "France"]);
    expect(screen.getByRole("option", { name: "France" })).toBeDisabled();
  });

  it("changes value and reports it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Country" options={options} onChange={onChange} />);
    await user.selectOptions(screen.getByRole("combobox"), "es");
    expect(screen.getByRole("combobox")).toHaveValue("es");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("starts on the placeholder and does not offer it back after a choice", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Country" options={options} placeholder="Choose a country" defaultValue="" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("");
    const placeholder = screen.getByText("Choose a country");
    expect(placeholder).toBeDisabled();
    await user.selectOptions(select, "pt");
    expect(select).toHaveValue("pt");
  });

  it("hides the placeholder from the list unless an empty choice is allowed", () => {
    const { rerender } = render(
      <Select aria-label="Country" options={options} placeholder="Choose" defaultValue="" />,
    );
    expect(screen.getByText("Choose")).toHaveAttribute("hidden");
    rerender(
      <Select aria-label="Country" options={options} placeholder="Choose" allowEmpty defaultValue="" />,
    );
    expect(screen.getByText("Choose")).not.toHaveAttribute("hidden");
  });

  it("keeps the placeholder choosable for optional fields", () => {
    render(<Select aria-label="Country" options={options} placeholder="None" allowEmpty />);
    expect(screen.getByRole("option", { name: "None" })).toBeEnabled();
  });

  it("renders optgroups from children and forwards the ref", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="City" ref={ref}>
        <optgroup label="Portugal">
          <option>Lisbon</option>
        </optgroup>
      </Select>,
    );
    expect(screen.getByRole("group", { name: "Portugal" })).toBeInTheDocument();
    expect(ref.current).toBe(screen.getByRole("combobox"));
  });

  it("takes its ids and states from a FormField", () => {
    render(
      <FormField label="Country" hint="Hint" error="Error" required>
        <Select options={options} />
      </FormField>,
    );
    const select = screen.getByLabelText(/Country/);
    expect(select).toBeRequired();
    expect(select).toBeInvalid();
    expect(select).toHaveAccessibleDescription("Hint Error");
  });

  it("is disabled by its field", () => {
    render(
      <FormField label="Country" disabled>
        <Select options={options} />
      </FormField>,
    );
    expect(screen.getByLabelText("Country")).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FormField label="Country" hint="Hint" error="Error" required>
        <Select options={options} placeholder="Choose" defaultValue="" />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe("compact (size sm)", () => {
    it("marks the box and shrinks the chevron, leaving the default unmarked", () => {
      const { container, rerender } = render(<Select aria-label="Country" options={options} />);
      const box = container.firstElementChild as HTMLElement;
      expect(box).not.toHaveAttribute("data-size");
      expect(box).not.toHaveAttribute("data-variant");
      const defaultChevron = box.querySelector("svg")!.getAttribute("width");
      rerender(<Select aria-label="Country" options={options} size="sm" variant="pill" />);
      expect(box).toHaveAttribute("data-size", "sm");
      expect(box).toHaveAttribute("data-variant", "pill");
      expect(box.querySelector("svg")!.getAttribute("width")).not.toBe(defaultChevron);
    });

    it("does not pass size to the native select, which would turn it into a list box", () => {
      render(<Select aria-label="Country" options={options} size="sm" />);
      expect(screen.getByRole("combobox")).not.toHaveAttribute("size");
    });

    it("is named by a visually hidden label", () => {
      render(
        <>
          <label htmlFor="c">
            <VisuallyHidden>Country</VisuallyHidden>
          </label>
          <Select id="c" options={options} size="sm" variant="pill" />
        </>,
      );
      expect(screen.getByRole("combobox", { name: "Country" })).toBeInTheDocument();
    });

    it("keeps its behaviour and a ref", async () => {
      const user = userEvent.setup();
      const ref = createRef<HTMLSelectElement>();
      render(<Select aria-label="Country" options={options} size="sm" ref={ref} />);
      await user.selectOptions(screen.getByRole("combobox"), "es");
      expect(ref.current).toHaveValue("es");
    });

    it("has no axe violations", async () => {
      const { container } = render(
        <div>
          <Select aria-label="Country" options={options} size="sm" variant="pill" />
          <Select aria-label="Country" options={options} size="sm" invalid />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
