"use client";

import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
} from "react";
import { usePrefersReducedMotion } from "../usePrefersReducedMotion";
import styles from "./Stagger.module.css";

const MAX_LIMIT = 8;

export type StaggerProps = HTMLAttributes<HTMLElement> & {
  /**
   * The element the group renders as. `"div"` (default), or `"ul"` / `"ol"` so the group is a real list: pass `li` elements
   * as children and they are the direct children of the list, with no wrapper in between. `"dl"` makes it a description
   * list: pass `div` elements that each wrap a `dt` and its `dd`, the grouping HTML allows inside a `dl`.
   */
  as?: "div" | "ul" | "ol" | "dl";
  /** The root element, for measuring it or observing its size. */
  ref?: Ref<HTMLElement>;
  /**
   * How many children get their own step. Children after the limit enter together with the last one, so the whole
   * sequence is at most `limit - 1` steps long (about 120 ms of delay at the default). Defaults to 5, and values above 8
   * are treated as 8, so the total delay stays short whatever is passed.
   */
  limit?: number;
};

/**
 * Children that enter in sequence on mount: each fades in and rises a few pixels, one step after the previous.
 *
 * With `as="ul"` or `as="ol"` it is a semantic list; the children should then be `li` elements. With `as="dl"` the
 * children should be `div` groups of `dt` and `dd`.
 *
 * Only the children that are React elements take part (text nodes and Fragments are left as they are: a Fragment has no element to style, so wrap its children in an element). It is CSS: animations play when
 * a node is created, so a re-render never replays them, and only `opacity` and `transform` move, so the layout is final
 * from the first frame and nothing shifts. Under `prefers-reduced-motion` the children are simply there. Children added
 * later enter on their own, with the step they are given at that moment.
 */
export function Stagger({ as: Tag = "div", limit = 5, className, children, ref, ...rest }: StaggerProps) {
  const reduced = usePrefersReducedMotion();
  const last = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit) || 1)) - 1;
  let index = 0;
  const steps = Children.map(children, (child) => {
    if (!isValidElement<{ style?: CSSProperties }>(child) || child.type === Fragment) return child;
    const step = Math.min(index++, last);
    return cloneElement(child, {
      style: { ...child.props.style, "--stagger-index": step } as CSSProperties,
    });
  });
  return (
    <Tag
      {...rest}
      ref={ref as Ref<never>}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-reduced={reduced ? "" : undefined}
    >
      {steps}
    </Tag>
  );
}
