"use client";

import { createContext } from "react";

/**
 * How the panel's actions run. A host (the popover or sheet of `NotificationCenter`) closes itself first and then runs the
 * action, so focus is back on the bell when a dialog opens from it. On its own the panel just runs the action.
 */
export const NotificationActionContext = createContext<(run: () => void) => void>((run) => run());
