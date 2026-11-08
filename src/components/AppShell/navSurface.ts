import { createContext, useContext } from "react";

/** What the sidebar items need to know about the surface they sit in. */
export type NavSurface = {
  /** The sidebar is a rail: icons only, labels kept for assistive technology. */
  collapsed: boolean;
  /** Where the parts are drawn: the desktop sidebar or the phone sheet. */
  surface: "sidebar" | "sheet";
};

// Kept apart from `navigation.ts` so the data helpers there stay free of React context (and safe to import on the server).
export const NavSurfaceContext = createContext<NavSurface>({ collapsed: false, surface: "sidebar" });

export function useNavSurface(): NavSurface {
  return useContext(NavSurfaceContext);
}
