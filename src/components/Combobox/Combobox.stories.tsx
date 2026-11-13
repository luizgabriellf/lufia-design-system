import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { userEvent, within } from "storybook/test";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { FormField, type FormFieldProps } from "../FormField";
import { Modal } from "../Modal";
import { Combobox, type ComboboxOption, type ComboboxProps } from "./Combobox";

const cities: ComboboxOption[] = [
  { value: "sp", label: "São Paulo", description: "Brazil" },
  { value: "lis", label: "Lisbon", description: "Portugal" },
  { value: "ber", label: "Berlin", description: "Germany", disabled: true },
  { value: "par", label: "Paris", description: "France" },
  { value: "mad", label: "Madrid", description: "Spain" },
  { value: "rom", label: "Rome", description: "Italy" },
  { value: "ams", label: "Amsterdam", description: "Netherlands" },
  { value: "vie", label: "Vienna", description: "Austria" },
  { value: "pra", label: "Prague", description: "Czechia" },
];

type DemoProps = ComboboxProps & Pick<FormFieldProps, "label" | "hint" | "error">;

function Demo({ label, hint, error, required, disabled, ...input }: DemoProps) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled}>
      <Combobox {...input} />
    </FormField>
  );
}

const openList = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  await userEvent.click(within(canvasElement).getByRole("combobox"));
};

/** Opens the list and moves the keyboard highlight to the first enabled option. */
const openAndHighlight = async (context: { canvasElement: HTMLElement }) => {
  await openList(context);
  await userEvent.keyboard("{ArrowDown}");
};

const meta = {
  title: "Components/Forms/Combobox",
  component: Demo,
  parameters: { layout: "padded" },
  args: {
    label: "City",
    options: cities,
    placeholder: "Search for a city",
    emptyLabel: "No city matches that search.",
    loadingLabel: "Loading cities…",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 24rem)", minBlockSize: "22rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** The list is open: options with a description, a disabled option, and the first enabled one highlighted by the arrow key. */
export const Open: Story = { play: openAndHighlight };
export const WithValue: Story = { args: { defaultValue: "lis" }, play: openList };
export const WithHint: Story = { args: { hint: "Start typing to narrow the list." } };
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { required: true, error: "Choose a city to continue." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "lis" } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "lis" } };
export const Clearable: Story = { args: { clearable: true, clearLabel: "Clear city", defaultValue: "par" } };
/** `freeText`: the typed text is the value when no option is chosen. Enter, Tab and blur settle it; Enter never picks the first match. */
export const FreeText: Story = {
  args: { freeText: true, hint: "Pick a city or type another place.", maxLength: 40 },
  render: (args) => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <>
        <Demo {...args} value={value} onValueChange={setValue} />
        <p style={{ marginBlockStart: "0.5rem" }}>Value: {value === null ? "none" : `"${value}"`}</p>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole("combobox"), "Faro");
  },
};
/** Typed text that matches nothing shows the empty state. It is announced, and the box has no list to point at. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.type(within(canvasElement).getByRole("combobox"), "zzz");
  },
};
export const Loading: Story = {
  args: { loading: true, options: [] },
  play: openList,
};
/** Options arrive from a "server": typing sets `loading`, then replaces the options. `filter={false}` trusts the result. */
export const AsyncOptions: Story = {
  render: (args) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ComboboxOption[]>([]);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
      if (query === "") return;
      setLoading(true);
      timer.current = setTimeout(() => {
        const needle = query.toLowerCase();
        setResults(cities.filter((city) => city.label.toLowerCase().includes(needle)));
        setLoading(false);
      }, 700);
      return () => clearTimeout(timer.current);
    }, [query]);
    return (
      <Demo
        {...args}
        options={query === "" ? [] : results}
        loading={loading}
        filter={false}
        onQueryChange={setQuery}
        hint="Type at least one letter. Results take a moment."
        resultsLabel={(count) => `${count} cities found`}
      />
    );
  },
};
export const LongOptions: Story = {
  args: {
    options: [
      {
        value: "a",
        label: "A very long option label that wraps onto a second line inside the list without being clipped",
        description: "And an equally long description to show how the two lines align in the option",
      },
      ...cities.slice(0, 3),
    ],
  },
  play: openList,
};
export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 60 }, (_, index) => ({ value: `${index}`, label: `Option ${index + 1}` })),
  },
  play: openList,
};
/**
 * `maxResults` with a custom `filter`: a long local list shows its first 8 matches, the filter also reads the description,
 * and `resultsLabel` gets the total so it can say how many more there are.
 */
export const CappedResults: Story = {
  args: {
    options: Array.from({ length: 120 }, (_, index) => ({
      value: `site-${index}`,
      label: `Site ${index + 1}`,
      description: ["North", "South", "East", "West"][index % 4],
    })),
    maxResults: 8,
    filter: (option: ComboboxOption, query: string) =>
      `${option.label} ${option.description ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
    resultsLabel: (count: number, total: number) =>
      count < total ? `${count} of ${total} sites shown. Type to narrow.` : `${count} sites`,
    hint: "Shows the first 8 matches; type a name or a region.",
    label: "Site",
    placeholder: "Search for a site",
  },
  play: openList,
};
/** Inside a dialog, Escape closes the list first and the dialog on the next press. */
export const InsideDialog: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open dialog
        </Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Where do you live?">
          <Demo {...args} />
        </Modal>
      </>
    );
  },
};
/** Inside a short scrolling box the list flips and shrinks to the room the box leaves, instead of being clipped. */
export const InsideClippingBox: Story = {
  render: (args) => (
    <div style={{ blockSize: "14rem", overflowY: "auto", paddingBlockStart: "9rem" }}>
      <Demo {...args} />
    </div>
  ),
  play: openList,
};
const longCity = {
  value: "long",
  label: "Centro de Saúde da Zona Industrial Norte, Unidade de Saúde Familiar",
  description: "Long label",
};
/** A long chosen label wraps onto up to two lines instead of being cut. Open it and the box is one editable line. */
export const WrappedValue: Story = {
  args: {
    options: [longCity, ...cities.slice(0, 3)],
    defaultValue: "long",
    wrapValue: true,
    clearable: true,
    clearLabel: "Clear city",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 16rem)", minBlockSize: "22rem" }}>
        <Story />
      </div>
    ),
  ],
};
export const WrappedValuePhone320: Story = {
  ...WrappedValue,
  args: { ...WrappedValue.args, maxValueLines: 3 },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const Phone320: Story = {
  args: { required: true, defaultValue: "sp" },
  globals: { viewport: { value: "w320", isRotated: false } },
  play: openList,
};
export const RightToLeft: Story = {
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
  play: openList,
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <Demo {...args} defaultValue="lis" />
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Invalid" error="Choose a city to continue." />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Disabled" disabled />
      </div>
    </ThemeMatrix>
  ),
};
