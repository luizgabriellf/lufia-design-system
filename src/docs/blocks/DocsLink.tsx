import type { MouseEvent, ReactNode } from "react";
import { SELECT_STORY } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

type DocsLinkProps = {
  /** Storybook story or docs id, for example `components-emptystate--docs`. */
  to: string;
  className?: string;
  children: ReactNode;
};

/**
 * Link to another docs page. Inside the Storybook preview iframe a plain anchor would load the iframe itself, so the
 * click asks the manager to select the entry; without script the `href` still reaches the right page in the top window.
 * The manager's `navigateUrl` event is not used: it navigates to a plain URL, which drops the `/<repo>/` base path
 * that GitHub Pages serves the site under and lands on a 404.
 */
export function DocsLink({ to, className, children }: DocsLinkProps) {
  const id = to.includes("--") ? to : `${to}--docs`;
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    event.preventDefault();
    addons.getChannel().emit(SELECT_STORY, { storyId: id, viewMode: "docs" });
  };
  return (
    <a className={className} href={`./?path=/docs/${id}`} target="_top" onClick={onClick}>
      {children}
    </a>
  );
}
