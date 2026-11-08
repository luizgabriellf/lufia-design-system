# Icon

> The icon set: named stroke icons on one 24-unit grid, the Icon primitive and createIcon for an app's own glyphs.

- Status: beta
- Category: Utilities
- Import: `import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BellIcon, CalendarIcon, ChartIcon, CheckCheckIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ClockIcon, CloseIcon, CopyIcon, DownloadIcon, EditIcon, EnterIcon, ErrorIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, FileIcon, FileTextIcon, FilterIcon, GridIcon, HelpIcon, HomeIcon, ICONS, Icon, InboxIcon, InfoIcon, MenuIcon, MinusIcon, MoonIcon, MoreIcon, MoreVerticalIcon, PlusIcon, RotateCcwIcon, SearchIcon, SettingsIcon, SidebarIcon, SignOutIcon, SortIcon, SparkleIcon, SuccessIcon, SunIcon, TrashIcon, UploadIcon, UserIcon, UsersIcon, WarningIcon, createIcon } from "@lufia/design-system/components/Icon"`
- Also from: `@lufia/design-system`
- Source: [src/components/Icon](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Icon)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-utilities-icon--docs)

## Purpose

The icon set of the package: named icons such as `CloseIcon`, `CheckIcon` or `SearchIcon`, the `Icon` primitive they are
built on, and `createIcon` for an app's own glyphs. Every icon shares one 24-unit grid, a `currentColor` stroke with round
caps and joins, a stroke width from `--lufia-icon-stroke`, and sizes from `--lufia-icon-size-*`. The full guide, with the
status icons and the rules, is the [Icons foundation](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/foundations-icons--docs).

## When to use

- Beside a visible label in buttons, menus and navigation (decorative).
- As the only content of an icon button, with an accessible name on the button.

## When not to use

- For a status: use `StatusIcon`, whose tones each have their own shape.
- As the only carrier of meaning without a name.
- Do not draw an inline `svg` in a component, and do not use a text glyph (a multiplication sign, a check mark, an arrow) as an icon. Use a named icon, or `createIcon` for a glyph the set does not have.

## Exports

| Name | Kind |
| --- | --- |
| `ArrowDownIcon` | component |
| `ArrowLeftIcon` | component |
| `ArrowRightIcon` | component |
| `ArrowUpIcon` | component |
| `BellIcon` | component |
| `CalendarIcon` | component |
| `ChartIcon` | component |
| `CheckCheckIcon` | component |
| `CheckIcon` | component |
| `ChevronDownIcon` | component |
| `ChevronLeftIcon` | component |
| `ChevronRightIcon` | component |
| `ChevronUpIcon` | component |
| `ClockIcon` | component |
| `CloseIcon` | component |
| `CopyIcon` | component |
| `DownloadIcon` | component |
| `EditIcon` | component |
| `EnterIcon` | component |
| `ErrorIcon` | component |
| `ExternalLinkIcon` | component |
| `EyeIcon` | component |
| `EyeOffIcon` | component |
| `FileIcon` | component |
| `FileTextIcon` | component |
| `FilterIcon` | component |
| `GridIcon` | component |
| `HelpIcon` | component |
| `HomeIcon` | component |
| `ICONS` | constant |
| `Icon` | component |
| `InboxIcon` | component |
| `InfoIcon` | component |
| `MenuIcon` | component |
| `MinusIcon` | component |
| `MoonIcon` | component |
| `MoreIcon` | component |
| `MoreVerticalIcon` | component |
| `PlusIcon` | component |
| `RotateCcwIcon` | component |
| `SearchIcon` | component |
| `SettingsIcon` | component |
| `SidebarIcon` | component |
| `SignOutIcon` | component |
| `SortIcon` | component |
| `SparkleIcon` | component |
| `SuccessIcon` | component |
| `SunIcon` | component |
| `TrashIcon` | component |
| `UploadIcon` | component |
| `UserIcon` | component |
| `UsersIcon` | component |
| `WarningIcon` | component |
| `createIcon` | function |

## API

