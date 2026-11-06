import type { ReactNode, SVGProps } from "react";

type DemoIconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children"> & {
  /** Rendered width and height in px. */
  size?: number;
};

/** Docs-only 24x24 / 1.6 stroke frame. Decorative: the label belongs on the control that holds the icon. */
function Frame({ size = 20, children, ...rest }: DemoIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const DocumentIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Frame>
);

export const SearchIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </Frame>
);

export const PlusIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M12 5v14M5 12h14" />
  </Frame>
);

export const UploadIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </Frame>
);

export const ArrowRightIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M5 12h14m0 0-5-5m5 5-5 5" />
  </Frame>
);

export const CheckIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Frame>
);

export const GitHubIcon = ({ size = 20, ...rest }: DemoIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

export const SlidersIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Frame>
);

export const ShieldIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M12 3 5 6v5.5c0 4.2 2.8 7.6 7 9.5 4.2-1.9 7-5.3 7-9.5V6z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Frame>
);

export const WaveIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M3 12c2.5-6 4.5-6 6 0s3.5 6 6 0 3.5-6 6 0" />
  </Frame>
);

export const ServerIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <rect x="4" y="4" width="16" height="6" rx="1.5" />
    <rect x="4" y="14" width="16" height="6" rx="1.5" />
    <path d="M8 7h.01M8 17h.01" />
  </Frame>
);
