# FileField

> A file picker with drag and drop, validation and a list of chosen files.

- Status: beta
- Category: Forms
- Import: `import { FileField, formatFileSize, matchesAccept } from "@lufia/design-system/components/FileField"`
- Also from: `@lufia/design-system`
- Source: [src/components/FileField](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/FileField)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-forms-filefield--docs)

## Purpose

A file picker with a drop area. The native `<input type="file">` stays in the form, limits on type, size and count are checked
with messages you provide, and the chosen files are listed with a remove button each.

## When to use

- Attachments, documents and images that are submitted with a form, where people may have the files on their desktop.

## When not to use

- Importing data that needs a preview and column mapping: build that flow around a plain file input.
- Large or resumable uploads: use a dedicated uploader and show its progress.

## Exports

| Name | Kind |
| --- | --- |
| `FileField` | component |
| `formatFileSize` | function |
| `matchesAccept` | function |

## API

### `FileField`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `chooseLabel` | `string` | yes |  | Text of the button that opens the file picker. |
| `replaceLabel` | `string` | no |  | Text of the button once a single file is chosen. Defaults to `chooseLabel`. |
| `dropLabel` | `ReactNode` | no |  | Hint inside the drop area ("or drop files here"). Hidden from assistive technology: the button does the same job. |
| `emptyLabel` | `ReactNode` | no |  | Shown in place of the list while nothing is chosen ("No file chosen"). |
| `maxSize` | `number` | no |  | Largest file in bytes. Larger files are rejected with reason `"size"`. |
| `maxFiles` | `number` | no |  | Most files at once (with `multiple`). The extra ones are rejected with reason `"count"`. |
| `formatRejection` | `(rejection: FileRejection, limits: FileLimits) => string` | yes |  | The message for a rejected file. Required: every rejection is shown to the person in their language. |
| `removeLabel` | `((file: File) => string)` | no | `defaultRemoveLabel` | Accessible name of a file's remove button. Aria-only. Defaults to "Remove" and the file name. |
| `removeText` | `string` | no |  | Visible text on the remove button. Defaults to a cross icon only. |
| `describeFiles` | `((files: readonly File[]) => string)` | no |  | Read out politely when the chosen files change ("2 files chosen"). Optional. |
| `locale` | `string` | no |  | Locale of the sizes. The runtime's when omitted. |
| `files` | `readonly File[]` | no |  | Controlled files. |
| `onFilesChange` | `((files: File[]) => void)` | no |  | Called with the whole list after a pick, a drop or a removal. |
| `onReject` | `((rejections: FileRejection[]) => void)` | no |  | Called with files that were refused, after the message is shown. |
| `invalid` | `boolean` | no |  | Marks the control invalid without a `FormField`. |
| `className` | `string` | no |  | Goes on the root element. |
| `ref` | `Ref<HTMLInputElement>` | no |  |  |

Other native element attributes pass through to the root element.

### `formatFileSize`

A readable file size: "820 B", "12.4 KB", "1.4 MB". Units are symbols, not words; the number follows `locale` (the runtime's when omitted), so "1,4 MB" in Portuguese.

```ts
formatFileSize(bytes: number, locale?: string | undefined): string
```

### `matchesAccept`

The rule of the native `accept` attribute (extensions, MIME types and `type/*` wildcards, comma separated), applied by hand because a dropped file bypasses the attribute. An empty rule accepts everything.

```ts
matchesAccept(file: Pick<File, "name" | "type">, accept?: string | undefined): boolean
```

## Types

- `FileLimits`: `{ accept?: string | undefined; maxSize?: number | undefined; maxFiles?: number | undefined; }`
- `FileRejection`: `{ file: File; reason: FileRejectionReason; }`
- `FileRejectionReason`: `"type" | "size" | "count"`

## Example

```tsx
import { FormField } from "@lufia/design-system/components/FormField";
import { FileField } from "@lufia/design-system/components/FileField";

<FormField label="Attachments" hint="PDF, PNG or JPG, up to 5 MB each.">
  <FileField
    name="attachments"
    multiple
    accept=".pdf,.png,.jpg"
    maxSize={5 * 1024 * 1024}
    maxFiles={4}
    chooseLabel="Choose files"
    dropLabel="or drop files here"
    emptyLabel="No file chosen"
    formatRejection={({ file, reason }, limits) => messages[reason](file.name, limits)}
    onFilesChange={setFiles}
  />
</FormField>;
```

## Accessibility

- The real input is the control: it has the field's accessible name and description, `aria-invalid`, and `required`.
- Focus on the input draws the focus ring on the button.
- Refusals use `role="alert"` and are part of the input's description. Several are shown as a list.
- Each remove button is named after its file ("Remove report.pdf"; change it with `removeLabel`). After a removal focus returns
- Pass `describeFiles` to have a polite status announce the new count ("2 files chosen") after a pick.
- The drop area is a dashed border that fills with the accent when files are dragged over it, which is not colour alone.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-field`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-medium`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-card`, `--lufia-radius-control`, `--lufia-radius-md`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

Say what is accepted before the person chooses, in the hint: types and the size limit. Refusals say which file and why, and
what to do: "report.docx is not supported. Use a PDF.", "huge.pdf is larger than 5 MB.". Keep the button a verb phrase
("Choose files") and the drop text secondary ("or drop files here"), since many people will not drag.

## Stories

- `components-forms-filefield--default`
- `components-forms-filefield--single-file`
- `components-forms-filefield--with-files`
- `components-forms-filefield--rejected`
- `components-forms-filefield--required`
- `components-forms-filefield--invalid`
- `components-forms-filefield--disabled`
- `components-forms-filefield--long-text`
- `components-forms-filefield--phone-320`
- `components-forms-filefield--right-to-left`
- `components-forms-filefield--all-themes`
