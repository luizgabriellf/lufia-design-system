import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { axe } from "../../test/axe";
import { FormField } from "../FormField";
import { useDismiss } from "../useDismiss";
import { Combobox, type ComboboxOption } from "./Combobox";

const options: ComboboxOption[] = [
  { value: "sp", label: "São Paulo", description: "Brazil" },
  { value: "lis", label: "Lisbon" },
  { value: "ber", label: "Berlin", disabled: true },
  { value: "par", label: "Paris" },
];

const texts = { loadingLabel: "Loading cities", emptyLabel: "No city matches" };

/** jsdom has no layout, and `useDismiss` ignores a popup without boxes; give every element one. */
beforeEach(() => {
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([
    new DOMRect(0, 0, 10, 10),
  ] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

const box = () => screen.getByRole("combobox", { name: "City" });

function renderCombobox(props: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  return render(<Combobox aria-label="City" options={options} {...texts} {...props} />);
}

describe("Combobox ARIA", () => {
  it("is a closed combobox with list autocomplete and no active descendant", () => {
    renderCombobox();
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveAttribute("aria-autocomplete", "list");
    expect(box()).not.toHaveAttribute("aria-activedescendant");
    expect(box()).not.toHaveAttribute("aria-controls");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens a listbox that the input controls, and names the options", async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(box());
    const list = screen.getByRole("listbox", { name: "City" });
    expect(box()).toHaveAttribute("aria-expanded", "true");
    expect(box()).toHaveAttribute("aria-controls", list.id);
    expect(
      within(list)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["São PauloBrazil", "Lisbon", "Berlin", "Paris"]);
    expect(screen.getByRole("option", { name: /Berlin/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("gives options stable ids built from their values", async () => {
    const user = userEvent.setup();
    const { rerender } = renderCombobox({ id: "city" });
    await user.click(box());
    const before = screen.getAllByRole("option").map((o) => o.id);
    expect(before).toEqual(["city-option-sp", "city-option-lis", "city-option-ber", "city-option-par"]);
    rerender(<Combobox aria-label="City" id="city" options={[...options].reverse()} {...texts} />);
    expect(screen.getByRole("option", { name: "Lisbon" }).id).toBe("city-option-lis");
  });

  it("encodes values that are not valid in an id", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c", options: [{ value: "a b/c", label: "Odd" }] });
    await user.click(box());
    expect(screen.getByRole("option").id).toBe("c-option-a_20_b_2f_c");
  });
});

describe("Combobox ids never collide", () => {
  it("gives different ids to values that differ only in punctuation", async () => {
    const user = userEvent.setup();
    renderCombobox({
      id: "c",
      options: [
        { value: "a b", label: "One" },
        { value: "a_20_b", label: "Two" },
        { value: "a-b", label: "Three" },
        { value: "a.b", label: "Four" },
      ],
    });
    await user.click(box());
    const ids = screen.getAllByRole("option").map((o) => o.id);
    expect(new Set(ids).size).toBe(4);
  });
});

describe("Combobox keyboard", () => {
  it("opens with ArrowDown on the first enabled option and moves the active descendant, wrapping and skipping disabled", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c" });
    box().focus();
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-sp");
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-lis");
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-par");
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-sp");
    await user.keyboard("{ArrowUp}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-par");
    expect(box()).toHaveFocus();
    expect(screen.getByRole("option", { name: "Paris" })).toHaveAttribute("data-active", "true");
  });

  it("opens with ArrowUp on the last enabled option", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c" });
    box().focus();
    await user.keyboard("{ArrowUp}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-par");
  });

  it("chooses the active option with Enter, shows its label and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });
    box().focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(box()).toHaveValue("Lisbon");
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).toHaveBeenCalledWith("lis", options[1]);
  });

  it("does not submit the form when Enter chooses", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Combobox aria-label="City" options={options} {...texts} />
        <button type="submit">Save</button>
      </form>,
    );
    box().focus();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("closes with Escape and keeps the choice; the list reopens on the chosen option", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c", defaultValue: "par" });
    box().focus();
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-par");
    await user.keyboard("{Escape}");
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveValue("Paris");
    expect(box()).toHaveFocus();
  });

  it("reverts typed text on Escape and on blur", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox aria-label="City" options={options} defaultValue="lis" {...texts} />
        <button type="button">Elsewhere</button>
      </>,
    );
    await user.click(box());
    await user.keyboard("zz");
    expect(box()).toHaveValue("zz");
    await user.keyboard("{Escape}");
    expect(box()).toHaveValue("Lisbon");
    await user.keyboard("p");
    await user.tab();
    expect(box()).toHaveValue("Lisbon");
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Tab without choosing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });
    box().focus();
    await user.keyboard("{ArrowDown}{Tab}");
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears with Escape when closed and clearable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ clearable: true, defaultValue: "lis", onValueChange });
    box().focus();
    await user.keyboard("{Escape}");
    expect(box()).toHaveValue("");
    expect(onValueChange).toHaveBeenCalledWith(null, null);
  });
});

