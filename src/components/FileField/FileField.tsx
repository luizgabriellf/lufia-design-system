"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useFormFieldControl, useFormFieldLabelId } from "../FormField";
import { FieldError } from "../FormField/FieldMessages";
import { useControllableState } from "../FormField/useControllableState";
import { useFormReset } from "../FormField/useFormReset";
import { VisuallyHidden } from "../VisuallyHidden";
import { CloseIcon, UploadIcon } from "../Icon/icons";
import styles from "./FileField.module.css";
import { formatFileSize, matchesAccept, sameFile } from "./fileUtils";

export type FileRejectionReason = "type" | "size" | "count";

export type FileRejection = { file: File; reason: FileRejectionReason };

export type FileLimits = { accept?: string; maxSize?: number; maxFiles?: number };

export type FileFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "value" | "defaultValue" | "onChange" | "className" | "children"
> & {
  /** Text of the button that opens the file picker. */
  chooseLabel: string;
  /** Text of the button once a single file is chosen. Defaults to `chooseLabel`. */
  replaceLabel?: string;
  /** Hint inside the drop area ("or drop files here"). Hidden from assistive technology: the button does the same job. */
  dropLabel?: ReactNode;
  /** Shown in place of the list while nothing is chosen ("No file chosen"). */
  emptyLabel?: ReactNode;
  /** Largest file in bytes. Larger files are rejected with reason `"size"`. */
  maxSize?: number;
  /** Most files at once (with `multiple`). The extra ones are rejected with reason `"count"`. */
  maxFiles?: number;
  /** The message for a rejected file. Required: every rejection is shown to the person in their language. */
  formatRejection: (rejection: FileRejection, limits: FileLimits) => string;
  /** Accessible name of a file's remove button. Aria-only. Defaults to "Remove" and the file name. */
  removeLabel?: (file: File) => string;
  /** Visible text on the remove button. Defaults to a cross icon only. */
  removeText?: string;
  /** Read out politely when the chosen files change ("2 files chosen"). Optional. */
  describeFiles?: (files: readonly File[]) => string;
  /** Locale of the sizes. The runtime's when omitted. */
  locale?: string;
  /**
   * Outside a `FormField`, name the field with `aria-label` or `aria-labelledby`; with neither, the button text becomes its
   * accessible name, so it never goes unnamed.
   */
  /** Controlled files. */
  files?: readonly File[];
  /** Called with the whole list after a pick, a drop or a removal. */
  onFilesChange?: (files: File[]) => void;
  /** Called with files that were refused, after the message is shown. */
  onReject?: (rejections: FileRejection[]) => void;
  /** Marks the control invalid without a `FormField`. */
  invalid?: boolean;
  /** Goes on the root element. */
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

const defaultRemoveLabel = (file: File) => `Remove ${file.name}`;

/** Puts `files` into the native input so the form submits what the list shows. Browsers without `DataTransfer` skip it. */
function syncInput(input: HTMLInputElement | null, files: File[]) {
  if (!input) return;
  try {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  } catch {
    if (files.length === 0) input.value = "";
  }
}

/**
 * A file picker with a drop area, the native input kept in the form, limits on type, size and count with messages you
 * provide, and a list of the chosen files with a remove button each. Inside a `FormField` the field's id, description and
 * states apply.
 */
export function FileField({
  chooseLabel,
  replaceLabel,
  dropLabel,
  emptyLabel,
  maxSize,
  maxFiles,
  formatRejection,
  removeLabel = defaultRemoveLabel,
  removeText,
  describeFiles,
  locale,
  files: filesProp,
  onFilesChange,
  onReject,
  invalid,
  className,
  accept,
  multiple = false,
  ref,
  ...rest
}: FileFieldProps) {
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": rest["aria-describedby"],
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    disabled: rest.disabled,
  });
  const generated = useId();
  const baseId = control.id ?? `file-${generated.replace(/:/g, "")}`;
  const rejectionId = `${baseId}-rejections`;
  const [files, setFiles] = useControllableState<readonly File[]>(filesProp, [], undefined);
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const labelId = useFormFieldLabelId();
  const named = Boolean(labelId || rest["aria-label"] || rest["aria-labelledby"]);
  const limits: FileLimits = { accept, maxSize, maxFiles };

  // A controlled list that changes from outside (cleared after a save, say) has to reach the native input too, or the form
  // would still submit the old files.
  useEffect(() => {
    if (filesProp !== undefined) syncInput(input.current, [...filesProp]);
  }, [filesProp]);

  useFormReset(input, () => {
    setRejections([]);
    setFiles([]);
    onFilesChange?.([]);
  });

  const commit = (next: File[]) => {
    setFiles(next);
    syncInput(input.current, next);
    onFilesChange?.(next);
  };

  /** Applies the limits to an incoming pick or drop and merges what passes into the list. */
  const add = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const accepted: File[] = [];
    const refused: FileRejection[] = [];
    const base = multiple ? [...files] : [];
    for (const file of multiple ? incoming : incoming.slice(0, 1)) {
      if (!matchesAccept(file, accept)) refused.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize) refused.push({ file, reason: "size" });
      else if (base.some((known) => sameFile(known, file)) || accepted.some((known) => sameFile(known, file)))
        continue;
      else if (maxFiles !== undefined && base.length + accepted.length >= maxFiles)
        refused.push({ file, reason: "count" });
      else accepted.push(file);
    }
    setRejections(refused);
    if (refused.length > 0) onReject?.(refused);
    if (accepted.length > 0) commit([...base, ...accepted]);
    else syncInput(input.current, [...files]);
  };

  const remove = (target: File) => {
    setRejections([]);
    commit(files.filter((file) => file !== target));
    input.current?.focus();
  };

  const hasFiles = (event: DragEvent) =>
    !control.disabled && Array.from(event.dataTransfer?.types ?? []).includes("Files");

  const messages = rejections.map((rejection) => formatRejection(rejection, limits));
  const describedBy =
    [control["aria-describedby"], messages.length > 0 ? rejectionId : undefined].filter(Boolean).join(" ") ||
    undefined;
  const chosen = files.length > 0;
  const triggerText = !multiple && chosen ? (replaceLabel ?? chooseLabel) : chooseLabel;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-disabled={control.disabled ? "" : undefined}
      data-invalid={control["aria-invalid"] || messages.length > 0 ? "" : undefined}
    >
      {/* A drop target is a pointer convenience; the keyboard and touch path is the native input and its button. */}
      <div
        className={styles.zone}
        data-dragging={dragging ? "" : undefined}
        onDragOver={(event) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(event) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          setDragging(false);
          add(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          {...rest}
          {...control}
          ref={(node) => {
            input.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={baseId}
          type="file"
          accept={accept}
          multiple={multiple}
          aria-describedby={describedBy}
          aria-invalid={control["aria-invalid"] || messages.length > 0 ? true : undefined}
          className={styles.input}
          onChange={(event) => add(Array.from(event.target.files ?? []))}
        />
        <label htmlFor={baseId} className={styles.trigger} aria-hidden={named ? "true" : undefined}>
          <UploadIcon />
          {triggerText}
        </label>
        {dropLabel ? (
          <span className={styles.drop} aria-hidden="true">
            {dropLabel}
          </span>
        ) : null}
      </div>
      {chosen ? (
        <ul className={styles.list}>
          {files.map((file) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.item}>
              <span className={styles.name}>{file.name}</span>
              <span className={styles.size}>{formatFileSize(file.size, locale)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={removeLabel(file)}
                disabled={control.disabled}
                onClick={() => remove(file)}
              >
                <CloseIcon size="sm" />
                {removeText ? <span>{removeText}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : emptyLabel ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : null}
      <VisuallyHidden role="status">{describeFiles && chosen ? describeFiles(files) : ""}</VisuallyHidden>
      {messages.length > 0 ? (
        <FieldError id={rejectionId}>
          {messages.length === 1 ? (
            messages[0]
          ) : (
            <ul className={styles.messages}>
              {messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </FieldError>
      ) : null}
    </div>
  );
}
