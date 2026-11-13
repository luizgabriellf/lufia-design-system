"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { flushSync } from "react-dom";
import { Reveal } from "../../motion/Reveal";
import { Button } from "../Button";
import { FieldError, FieldHint } from "../FormField/FieldMessages";
import { useFormReset } from "../FormField/useFormReset";
import { IconButton } from "../IconButton";
import { PlusIcon, TrashIcon } from "../Icon/icons";
import { useLufia } from "../LufiaProvider";
import { TextInput } from "../TextInput";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./ListField.module.css";

export type ListFieldLabels = {
  /** Text of the add button. */
  add: string;
  /** Accessible name of the remove button of one entry. `index` counts from 1; `text` is the entry. */
  remove: (index: number, text: string) => string;
  /** Accessible name of the text input of one entry. `index` counts from 1. */
  entry: (index: number) => string;
  /**
   * Validation message of the add input while a `required` field has no entry yet. Without it the browser's own required
   * message is used.
   */
  requiredMessage?: string;
};

export type ListFieldHandle = {
  /**
   * Adds the text waiting in the add input as an entry, as the add button does, and returns whether an entry was added.
   * The new value is in the hidden input when this returns, so call it right before submitting a form.
   */
  commitDraft: () => boolean;
};

export type ListFieldProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "children" | "placeholder"
> & {
  /** Names the group and the add input. */
  label: ReactNode;
  /** Every user-facing string of the field. The package has no built-in language. */
  labels: ListFieldLabels;
  /** Submitted with the form as ONE hidden text value under this name: `serialize(items)`. */
  name?: string;
  /** Controlled entries. A value that differs from what the field holds replaces its rows. */
  items?: readonly string[];
  defaultItems?: readonly string[];
  /** Called with the entries (sanitized, empty ones left out) after every add, edit and removal. */
  onChange?: (items: string[]) => void;
  /** Turns the entries into the submitted value. Defaults to joining them with a line feed. */
  serialize?: (items: readonly string[]) => string;
  /** Cleans one entry when it is added and whenever the entries are read (trimming, collapsing spaces). Must be idempotent. */
  sanitizeItem?: (text: string) => string;
  /** The most entries. Adding is disabled when reached. Default 30. */
  maxItems?: number;
  /** The longest entry, in characters. */
  itemMaxLength?: number;
  /**
   * The longest serialized value, in characters. The add input stops accepting text at the room left, and adding is
   * disabled when none is.
   */
  maxTotalLength?: number;
  /**
   * At least one entry is needed. The add input then carries `labels.requiredMessage` as its custom validity until there is
   * one. Text waiting in the add input does not count unless `includeDraft` is on.
   */
  required?: boolean;
  /**
   * Puts the text waiting in the add input in the submitted value, as if the add button had been pressed: the hidden value
   * is `serialize([...items, draft])` while the draft is not empty after `sanitizeItem` and `maxItems` and
   * `maxTotalLength` leave room for it. `onChange` is not called for it, and the add input keeps its text. With `required`,
   * a valid draft also satisfies the rule. Off by default: the draft is then only added by the add button, Enter or
   * `commitDraft()`.
   */
  includeDraft?: boolean;
  /** Placeholder of the add input. */
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Content next to the label, such as a `Badge`. */
  badge?: ReactNode;
  disabled?: boolean;
  /** Text read after the label when `required`. Aria-only: the visible mark is a glyph. Defaults to the `required` label of `LufiaProvider`. */
  requiredLabel?: string;
  /** Imperative handle: `commitDraft()`. */
  ref?: Ref<ListFieldHandle>;
};

type Row = { id: number; text: string; leaving?: boolean; added?: boolean };

let rowCounter = 0;
const newRow = (text: string, added = false): Row => ({ id: ++rowCounter, text, added: added || undefined });

const joinLines = (items: readonly string[]) => items.join("\n");

function sameList(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((text, index) => text === b[index]);
}

