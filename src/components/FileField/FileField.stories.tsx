import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { userEvent, within } from "storybook/test";
import { ThemeMatrix } from "../../docs/ThemeMatrix";
import { FormField, type FormFieldProps } from "../FormField";
import { FileField, type FileFieldProps } from "./FileField";
import { formatFileSize } from "./fileUtils";

const formatRejection: FileFieldProps["formatRejection"] = ({ file, reason }, limits) =>
  ({
    type: `${file.name} is not a supported file. Use ${limits.accept}.`,
    size: `${file.name} is larger than ${formatFileSize(limits.maxSize ?? 0, "en")}.`,
    count: `${file.name} was not added. You can attach up to ${limits.maxFiles} files.`,
  })[reason];

const sample = (name: string, size: number, type = "application/pdf") => {
  const file = new File(["sample"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

type DemoProps = FileFieldProps & Pick<FormFieldProps, "label" | "hint" | "error">;

function Demo({ label, hint, error, required, disabled, ...input }: DemoProps) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} disabled={disabled}>
      <FileField {...input} />
    </FormField>
  );
}

const meta = {
  title: "Components/Forms/FileField",
  component: Demo,
  parameters: { layout: "padded" },
  args: {
    label: "Attachments",
    chooseLabel: "Choose files",
    dropLabel: "or drop files here",
    emptyLabel: "No file chosen",
    accept: ".pdf,.png,.jpg",
    multiple: true,
    maxSize: 5 * 1024 * 1024,
    maxFiles: 4,
    locale: "en",
    formatRejection,
    hint: "PDF, PNG or JPG, up to 5 MB each.",
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(100%, 32rem)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleFile: Story = {
  args: {
    label: "Profile photo",
    multiple: false,
    accept: "image/*",
    chooseLabel: "Choose a photo",
    replaceLabel: "Choose another photo",
    maxFiles: undefined,
    dropLabel: "or drop a photo here",
    emptyLabel: "No photo chosen",
    hint: "A square image works best.",
  },
};
/** Controlled with a few files, so the list, the sizes and the remove buttons show without a picker. */
export const WithFiles: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[]>([
      sample("quarterly-report.pdf", 1.4 * 1024 * 1024),
      sample("site-photo.png", 820 * 1024, "image/png"),
      sample(
        "a-file-with-a-very-long-name-that-has-to-be-cut-off-before-it-pushes-the-remove-button.pdf",
        12 * 1024,
      ),
    ]);
    return <Demo {...args} files={files} onFilesChange={setFiles} />;
  },
};
/** A refused file shows its message, built by `formatRejection`, and is linked to the control with `aria-describedby`. */
export const Rejected: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText(/Attachments/);
    await userEvent.upload(
      input,
      [sample("archive.zip", 2048, "application/zip"), sample("huge.pdf", 9 * 1024 * 1024)],
      { applyAccept: false },
    );
  },
};
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { required: true, error: "Attach at least one document." } };
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: {
    label: "A considerably longer label that has to wrap onto a second line on narrow screens",
    chooseLabel: "Choose one or more files from this computer",
    dropLabel: "or drop them anywhere inside this dashed area, as many as the limit allows",
  },
};
export const Phone320: Story = { globals: { viewport: { value: "w320", isRotated: false } } };
export const RightToLeft: Story = {
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
      <Demo {...args} />
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Invalid" error="Attach at least one document." />
      </div>
      <div style={{ marginBlockStart: "1rem" }}>
        <Demo {...args} label="Disabled" disabled />
      </div>
    </ThemeMatrix>
  ),
};
