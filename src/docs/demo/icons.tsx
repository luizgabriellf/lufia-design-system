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

export const HomeIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Frame>
);

export const GridIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </Frame>
);

export const UsersIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5" />
  </Frame>
);

export const ChartIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 4v15a1 1 0 0 0 1 1h15M9 16v-5M14 16V8M19 16v-3" />
  </Frame>
);

export const InboxIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M4 13l2 6h12l2-6M4 13h5a3 3 0 0 0 6 0h5" />
  </Frame>
);

export const SettingsIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Frame>
);

export const MenuIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Frame>
);

export const HelpIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01" />
  </Frame>
);

export const ChevronRightIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="m9 6 6 6-6 6" />
  </Frame>
);

export const CodeIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />
  </Frame>
);

export const BookIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H20v14H5.5A1.5 1.5 0 0 0 4 19.5z" />
    <path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3M9 8h7" />
  </Frame>
);

export const CrossIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Frame>
);

export const ExternalIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Frame>
);

export const LayersIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" />
  </Frame>
);

export const KeyboardIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
  </Frame>
);

export const PaletteIcon = (props: DemoIconProps) => (
  <Frame {...props}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.5-1.8-.4-1.3.3-2.2 1.5-2.2H17a4 4 0 0 0 4-4c0-5-4-10-9-10z" />
    <path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01" />
  </Frame>
);
