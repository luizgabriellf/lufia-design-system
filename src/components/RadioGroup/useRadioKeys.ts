"use client";

import type { KeyboardEvent } from "react";

export type RadioKeyItem = { value: string; disabled?: boolean };

/**
 * Roving focus for a radio group (WAI-ARIA APG Radio Group): one radio is in the tab order, the arrow keys move focus and
 * the choice together, wrapping at the ends and skipping disabled radios. Left and Right swap in right-to-left layouts.
 * Each radio carries `data-radio-index` (its index in `items`). Internal: shared by `RadioGroup` and `SegmentedToggle`.
 */
export function useRadioKeys(
  items: readonly RadioKeyItem[],
  current: string | undefined,
  select: (value: string) => void,
) {
  const enabled = items.filter((item) => !item.disabled);
  // Exactly one radio is tabbable: the chosen one, or the first enabled when nothing is chosen.
  const tabbable = enabled.some((item) => item.value === current) ? current : enabled[0]?.value;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key) || enabled.length === 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const focused = (event.target as HTMLElement).closest<HTMLElement>("[data-radio-index]");
    const from = focused ? items[Number(focused.dataset.radioIndex)] : undefined;
    const at = enabled.findIndex((item) => item.value === (from?.value ?? current));
    const next = enabled[(at + (forward ? 1 : -1) + enabled.length) % enabled.length];
    if (!next) return;
    event.preventDefault();
    select(next.value);
    event.currentTarget.querySelector<HTMLElement>(`[data-radio-index="${items.indexOf(next)}"]`)?.focus();
  };

  return { tabbable, onKeyDown };
}
