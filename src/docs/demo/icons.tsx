/*
 * Docs-only icons. Geometry adapted from Lucide (https://lucide.dev), ISC License; see THIRD_PARTY_NOTICES.md.
 *
 * The common ones come from the package's icon set. The rest are made with `createIcon`, exactly as a consuming app makes
 * its own domain icons: same 24-unit grid, stroke and accessibility rules as the set.
 */
import { createIcon } from "../../components/Icon/Icon";

export {
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon as CrossIcon,
  ExternalLinkIcon as ExternalIcon,
  FileTextIcon as DocumentIcon,
  GridIcon,
  HelpIcon,
  HomeIcon,
  InboxIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UploadIcon,
  UsersIcon,
} from "../../components/Icon/icons";

export const SlidersIcon = /* @__PURE__ */ createIcon(
  "sliders",
  <>
    <line />
    <line />
    <line />
    <line />
    <line />
    <line />
    <line />
    <line />
    <line />
  </>,
);

export const ShieldIcon = /* @__PURE__ */ createIcon(
  "shield",
  <>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </>,
);

export const WaveIcon = /* @__PURE__ */ createIcon(
  "wave",
  <>
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  </>,
);

export const ServerIcon = /* @__PURE__ */ createIcon(
  "server",
  <>
    <rect width="20" height="8" x="2" y="2" rx="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <line />
    <line />
  </>,
);

export const CodeIcon = /* @__PURE__ */ createIcon(
  "code",
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>,
);

export const BookIcon = /* @__PURE__ */ createIcon(
  "book",
  <>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
  </>,
);

export const LayersIcon = /* @__PURE__ */ createIcon(
  "layers",
  <>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </>,
);

export const KeyboardIcon = /* @__PURE__ */ createIcon(
  "keyboard",
  <>
    <path d="M10 8h.01" />
    <path d="M12 12h.01" />
    <path d="M14 8h.01" />
    <path d="M16 12h.01" />
    <path d="M18 8h.01" />
    <path d="M6 8h.01" />
    <path d="M7 16h10" />
    <path d="M8 12h.01" />
    <rect width="20" height="16" x="2" y="4" rx="2" />
  </>,
);

export const PaletteIcon = /* @__PURE__ */ createIcon(
  "palette",
  <>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </>,
);

export const GitHubIcon = /* @__PURE__ */ createIcon(
  "github",
  <>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </>,
);
