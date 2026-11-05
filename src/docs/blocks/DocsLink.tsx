import type { MouseEvent, ReactNode } from "react";
import { addons } from "storybook/preview-api";

type DocsLinkProps = {
  /** Storybook story or docs id, for example `components-emptystate--docs`. */
  to: string;
  className?: string;
  children: ReactNode;
};

/**
 * Link to another docs page. Inside the Storybook preview iframe a plain anchor would load the iframe itself, so the
 * click asks the manager to navigate; without script the `href` still reaches the right page in the top window.
 */
export function DocsLink({ to, className, children }: DocsLinkProps) {
  const path = to.includes("--") ? `/docs/${to}` : `/docs/${to}--docs`;
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    event.preventDefault();
    addons.getChannel().emit("navigateUrl", path);
  };
  return (
    <a className={className} href={`./?path=${path}`} target="_top" onClick={onClick}>
      {children}
    </a>
  );
}
