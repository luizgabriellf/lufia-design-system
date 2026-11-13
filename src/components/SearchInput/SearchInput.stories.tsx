import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Button } from "../Button";
import { FormField } from "../FormField";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Components/Forms/SearchInput",
  component: SearchInput,
  parameters: { layout: "padded" },
  args: { placeholder: "Search customers" },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 26rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "pressure pump" } };
export const WithShortcut: Story = { args: { shortcut: "/" } };
export const InsideFormField: Story = {
  render: (args) => (
    <FormField label="Customer" hint="Search by name or account number.">
      <SearchInput {...args} />
    </FormField>
  ),
};
export const Invalid: Story = {
  render: (args) => (
    <FormField label="Customer" error="No customer matches that name." required>
      <SearchInput {...args} defaultValue="Acmee" />
    </FormField>
  ),
};
export const Loading: Story = { args: { defaultValue: "pressure", loading: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "pressure pump" } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "pressure pump" } };
/** Typing is debounced: the result list updates 300 ms after the last keystroke. */
export const Debounced: Story = {
  render: (args) => {
    const [query, setQuery] = useState("");
    const [searches, setSearches] = useState<string[]>([]);
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <SearchInput
          {...args}
          shortcut="/"
          onValueChange={setQuery}
          onSearch={(text) => setSearches((s) => [text, ...s].slice(0, 4))}
        />
        <p style={{ margin: 0, color: "var(--lufia-color-text-muted)", fontSize: "0.875rem" }}>
          Typed: &ldquo;{query}&rdquo;. Searched:{" "}
          {searches.length ? searches.map((s) => `“${s}”`).join(", ") : "nothing yet"}.
        </p>
      </div>
    );
  },
};
export const LongText: Story = {
  args: {
    defaultValue: "A search phrase that is much too long to fit inside the box without being clipped",
    shortcut: "Ctrl K",
  },
};
/** A toolbar row: the box keeps a usable width beside fixed-size actions and takes the room that is left. */
export const InToolbar: Story = {
  render: (args) => (
    <div
      data-testid="toolbar"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}
    >
      <SearchInput {...args} aria-label="Search customers" />
      <Button variant="secondary">Filters</Button>
      <Button variant="secondary">Export</Button>
      <Button variant="secondary">Sort</Button>
      <Button>Add customer</Button>
    </div>
  ),
};
/** A grid form: the box is a direct child of a grid and fills its track, also when the track is sized by content. */
export const InGridForm: Story = {
  render: (args) => (
    <form
      data-testid="grid-form"
      style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}
      onSubmit={(event) => event.preventDefault()}
    >
      <SearchInput {...args} aria-label="Search customers" />
      <div
        data-testid="grid-form-content"
        style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", justifyContent: "start" }}
      >
        <SearchInput {...args} aria-label="Search orders" />
        <Button variant="secondary">Filters</Button>
      </div>
    </form>
  ),
};
export const Phone320: Story = {
  args: { defaultValue: "pressure pump", shortcut: "/" },
  globals: { viewport: { value: "w320", isRotated: false } },
};
export const RightToLeft: Story = {
  args: { defaultValue: "pump" },
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
      </div>
    ),
  ],
};
export const AllThemes: Story = {
  render: (args) => (
    <ThemeMatrix>
      <SearchInput {...args} shortcut="/" />
      <div style={{ marginBlockStart: "1rem" }}>
        <SearchInput {...args} defaultValue="pressure pump" />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <SearchInput {...args} loading defaultValue="pressure" />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <SearchInput {...args} disabled />
      </div>
    </ThemeMatrix>
  ),
};