describe("Combobox typeahead and empty state", () => {
  it("narrows the list as the person types, ignoring case and diacritics, and highlights the first match", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c" });
    await user.click(box());
    await user.keyboard("SAO");
    expect(screen.getAllByRole("option").map((o) => o.id)).toEqual(["c-option-sp"]);
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-sp");
    await user.keyboard("{Enter}");
    expect(box()).toHaveValue("São Paulo");
  });

  it("restores the whole list when the person opens it again after choosing", async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(box());
    await user.keyboard("par{Enter}");
    await user.click(box());
    expect(screen.getAllByRole("option")).toHaveLength(4);
    expect(screen.getByRole("option", { name: "Paris" })).toHaveAttribute("aria-selected", "true");
  });

  it("shows and announces the empty state, with no listbox to point at", async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(box());
    await user.keyboard("zzz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).not.toHaveAttribute("aria-controls");
    expect(box()).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getByRole("status")).toHaveTextContent("No city matches");
    expect(screen.getAllByText("No city matches").length).toBeGreaterThan(0);
  });

  it("announces the result count when asked", async () => {
    const user = userEvent.setup();
    renderCombobox({ resultsLabel: (n) => `${n} cities` });
    await user.click(box());
    expect(screen.getByRole("status")).toHaveTextContent("4 cities");
    await user.keyboard("li");
    expect(screen.getByRole("status")).toHaveTextContent("2 cities");
  });

  it("uses a custom filter, or none", async () => {
    const user = userEvent.setup();
    const { rerender } = renderCombobox({ filter: (option, query) => option.value === query });
    await user.click(box());
    await user.keyboard("par");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Paris"]);
    rerender(<Combobox aria-label="City" options={options} filter={false} {...texts} />);
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("reports the typed text for async loading", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    renderCombobox({ onQueryChange });
    await user.click(box());
    await user.keyboard("li");
    expect(onQueryChange.mock.calls.map(([q]) => q)).toEqual(["l", "li"]);
  });
});

describe("Combobox async", () => {
  function Remote() {
    const [results, setResults] = useState<ComboboxOption[]>([]);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Combobox
          aria-label="City"
          options={results}
          filter={false}
          loading={loading}
          {...texts}
          onQueryChange={(query) => {
            setLoading(query !== "go");
            setResults(query === "li" ? [options[1]!] : query === "pa" ? [options[3]!] : []);
          }}
        />
      </>
    );
  }

  it("shows the loading state while loading, then the results", async () => {
    const user = userEvent.setup();
    render(<Remote />);
    await user.click(box());
    await user.keyboard("l");
    expect(box()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading cities");
  });

  it("keeps the label of the chosen option when later results replace it", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [results, setResults] = useState<ComboboxOption[]>([options[1]!, options[3]!]);
      return (
        <Combobox
          aria-label="City"
          options={results}
          filter={false}
          {...texts}
          onQueryChange={(q) => q === "other" && setResults([options[0]!])}
        />
      );
    }
    render(<Harness />);
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Lisbon" }));
    expect(box()).toHaveValue("Lisbon");
    await user.click(box());
    await user.keyboard("other");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["São PauloBrazil"]);
    await user.keyboard("{Escape}");
    expect(box()).toHaveValue("Lisbon");
  });

  it("falls back to valueLabel for a value that is not in the options", () => {
    renderCombobox({ value: "zz", valueLabel: "Zagreb" });
    expect(box()).toHaveValue("Zagreb");
  });
});

describe("Combobox pointer", () => {
  it("chooses on click and keeps focus in the input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Paris" }));
    expect(box()).toHaveValue("Paris");
    expect(box()).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledWith("par", options[3]);
  });

  it("does not choose a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderCombobox({ onValueChange });
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Berlin" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(box()).toHaveAttribute("aria-expanded", "true");
  });

  it("highlights the option under the pointer", async () => {
    const user = userEvent.setup();
    renderCombobox({ id: "c" });
    await user.click(box());
    await user.hover(screen.getByRole("option", { name: "Paris" }));
    expect(box()).toHaveAttribute("aria-activedescendant", "c-option-par");
  });

  it("closes on a press outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox aria-label="City" options={options} {...texts} />
        <button type="button">Outside</button>
      </>,
    );
    await user.click(box());
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles with the chevron button and clears with the clear button", async () => {
    const user = userEvent.setup();
    renderCombobox({ clearable: true, defaultValue: "lis", toggleLabel: "Toggle", clearLabel: "Clear city" });
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(box()).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(box()).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("button", { name: "Clear city" }));
    expect(box()).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Clear city" })).not.toBeInTheDocument();
  });
});