/**
 * A field that holds a list of short text entries: one text input per entry, editable in place, an add row (Enter adds and
 * never submits the surrounding form) and a remove button on each entry. The entries are submitted as one hidden text value
 * under `name`, serialized with `serialize`.
 *
 * It carries its own label, hint and error, like `RadioGroup`, so do not wrap it in a `FormField`. Pending text in the add
 * input is not part of the value until it is added, unless `includeDraft` is on: otherwise call `commitDraft()` on the ref
 * right before submitting.
 */
export function ListField({
  label,
  labels,
  name,
  items: itemsProp,
  defaultItems,
  onChange,
  serialize = joinLines,
  sanitizeItem,
  maxItems = 30,
  itemMaxLength,
  maxTotalLength,
  required,
  includeDraft,
  placeholder,
  hint,
  error,
  badge,
  disabled,
  requiredLabel: requiredLabelProp,
  className,
  id,
  ref,
  ...rest
}: ListFieldProps) {
  const generated = useId();
  const { labels: providerLabels } = useLufia();
  const requiredLabel = requiredLabelProp ?? providerLabels.required;
  const baseId = id ?? `listfield-${generated.replace(/:/g, "")}`;
  const labelId = `${baseId}-label`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const root = useRef<HTMLDivElement>(null);
  const addInput = useRef<HTMLInputElement>(null);

  const clean = (text: string) => (sanitizeItem ? sanitizeItem(text) : text);
  const read = (list: readonly Row[]) =>
    list
      .filter((row) => !row.leaving)
      .map((row) => clean(row.text))
      .filter(Boolean);

  const [rows, setRows] = useState<Row[]>(() =>
    (itemsProp ?? defaultItems ?? []).map((text) => newRow(text)),
  );
  const rowsRef = useRef(rows);
  // The raw text of the add input, kept only for `includeDraft`: the input itself stays uncontrolled.
  const [draft, setDraft] = useState("");
  const items = read(rows);

  // A controlled value that differs from what the rows hold replaces them, keeping the row of the same position so a
  // focused input survives a parent that echoes a changed entry.
  if (itemsProp !== undefined && !sameList(itemsProp, items)) {
    const live = rows.filter((row) => !row.leaving);
    setRows(itemsProp.map((text, index) => (live[index] ? { ...live[index], text } : newRow(text))));
  }
  useEffect(() => {
    rowsRef.current = rows;
  });

  const apply = (next: Row[]) => {
    rowsRef.current = next;
    setRows(next);
    onChange?.(read(next));
  };

  useFormReset(root, () => {
    setDraft("");
    apply((defaultItems ?? []).map((text) => newRow(text)));
  });

  // Room left in the serialized value for one more entry, counting the separator it brings.
  const room = maxTotalLength === undefined ? Infinity : maxTotalLength - serialize([...items, ""]).length;
  const full = items.length >= maxItems || room <= 0;
  const addMaxLength = full ? 0 : Math.min(itemMaxLength ?? Infinity, room);
  const entryRoom = (row: Row) =>
    maxTotalLength === undefined
      ? itemMaxLength
      : Math.min(itemMaxLength ?? Infinity, row.text.length + Math.max(0, room));
  // The draft as the add button would add it, or "" when it is empty or no room is left for it.
  const draftText = includeDraft && !full ? clean(draft) : "";
  const draftEntry =
    draftText && (maxTotalLength === undefined || serialize([...items, draftText]).length <= maxTotalLength)
      ? draftText
      : "";
  const needsEntry = Boolean(required) && !disabled && items.length === 0 && !draftEntry;

  const message = needsEntry ? (labels.requiredMessage ?? "") : "";
  useEffect(() => {
    addInput.current?.setCustomValidity(message);
  }, [message]);

  const commit = (): boolean => {
    const input = addInput.current;
    const text = clean(input?.value ?? "");
    if (!input || !text) return false;
    const current = read(rowsRef.current);
    if (current.length >= maxItems) return false;
    if (maxTotalLength !== undefined && serialize([...current, text]).length > maxTotalLength) return false;
    input.value = "";
    setDraft("");
    apply([...rowsRef.current, newRow(text, true)]);
    return true;
  };

  useImperativeHandle(ref, () => ({
    commitDraft: () => {
      let added = false;
      flushSync(() => {
        added = commit();
      });
      return added;
    },
  }));

  const edit = (row: Row, text: string) =>
    apply(rowsRef.current.map((other) => (other.id === row.id ? { ...other, text } : other)));

  const remove = (row: Row, moveFocus = true) => {
    apply(rowsRef.current.map((other) => (other.id === row.id ? { ...other, leaving: true } : other)));
    // The removed entry took the focus with it; a blur that removes it has already moved on, so it is left alone.
    if (moveFocus) addInput.current?.focus();
  };

  const settle = (row: Row) => {
    // Leaving an entry empty removes it; anything else is cleaned up in place.
    if (!clean(row.text)) remove(row, false);
    else if (clean(row.text) !== row.text) edit(row, clean(row.text));
  };

  const addKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Enter in this field never submits the form, composing text or not.
    event.preventDefault();
    if (!event.nativeEvent.isComposing) commit();
  };

  const entryKey = (event: KeyboardEvent<HTMLInputElement>, row: Row) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (event.nativeEvent.isComposing) return;
    settle(row);
    addInput.current?.focus();
  };

  // The number of each entry among the ones that stay, for its accessible names. A leaving row is inert.
  const positions = rows.map((_, at) => rows.slice(0, at + 1).filter((other) => !other.leaving).length);
  return (
    <div
      ref={root}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-invalid={error ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <div className={styles.header}>
        <label id={labelId} htmlFor={`${baseId}-add`} className={styles.label}>
          {label}
          {required ? (
            <>
              <span className={styles.mark} aria-hidden="true">
                *
              </span>
              <VisuallyHidden> ({requiredLabel})</VisuallyHidden>
            </>
          ) : null}
        </label>
        {badge}
      </div>
      <div
        {...rest}
        id={baseId}
        role="group"
        aria-labelledby={labelId}
        aria-describedby={[rest["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={styles.group}
      >
        {rows.length ? (
          <ul className={styles.list}>
            {rows.map((row, at) => {
              const index = positions[at]!;
              return (
                <li key={row.id} className={styles.item} inert={row.leaving || undefined}>
                  <Reveal
                    show={!row.leaving}
                    variant="rise"
                    appear={row.added}
                    className={styles.row}
                    onExited={() => {
                      const next = rowsRef.current.filter((other) => other.id !== row.id);
                      rowsRef.current = next;
                      setRows(next);
                    }}
                  >
                    <TextInput
                      className={styles.entry}
                      value={row.text}
                      aria-label={labels.entry(index)}
                      maxLength={entryRoom(row)}
                      disabled={disabled}
                      invalid={Boolean(error)}
                      autoComplete="off"
                      onChange={(event) => edit(row, event.target.value)}
                      onBlur={() => settle(row)}
                      onKeyDown={(event) => entryKey(event, row)}
                    />
                    <IconButton
                      type="button"
                      aria-label={labels.remove(index, row.text)}
                      icon={<TrashIcon size="sm" />}
                      size="sm"
                      disabled={disabled}
                      onClick={() => remove(row)}
                    />
                  </Reveal>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className={styles.row}>
          <TextInput
            ref={addInput}
            id={`${baseId}-add`}
            className={styles.entry}
            placeholder={placeholder}
            maxLength={addMaxLength}
            required={needsEntry}
            disabled={disabled}
            invalid={Boolean(error)}
            autoComplete="off"
            enterKeyHint="enter"
            onChange={includeDraft ? (event) => setDraft(event.target.value) : undefined}
            onKeyDown={addKey}
          />
          <Button
            type="button"
            variant="secondary"
            iconStart={<PlusIcon size="sm" />}
            disabled={disabled || full}
            onClick={() => {
              commit();
              addInput.current?.focus();
            }}
          >
            {labels.add}
          </Button>
        </div>
      </div>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={serialize(draftEntry ? [...items, draftEntry] : items)}
          disabled={disabled}
        />
      ) : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
