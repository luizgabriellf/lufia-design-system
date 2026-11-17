"use client";

import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { Button, type ButtonVariant } from "../Button";
import styles from "./OneWayDisclosure.module.css";

export type OneWayDisclosureProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The label of the button that reveals the content ("Fill in now"). It is the control's name. */
  trigger: ReactNode;
  /** The content that is revealed. */
  children: ReactNode;
  /** Controlled state. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Initial state when `open` is not given. Start open to render the content with no button. */
  defaultOpen?: boolean;
  /** Called with `true` when the person activates the button. The component never closes itself. */
  onOpenChange?: (open: boolean) => void;
  /** Look of the button. Defaults to `"secondary"`. */
  variant?: ButtonVariant;
  /**
   * Accessible name of the revealed content. When given, the content is exposed as a `region` landmark with this name,
   * which is also what a screen reader announces when focus moves into it. Leave it out for content that is not a
   * landmark.
   */
  label?: string;
  /** Class for the revealed content wrapper. */
  panelClassName?: string;
};

/**
 * A button that reveals a region and leaves once it has. It is a disclosure whose trigger is spent: use it for an
 * invitation such as "Fill in now" that opens a form in place, where a button that stayed behind and could fold the
 * content away again would only be noise.
 *
 * The button carries `aria-expanded` and `aria-controls`. On activation the content is shown, the button is hidden and
 * focus moves to the content, so a keyboard or screen reader user is not left on a control that disappeared. Focus moves
 * only for an activation by the person, never on first render. State is uncontrolled (`defaultOpen`) or controlled
 * (`open` with `onOpenChange`, which lets the app also close it again; the button comes back).
 */
export function OneWayDisclosure({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  variant = "secondary",
  label,
  className,
  panelClassName,
  id,
  ...rest
}: OneWayDisclosureProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const panelId = `${baseId}-panel`;
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const panel = useRef<HTMLDivElement>(null);
  // Set by an activation, consumed when the content has been shown: only the person's own action moves focus.
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!isOpen || !moveFocus.current) return;
    moveFocus.current = false;
    panel.current?.focus();
  }, [isOpen]);

  return (
    <div
      {...rest}
      id={id}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-open={isOpen || undefined}
    >
      <Button
        type="button"
        variant={variant}
        className={styles.trigger}
        hidden={isOpen}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => {
          moveFocus.current = true;
          if (open === undefined) setInner(true);
          onOpenChange?.(true);
        }}
      >
        {trigger}
      </Button>
      <div
        ref={panel}
        id={panelId}
        role={label ? "region" : undefined}
        aria-label={label}
        tabIndex={-1}
        hidden={!isOpen}
        className={[styles.panel, panelClassName].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