describe("Combobox layers", () => {
  it("closes before the dialog around it: the second Escape reaches the outer layer", async () => {
    const user = userEvent.setup();
    function Outer() {
      const [open, setOpen] = useState(true);
      const root = useRef<HTMLDivElement>(null);
      useDismiss(open, () => setOpen(false), root);
      return open ? (
        <div ref={root} role="dialog" aria-label="Outer">
          <Combobox aria-label="City" options={options} {...texts} />
        </div>
      ) : null;
    }
    render(<Outer />);
    await user.click(box());
    await user.keyboard("{Escape}");
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Combobox form integration", () => {
  it("takes its name, description, required and invalid state from a FormField", async () => {
    const user = userEvent.setup();
    render(
      <FormField label="City" hint="Where you live." error="Choose a city." required>
        <Combobox options={options} {...texts} />
      </FormField>,
    );
    const input = screen.getByRole("combobox", { name: /City/ });
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Where you live. Choose a city.");
    await user.click(input);
    expect(screen.getByRole("listbox", { name: /City/ })).toBeInTheDocument();
  });

  it("submits the value, not the text, under name", async () => {
    const user = userEvent.setup();
    const { container } = renderCombobox({ name: "city" });
    expect(container.querySelector('input[name="city"]')).toHaveValue("");
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Paris" }));
    expect(container.querySelector('input[name="city"]')).toHaveValue("par");
  });

  it("follows a controlled value", () => {
    const { rerender } = renderCombobox({ value: "lis" });
    expect(box()).toHaveValue("Lisbon");
    rerender(<Combobox aria-label="City" options={options} value={null} {...texts} />);
    expect(box()).toHaveValue("");
  });

  it("does not open when disabled or read-only", async () => {
    const user = userEvent.setup();
    const { rerender } = renderCombobox({ disabled: true });
    await user.click(box());
    expect(box()).toHaveAttribute("aria-expanded", "false");
    rerender(<Combobox aria-label="City" options={options} readOnly {...texts} />);
    box().focus();
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Combobox constraint validation and reset", () => {
  it("blocks submit while required and nothing is chosen, with the browser's message", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Combobox aria-label="City" options={options} required {...texts} />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(form.checkValidity()).toBe(false);
    expect((box() as HTMLInputElement).validationMessage).not.toBe("");
    await user.click(box());
    await user.keyboard("zz");
    expect(form.checkValidity()).toBe(false);
    await user.keyboard("{Escape}");
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Paris" }));
    expect(form.checkValidity()).toBe(true);
    expect((box() as HTMLInputElement).validationMessage).toBe("");
  });

  it("uses requiredMessage when given, and is valid when not required", () => {
    const { container, rerender } = render(
      <form>
        <Combobox aria-label="City" options={options} required requiredMessage="Pick a city" {...texts} />
      </form>,
    );
    expect((box() as HTMLInputElement).validationMessage).toBe("Pick a city");
    rerender(
      <form>
        <Combobox aria-label="City" options={options} {...texts} />
      </form>,
    );
    expect(container.querySelector("form")!.checkValidity()).toBe(true);
  });

  it("goes back to its default value when the form is reset", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Combobox
          aria-label="City"
          name="city"
          options={options}
          defaultValue="lis"
          onValueChange={onValueChange}
          {...texts}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    await user.click(box());
    await user.click(screen.getByRole("option", { name: "Paris" }));
    expect(box()).toHaveValue("Paris");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(box()).toHaveValue("Lisbon");
    expect(container.querySelector('input[name="city"]')).toHaveValue("lis");
    expect(onValueChange).toHaveBeenLastCalledWith("lis", options[1]);
  });
});

describe("Combobox axe", () => {
  it("has no violations closed", async () => {
    const { container } = render(
      <FormField label="City" hint="Hint" error="Error" required>
        <Combobox options={options} {...texts} clearable defaultValue="lis" />
      </FormField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no violations open, with options and in the empty state", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FormField label="City">
        <Combobox options={options} {...texts} />
      </FormField>,
    );
    await user.click(screen.getByRole("combobox"));
    expect(await axe(container)).toHaveNoViolations();
    await user.keyboard("zzz");
    expect(await axe(container)).toHaveNoViolations();
  });
});
