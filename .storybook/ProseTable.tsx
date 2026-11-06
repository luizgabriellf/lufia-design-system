import { useEffect, useRef, useState, type ComponentProps } from "react";

/** The text of the heading a table sits under, so a scroll region can be named after what it holds. */
function headingBefore(element: HTMLElement): string {
  let node: Element | null = element;
  while (node && !node.classList.contains("sbdocs-content")) {
    let sibling = node.previousElementSibling;
    while (sibling) {
      if (/^H[1-6]$/.test(sibling.tagName)) return sibling.textContent?.trim() ?? "";
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
  }
  return "";
}

/**
 * Replaces the `table` of every docs page. A wide table scrolls inside this frame instead of widening the page. Only
 * while it actually overflows is the frame a focusable region, with a name of its own, so keyboard users can scroll it
 * (WCAG 2.1.1) without every table adding a tab stop and a duplicate landmark.
 */
export function ProseTable(props: ComponentProps<"table">) {
  const frame = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      if (element.scrollWidth <= element.clientWidth) return setName(null);
      const caption = element.querySelector("caption")?.textContent?.trim();
      const base = caption || headingBefore(element) || "Data";
      // Several tables can sit under one heading, so the position in the page keeps each name unique.
      const all = [
        ...(element.ownerDocument.querySelectorAll(".lufia-prose-table") as NodeListOf<HTMLElement>),
      ];
      setName(`${base} table ${all.indexOf(element) + 1}, scrollable`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const table = element.querySelector("table");
    if (table) observer.observe(table);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className="lufia-prose-table"
      {...(name ? { role: "region", "aria-label": name, tabIndex: 0 } : {})}
    >
      <table {...props} />
    </div>
  );
}
