import type { SVGProps } from "react";

function Frame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export const SearchGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Frame {...props}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </Frame>
);

export const MenuGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Frame {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Frame>
);

export const CloseGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Frame {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Frame>
);

export const ChevronGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Frame {...props}>
    <path d="m9 6 6 6-6 6" />
  </Frame>
);

/** Two chevrons pointing at a rail; mirrored in CSS for right-to-left and when the rail is open. */
export const SidebarGlyph = (props: SVGProps<SVGSVGElement>) => (
  <Frame {...props}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M9.5 4.5v15" />
  </Frame>
);
