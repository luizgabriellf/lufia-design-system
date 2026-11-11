# Banner

> An inline message for a page or section: info, success, warning, danger or neutral, with an optional action and dismiss.

- Status: beta
- Category: Feedback
- Import: `import { BANNER_VARIANTS, Banner } from "@lufia/design-system/components/Banner"`
- Also from: `@lufia/design-system`
- Source: [src/components/Banner](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Banner)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-banner--docs)

## Purpose

An inline message for a page or a section: a note above a form, a warning that access expires, a failed sync. It stays in the
page flow, never takes focus and does not leave by itself. It has a variant, an optional title, a leading icon, an action slot
and an optional dismiss button.

## When to use

- A message about the whole page or one section that should stay visible: a note above a form, access or a trial about to expire, a failed sync, a record that is read-only.
- A message that comes with a next step the person can take now or later (`action`).

## When not to use

- Feedback for an action that just happened and can leave by itself: use `Toast`.
- A short label for a record or a count: use `Badge`.
- A list, table or panel with nothing to show: use `EmptyState`.
- A field error: use the `error` of `FormField`.
- A decision that must be made before going on: use `ConfirmDialog` or `Modal`.
- More than one or two at a time: they stop being read. Combine them, or move the detail into the page.

## Exports

| Name | Kind |
| --- | --- |
| `BANNER_VARIANTS` | constant |
| `Banner` | component |

## API

### `Banner`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `"neutral" \| "success" \| "warning" \| "danger" \| "info"` | no | `"info"` | `info` (default), `success`, `warning`, `danger` or `neutral`. Sets the colour, the default icon and the default `live`. |
| `title` | `ReactNode` | no |  | A short heading for the message. Optional: a one-line banner can be only `children`. |
| `children` | `ReactNode` | no |  | The message. Keep it to a sentence or two; link or act through `action`. |
| `icon` | `ReactNode` | no |  | The leading icon. Left out, it is the status icon of the variant. Pass your own node to replace it, or `null` for none (then the title or text must say what kind of message it is). Always hidden from assistive technology. |
| `action` | `ReactNode` | no |  | Buttons or links for the next step. They sit beside the text, and below it when the banner is narrow. |
| `onDismiss` | `() => void` | no |  | Adds a dismiss button. The banner does not remove itself: unmount it, or collapse it, in this handler. |
| `dismissLabel` | `string` | no |  | The accessible name of the dismiss button, in your language. Required with `onDismiss`: the package has no copy, and an unnamed button fails axe. |
| `size` | `"md" \| "compact" \| "inline"` | no | `"md"` | `md` (default), `compact` (less padding and a smaller icon, for a banner inside a card or a dense form) or `inline` (no card chrome: a tone-coloured start border on a subtle tone background, no minimum height, for guidance between form fields). |
| `lead` | `ReactNode` | no |  | A bold lead-in rendered inline before `children`, in the same paragraph ("Note: ..."). It does not add a title row. Say the kind of message in words; do not rely on the icon or the colour. |
| `live` | `"polite" \| "assertive" \| "off"` | no |  | Overrides how the banner is announced. Default: `assertive` (`role="alert"`) for `warning` and `danger`, `polite` (`role="status"`) for the others. |
| `animateIn` | `boolean` | no | `false` | Plays the enter motion (a short fade and slide) when the banner mounts. Default `false`: a banner already on the page at load stays still. |

Other native element attributes pass through to the root element.

## Types

- `BannerLive`: `"polite" | "assertive" | "off"`
- `BannerVariant`: `"info" | "success" | "warning" | "danger" | "neutral"`

## Example

```tsx
import { Banner } from "@lufia/design-system/components/Banner";

<Banner
  variant="warning"
  title="Access expires in 3 days"
  action={<a href="/renew">Renew access</a>}
  onDismiss={() => setDismissed(true)}
  dismissLabel="Dismiss message"
>
  Renew it to keep editing without interruption.
</Banner>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/).

Keyboard:

The banner takes no focus. The dismiss button and any buttons or links in `action` are in the tab order, in reading order,
and the dismiss button works with Enter and Space.

- `info`, `success` and `neutral` are `role="status"` (a polite live region); `warning` and `danger` are `role="alert"` (assertive). A live region only announces what is added after it exists, so a banner present at load is not read out unprompted; set `live="off"` (`role="note"`) for one that is part of the page and must not interrupt.
- Meaning never rests on colour (WCAG 1.4.1): each variant has its own icon shape, and the text states the message. If you hide the icon with `icon={null}`, say the kind of message in the title or text.
- The icon is decorative and hidden from assistive technology. The dismiss button is named by `dismissLabel`.
- The text is always the default text colour on the tinted background, and the contrast check covers it, and the focus ring, on every variant in every theme and mode.
- Focus is visible on the dismiss button. In forced-colors mode the banner uses system colours (`Canvas`, `CanvasText`) and the icon shape keeps the variant readable.
- Long words break and the text wraps, so nothing overflows at 320px or at 200% zoom. The layout uses logical properties, so it mirrors in right-to-left.
- The enter motion animates `opacity` and `transform` only and is removed under `prefers-reduced-motion`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-banner-body-gap`, `--lufia-banner-border-width`, `--lufia-banner-gap`, `--lufia-banner-icon-size`, `--lufia-banner-inline-border-width`, `--lufia-banner-inline-radius`, `--lufia-banner-padding-block`, `--lufia-banner-padding-inline`, `--lufia-banner-padding-inline-end`, `--lufia-banner-padding-inline-start`, `--lufia-banner-radius`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-border`, `--lufia-color-status-danger-fg`, `--lufia-color-status-neutral-bg`, `--lufia-color-status-neutral-fg`, `--lufia-color-status-success-bg`, `--lufia-color-status-success-border`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-border`, `--lufia-color-status-warning-fg`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-body`, `--lufia-font-line-height-normal`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-radius-card`, `--lufia-radius-md`, `--lufia-radius-sm`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

Title in a few words, sentence case, saying what happened ("The last sync failed"). Description in one or two sentences saying
why it matters and what to do. One main action; a second only as a link. Use `danger` only for something that failed or is
blocked, `warning` for something that will if nothing is done.

## Stories

- `components-feedback-banner--default`
- `components-feedback-banner--variants`
- `components-feedback-banner--without-title`
- `components-feedback-banner--title-only`
- `components-feedback-banner--with-action`
- `components-feedback-banner--dismissible`
- `components-feedback-banner--dismissible-with-action`
- `components-feedback-banner--compact`
- `components-feedback-banner--inline`
- `components-feedback-banner--with-lead`
- `components-feedback-banner--static-note`
- `components-feedback-banner--inline-narrow`
- `components-feedback-banner--custom-icon`
- `components-feedback-banner--no-icon`
- `components-feedback-banner--long-text`
- `components-feedback-banner--narrow`
- `components-feedback-banner--animated-in`
- `components-feedback-banner--all-themes`
- `components-feedback-banner--themed-by-tokens`
