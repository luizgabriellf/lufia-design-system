"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { useFormFieldControl } from "../FormField";
import { useFormReset } from "../FormField/useFormReset";
import fieldStyles from "../FormField/fieldControl.module.css";
import { VisuallyHidden } from "../VisuallyHidden";
import styles from "./Textarea.module.css";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  /** Marks the control invalid without a `FormField`. Inside a field the error does it. */
  invalid?: boolean;
  /** Shows a character count under the box. With `maxLength` it reads "12 / 200". */
  showCount?: boolean;
  /** Text of the count. Defaults to `12 / 200` with a limit and `12` without. Pass it to localise or reword. */
  formatCount?: (length: number, max: number | undefined) => ReactNode;
  /** Text read out when the person is close to the limit (the last tenth) or over it. Aria-only. */
  formatCountAnnouncement?: (length: number, max: number) => string;
  /**
   * Grows the box with its content instead of scrolling. `rows` is the minimum height and `maxRows` the optional
   * maximum, after which the box scrolls. Uses CSS `field-sizing: content` where the browser has it and measures the
   * content in script where it does not. The manual resize handle is removed. Works controlled and uncontrolled.
   */
  autoSize?: boolean;
  /** With `autoSize`, the number of rows after which the box stops growing and scrolls. Never below `rows`. Unset means no limit. */
  maxRows?: number;
  /** Goes on the box that draws the border; the native textarea gets the rest props. */
  className?: string;
  /** Goes on the root element that wraps the box and the count. Use it to size the field in a row or grid. */
  rootClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
};

const NEAR_LIMIT = 0.9;

const supportsFieldSizing = () =>
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("field-sizing", "content");

/**
 * The script fallback of `autoSize`, for browsers without `field-sizing`: the height follows the content (`scrollHeight`
 * of the box with its height released), and the CSS minimum and maximum rows clamp it. One forced layout per call: the
 * height is released, read, then written back in the same task, so nothing is painted in between.
 */
function fitHeight(node: HTMLTextAreaElement) {
  node.style.blockSize = "auto";
  node.style.blockSize = `${node.scrollHeight}px`;
}

const defaultCount = (length: number, max: number | undefined) =>
  max === undefined ? `${length}` : `${length} / ${max}`;
const defaultAnnouncement = (length: number, max: number) => `${length} of ${max} characters`;

/**
 * A multi-line text control with an optional character count. The count is part of the control's description. It is
 * announced only close to the limit, so it does not read out on every keystroke. Inside a `FormField` the field's ids and
 * states apply.
 */
export function Textarea({
  invalid,
  showCount,
  formatCount = defaultCount,
  formatCountAnnouncement = defaultAnnouncement,
  className,
  rootClassName,
  readOnly,
  rows = 4,
  autoSize = false,
  maxRows,
  style,
  ref,
  onChange,
  ...rest
}: TextareaProps) {
  const countId = useId();
  const [inner, setInner] = useState(() => String(rest.value ?? rest.defaultValue ?? "").length);
  const area = useRef<HTMLTextAreaElement | null>(null);
  // Runs after every render and on input, reset and width changes; a no-op unless the script fallback is in play.
  const fit = useCallback(() => {
    const node = area.current;
    if (autoSize && node && !supportsFieldSizing()) fitHeight(node);
  }, [autoSize]);
  // The browser restores the text of an uncontrolled textarea on reset; the count has to follow it.
  useFormReset(area, () => {
    setInner(String(rest.defaultValue ?? "").length);
    // The browser restores the text after the reset event, so measure once this task has finished.
    setTimeout(fit, 0);
  });
  // Stable, so a caller's callback ref is not called with null and the node again on every render.
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      area.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  useLayoutEffect(() => {
    const node = area.current;
    if (!node) return;
    if (!autoSize || supportsFieldSizing()) {
      node.style.removeProperty("block-size");
      return;
    }
    fit();
    // A change of width re-wraps the text. Only the width is compared: setting the height fires the observer too.
    if (typeof ResizeObserver === "undefined") return;
    let width = node.clientWidth;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === width) return;
      width = node.clientWidth;
      fit();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoSize, fit]);
  useLayoutEffect(fit, [fit, rest.value, rows, maxRows]);
  const length = rest.value !== undefined ? String(rest.value).length : inner;
  const max = rest.maxLength;
  const counterId = showCount ? `counter-${countId.replace(/:/g, "")}` : undefined;
  const control = useFormFieldControl({
    id: rest.id,
    "aria-describedby": [rest["aria-describedby"], counterId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": invalid ? true : rest["aria-invalid"],
    required: rest.required,
    readOnly,
    disabled: rest.disabled,
  });
  const autoSizeStyle = autoSize
    ? ({
        ...style,
        "--textarea-rows": rows,
        ...(maxRows !== undefined ? { "--textarea-max-rows": Math.max(maxRows, rows) } : null),
      } as CSSProperties)
    : style;
  const near = max !== undefined && length >= max * NEAR_LIMIT;

  return (
    <div className={[styles.root, rootClassName].filter(Boolean).join(" ")}>
      <span
        className={[fieldStyles.box, styles.box, className].filter(Boolean).join(" ")}
        data-invalid={control["aria-invalid"] ? "" : undefined}
        data-disabled={control.disabled ? "" : undefined}
        data-readonly={readOnly ? "" : undefined}
        data-autosize={autoSize ? "" : undefined}
        data-max-rows={autoSize && maxRows !== undefined ? "" : undefined}
      >
        <textarea
          {...rest}
          {...control}
          ref={setRefs}
          rows={rows}
          readOnly={readOnly}
          style={autoSizeStyle}
          className={[fieldStyles.native, styles.native].join(" ")}
          onChange={(event) => {
            setInner(event.target.value.length);
            fit();
            onChange?.(event);
          }}
        />
      </span>
      {showCount ? (
        <>
          <p id={counterId} className={styles.count} data-near={near ? "" : undefined}>
            {formatCount(length, max)}
          </p>
          <VisuallyHidden role="status">
            {near && max !== undefined ? formatCountAnnouncement(length, max) : ""}
          </VisuallyHidden>
        </>
      ) : null}
    </div>
  );
}
