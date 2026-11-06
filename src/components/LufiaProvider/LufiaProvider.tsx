"use client";

import {
  createContext,
  useContext,
  useMemo,
  type AnchorHTMLAttributes,
  type ComponentType,
  type Ref,
  type ReactNode,
} from "react";

export type LinkComponentProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** React 19 passes `ref` as a prop; a link component should forward it to the anchor. */
  ref?: Ref<HTMLAnchorElement>;
};

/** Anything that renders an anchor from `href`: a router link (Next, React Router, Remix) or a plain `<a>`. */
export type LinkComponent = ComponentType<LinkComponentProps>;

/**
 * Text that only assistive technology reads. Visible copy never lives here: it arrives through each component's props.
 * Every key has a neutral English default, so a missing provider is harmless; override them for the app's language.
 */
export type LufiaLabels = {
  /** Accessible name of the close button of a dialog. */
  close: string;
  /** Accessible name of the dismiss button of a notification. */
  dismiss: string;
  /** Accessible name of the region that holds notifications. */
  notifications: string;
};

export const DEFAULT_LABELS: LufiaLabels = {
  close: "Close",
  dismiss: "Dismiss",
  notifications: "Notifications",
};

const DefaultLink: LinkComponent = ({ children, ...rest }) => <a {...rest}>{children}</a>;

export type LufiaContextValue = {
  linkComponent: LinkComponent;
  labels: LufiaLabels;
};

const DEFAULT_CONTEXT: LufiaContextValue = { linkComponent: DefaultLink, labels: DEFAULT_LABELS };

const LufiaContext = createContext<LufiaContextValue>(DEFAULT_CONTEXT);

export type LufiaProviderProps = {
  /** Renders every navigating element of the package. Defaults to a plain `<a>`. */
  linkComponent?: LinkComponent;
  /** Aria-only text, merged over the defaults (and over an outer provider). */
  labels?: Partial<LufiaLabels>;
  children: ReactNode;
};

/**
 * Configures the package once, near the root of the app: the link component that navigates (so a router's client-side
 * transitions work) and the aria-only labels. Components work without it; it is the single place an app adapts them.
 */
export function LufiaProvider({ linkComponent, labels, children }: LufiaProviderProps) {
  const parent = useContext(LufiaContext);
  const value = useMemo<LufiaContextValue>(
    () => ({
      linkComponent: linkComponent ?? parent.linkComponent,
      labels: { ...parent.labels, ...labels },
    }),
    [linkComponent, labels, parent],
  );
  return <LufiaContext.Provider value={value}>{children}</LufiaContext.Provider>;
}

/** The link component and labels in effect. Safe outside a provider: it returns the defaults. */
export function useLufia(): LufiaContextValue {
  return useContext(LufiaContext);
}

/** An anchor rendered through the configured `linkComponent`. */
export function LufiaLink(props: LinkComponentProps) {
  const { linkComponent: Link } = useLufia();
  return <Link {...props} />;
}
