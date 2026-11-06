"use client";

import { useState } from "react";

export type StepDirection = "next" | "back";

/**
 * Which way a multi-step flow just moved: `"next"` when `step` increased, `"back"` when it decreased, `undefined` until the
 * first change (so opening a wizard never plays a slide) and again once the flow is no longer `active`. Render it as
 * `data-step-direction` on the step container and let CSS slide the new step in from that side: forward comes from the
 * right, back from the left.
 */
export function useStepDirection(step: number, active = true): StepDirection | undefined {
  const [previous, setPrevious] = useState(step);
  const [direction, setDirection] = useState<StepDirection>();
  if (previous !== step) {
    setPrevious(step);
    setDirection(step > previous ? "next" : "back");
  }
  if (!active && direction) setDirection(undefined);
  return direction;
}
