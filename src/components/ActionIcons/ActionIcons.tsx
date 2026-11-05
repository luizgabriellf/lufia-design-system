import type { ReactNode, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children"> & {
  /** Rendered width and height in px. */
  size?: number;
};

type BaseProps = IconProps & { children: ReactNode };

/**
 * Shared 16x16 / 1.4 stroke / round-cap frame. Decorative by default (`aria-hidden`);
 * passing `aria-label` makes the icon meaningful (`role="img"`).
 */
function Icon({ size = 13, children, "aria-label": ariaLabel, ...rest }: BaseProps) {
  const meaningful = typeof ariaLabel === "string" && ariaLabel.length > 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      role={meaningful ? "img" : undefined}
      aria-label={meaningful ? ariaLabel : undefined}
      aria-hidden={meaningful ? undefined : true}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

const STROKE = { stroke: "currentColor", strokeWidth: 1.4 } as const;

export function DeleteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M2.5 4.5h11M6 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M6.5 7.5v4M9.5 7.5v4M3.5 4.5l.6 8a1 1 0 001 .9h5.8a1 1 0 001-.9l.6-8"
        {...STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11.5 2.5l2 2L6 12l-3 1 1-3 7.5-7.5z" {...STROKE} strokeLinejoin="round" />
    </Icon>
  );
}

export function DuplicateIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.3" {...STROKE} />
      <path
        d="M10.5 5.5V3.8a1.3 1.3 0 00-1.3-1.3H3.8a1.3 1.3 0 00-1.3 1.3v5.4a1.3 1.3 0 001.3 1.3h1.7"
        {...STROKE}
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function PendingIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.8" {...STROKE} />
      <path d="M8 4.8V8l2.4 1.4" {...STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function OpenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12.5 8A4.5 4.5 0 114.9 5.1M4.9 5.1V2.6M4.9 5.1H7.4"
        {...STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function ReportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M4 2.5h5.5L12 5v8.5a1 1 0 01-1 1H4a1 1 0 01-1-1v-10a1 1 0 011-1z"
        {...STROKE}
        strokeLinejoin="round"
      />
      <path d="M5.5 8h5M5.5 10.5h5" {...STROKE} strokeLinecap="round" />
    </Icon>
  );
}

export const ACTION_ICONS = {
  DeleteIcon,
  EditIcon,
  DuplicateIcon,
  PendingIcon,
  OpenIcon,
  ReportIcon,
} as const;
