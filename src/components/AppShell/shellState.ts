// A pure module: no React, no DOM, no "use client". Server Components, route handlers and middleware import it from
// `@lufia/design-system/app-shell-state` to read the cookie before the first paint. Keep it free of imports.

export type ShellState = {
  /** The sidebar is a rail. */
  collapsed: boolean;
  /** Keys of the open collapsible groups; `undefined` when the person never chose, so the defaults apply. */
  openGroups: readonly string[] | undefined;
};

/**
 * Turns the person's sidebar choices into a short cookie value (`c=1&g=insights&g=admin`), for the app to store. The
 * package never stores anything itself; see "Remembering the rail and the groups" in the docs. Pass `openGroups` as
 * `undefined` to leave the groups to their defaults.
 */
export function serializeShellState(state: ShellState): string {
  const params = new URLSearchParams();
  params.set("c", state.collapsed ? "1" : "0");
  for (const key of state.openGroups ?? []) params.append("g", key);
  if (state.openGroups) params.set("s", "1");
  return params.toString();
}

/**
 * Reads what `serializeShellState` wrote, on the server (from the request's cookie) or in the browser, and returns the
 * values to hand to `defaultCollapsed` and `defaultOpenGroups` so the first paint is already right. A missing or
 * malformed value gives the defaults: expanded, groups undecided. Safe in a React Server Component: import it from
 * `@lufia/design-system/app-shell-state`.
 */
export function parseShellState(raw: string | null | undefined): ShellState {
  const params = new URLSearchParams(raw ?? "");
  return {
    collapsed: params.get("c") === "1",
    openGroups: params.get("s") === "1" ? params.getAll("g") : undefined,
  };
}
