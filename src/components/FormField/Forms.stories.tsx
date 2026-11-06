import type { Meta, StoryObj } from "@storybook/react-vite";
import { useActionState, useState } from "react";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { Checkbox } from "../Checkbox";
import { Combobox, type ComboboxOption } from "../Combobox";
import { FileField } from "../FileField";
import { PendingSubmit } from "../PendingSubmit";
import { RadioGroup } from "../RadioGroup";
import { SearchInput } from "../SearchInput";
import { SegmentedToggle } from "../SegmentedToggle";
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Textarea } from "../Textarea";
import { TextInput } from "../TextInput";
import { FormField } from "./FormField";

const cities: ComboboxOption[] = [
  { value: "lis", label: "Lisbon", description: "Portugal" },
  { value: "par", label: "Paris", description: "France" },
  { value: "mad", label: "Madrid", description: "Spain" },
  { value: "rom", label: "Rome", description: "Italy" },
];

type Errors = Partial<Record<"name" | "email" | "city" | "terms", string>>;

/** One form that uses every control of the cluster, validating on submit like a real one. */
function ProjectForm({ withErrors = false }: { withErrors?: boolean }) {
  const [errors, submit] = useActionState(async (_previous: Errors, data: FormData): Promise<Errors> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const next: Errors = {};
    if (!data.get("name")) next.name = "Enter a project name to continue.";
    if (!data.get("city")) next.city = "Choose a city.";
    if (!data.get("terms")) next.terms = "Accept the terms to continue.";
    return next;
  }, {} as Errors);
  const [view, setView] = useState("board");
  const shown: Errors = withErrors
    ? {
        name: "Enter a project name to continue.",
        city: "Choose a city.",
        terms: "Accept the terms to continue.",
        ...errors,
      }
    : errors;

  return (
    <form
      action={submit}
      noValidate
      style={{ display: "grid", gap: "1.25rem", inlineSize: "min(100%, 34rem)" }}
    >
      <FormField
        label="Project name"
        hint="Shown on invoices and in the sidebar."
        required
        error={shown.name}
      >
        <TextInput name="name" placeholder="Quarterly report" autoComplete="off" />
      </FormField>
      <FormField label="Budget" hint="Without tax.">
        <TextInput name="budget" prefix="EUR" inputMode="decimal" placeholder="0.00" />
      </FormField>
      <FormField label="City" required error={shown.city}>
        <Combobox
          name="city"
          options={cities}
          placeholder="Search for a city"
          emptyLabel="No city matches that search."
          loadingLabel="Loading cities…"
        />
      </FormField>
      <FormField label="Currency">
        <Select
          name="currency"
          defaultValue="eur"
          options={[
            { value: "eur", label: "Euro" },
            { value: "usd", label: "US dollar" },
            { value: "gbp", label: "Pound sterling" },
          ]}
        />
      </FormField>
      <FormField label="Notes" hint="Visible to everyone on the project.">
        <Textarea name="notes" maxLength={200} showCount />
      </FormField>
      <FormField label="Lookup an existing client">
        <SearchInput placeholder="Search clients" shortcut="/" />
      </FormField>
      <RadioGroup
        label="Visibility"
        name="visibility"
        defaultValue="team"
        options={[
          { value: "team", label: "Team", description: "Only people on the project." },
          { value: "org", label: "Organisation", description: "Everyone at the company." },
        ]}
      />
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Layout</span>
        <SegmentedToggle
          label="Layout"
          name="layout"
          value={view}
          onValueChange={setView}
          options={[
            { value: "list", label: "List" },
            { value: "board", label: "Board" },
          ]}
        />
      </div>
      <FormField label="Attachments" hint="PDF or PNG, up to 5 MB each.">
        <FileField
          name="attachments"
          multiple
          accept=".pdf,.png"
          maxSize={5 * 1024 * 1024}
          locale="en"
          chooseLabel="Choose files"
          dropLabel="or drop files here"
          emptyLabel="No file chosen"
          formatRejection={({ file, reason }) =>
            reason === "type"
              ? `${file.name} is not a PDF or PNG.`
              : `${file.name} is too large or over the limit.`
          }
        />
      </FormField>
      <Switch name="notify" label="Email me about changes" hint="At most one message a day." defaultChecked />
      <Checkbox name="terms" label="I accept the terms of service" required error={shown.terms} />
      <div>
        <PendingSubmit pendingLabel="Saving…" progress={[[1000, "Still saving…"]]}>
          Create project
        </PendingSubmit>
      </div>
    </form>
  );
}

const meta = {
  title: "Forms/Composed form",
  component: ProjectForm,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProjectForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every control in one form. Submit it empty to see the errors arrive from a pending action. */
export const Default: Story = {};
export const WithErrors: Story = { args: { withErrors: true } };
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const Phone390: Story = { globals: { viewport: { value: "w390", isRotated: false } } };
export const AllThemes: Story = {
  render: () => (
    <ThemeMatrix>
      <ProjectForm withErrors />
    </ThemeMatrix>
  ),
};