### `ArrowDownIcon`, `ArrowLeftIcon`, `ArrowRightIcon`, `ArrowUpIcon`, `BellIcon`, `CalendarIcon`, `ChartIcon`, `CheckCheckIcon`, `CheckIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronUpIcon`, `ClockIcon`, `CloseIcon`, `CopyIcon`, `DownloadIcon`, `EditIcon`, `EnterIcon`, `ErrorIcon`, `ExternalLinkIcon`, `EyeIcon`, `EyeOffIcon`, `FileIcon`, `FileTextIcon`, `FilterIcon`, `GridIcon`, `HelpIcon`, `HomeIcon`, `InboxIcon`, `InfoIcon`, `MenuIcon`, `MinusIcon`, `MoonIcon`, `MoreIcon`, `MoreVerticalIcon`, `PlusIcon`, `RotateCcwIcon`, `SearchIcon`, `SettingsIcon`, `SidebarIcon`, `SignOutIcon`, `SortIcon`, `SparkleIcon`, `SuccessIcon`, `SunIcon`, `TrashIcon`, `UploadIcon`, `UserIcon`, `UsersIcon`, `WarningIcon`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `IconSize` | no |  | Rendered size: `sm`, `md` or `lg` read `--lufia-icon-size-*` (16, 20 and 24px by default), `1em` follows the font size of the text around it, and a number is a size in px. Default `md`. |
| `title` | `string` | no |  | Makes the icon meaningful: rendered as an SVG `<title>`, with `role="img"`. Without `title` or `aria-label` the icon is decorative and hidden from assistive technology. Prefer naming the button or link that holds the icon instead. |
| `ref` | `Ref<SVGSVGElement>` | no |  |  |

Other native element attributes pass through to the root element.

### `Icon`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `IconSize` | no | `"md"` | Rendered size: `sm`, `md` or `lg` read `--lufia-icon-size-*` (16, 20 and 24px by default), `1em` follows the font size of the text around it, and a number is a size in px. Default `md`. |
| `title` | `string` | no |  | Makes the icon meaningful: rendered as an SVG `<title>`, with `role="img"`. Without `title` or `aria-label` the icon is decorative and hidden from assistive technology. Prefer naming the button or link that holds the icon instead. |
| `ref` | `Ref<SVGSVGElement>` | no |  |  |
| `children` | `ReactNode` | no |  |  |

Other native element attributes pass through to the root element.

### `createIcon`

Makes a named icon component that inherits the grid, stroke, sizes and accessibility rules of `Icon`. Draw on a 24x24 grid with strokes only (no fills, no stroke widths of your own) so the icon matches the rest of the set. ```tsx const RouteIcon = createIcon("route", ["M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"]); ```

```ts
createIcon(name: string, geometry: IconGeometry): IconComponent
```

## Types

- `IconComponent`: `((props: IconProps) => ReactNode) & { displayName?: string | undefined; iconName: string; }`
- `IconGeometry`: `ReactNode | readonly string[]`
- `IconProps`: `Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox" | "children" | "ref"> & { size?: IconSize | undefined; title?: string | undefined; ref?: Ref<SVGSVGElement> | undefined; }`
- `IconSize`: `number | "sm" | "md" | "lg" | "1em"`

## Example

```tsx
import { CloseIcon, SearchIcon, createIcon } from "@lufia/design-system/icons";

<button type="button" aria-label="Close">
  <CloseIcon />
</button>;

<SearchIcon size="sm" />;

// An app's own glyph, on the same grid and stroke.
const RouteIcon = createIcon("route", [
  "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "M8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
]);
```

## Accessibility

- **Decorative by default**: `aria-hidden="true"` and `focusable="false"`, so assistive technology skips it.
- **Meaningful on request**: `title` (rendered as an SVG `title`) or `aria-label` adds `role="img"` with that name. Prefer naming the button or link around the icon, so the name is announced once.
- Icons inherit `currentColor`: their contrast is that of the text colour they sit in (3:1 for non-text content).
- Under `forced-colors` the stroke follows the system text colour.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-icon-size-lg`, `--lufia-icon-size-md`, `--lufia-icon-size-sm`, `--lufia-icon-stroke`, `--lufia-icon-stroke-sm`.

## Stories

- `components-utilities-icon--default`
- `components-utilities-icon--gallery`
- `components-utilities-icon--sizes`
- `components-utilities-icon--inline-with-text`
- `components-utilities-icon--meaningful`
- `components-utilities-icon--app-icon`
- `components-utilities-icon--all-themes`
