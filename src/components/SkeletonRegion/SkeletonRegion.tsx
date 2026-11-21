import type { HTMLAttributes, ReactNode } from "react";
import { VisuallyHidden } from "../VisuallyHidden";

export type SkeletonRegionProps = HTMLAttributes<HTMLDivElement> & {
  /** What is loading, for example "Loading invoices". Read by assistive technology, never drawn. */
  label: ReactNode;
  /** The placeholders: `Skeleton`, `SkeletonTable`, `SkeletonCard`, `SkeletonPageHeader` or a shape of your own. */
  children?: ReactNode;
};

/**
 * The one named part of a loading shape. It marks its content busy and announces `label` once from a polite status,
 * so the decorative placeholders inside it can stay hidden from assistive technology. Render it while the content
 * loads and replace it with the content.
 */
export function SkeletonRegion({ label, children, ...rest }: SkeletonRegionProps) {
  return (
    <div {...rest} aria-busy="true">
      <VisuallyHidden role="status">{label}</VisuallyHidden>
      {children}
    </div>
  );
}
