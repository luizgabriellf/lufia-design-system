<!--
PR title: `feat(<component>): ...`
Use this template for a new component, or for a significant change to a component's API.
-->

## Component

- **Name:**
- **Status after this PR:** alpha / beta / stable
- **RFC / issue:** Closes #

## Problem and use cases

<!-- What does this component solve? Give at least one real use case from a consuming app. -->

## API

```tsx
// Props sketch / usage example
```

- Controlled / uncontrolled:
- Every user-facing string comes in through props: yes / no
- `className` passthrough and rest props on the root element: yes / no
- Exposed `data-*` state attributes:

## Accessibility

- **WAI-ARIA APG pattern followed:** <!-- link -->
- **Keyboard map:**

  | Key | Action |
  |-----|--------|
  |     |        |

- **Screen-reader pass:** VoiceOver / NVDA / not yet (required before `stable`)
- **Contrast:** checked in every theme

## Tokens

<!-- Which semantic/component tokens it uses. Did this PR add any new tokens? -->

## Screenshots / Storybook

<!-- Every state: default, hover, focus, disabled, loading, error, empty. Every theme, light and dark. -->

## Definition of done (docs/STANDARDS.md)

- [ ] Typed API following docs/API_CONVENTIONS.md
- [ ] Stories cover every state × theme
- [ ] MDX docs: usage, when to use / when not to use, do and don't, a11y notes, content guidelines
- [ ] vitest + Testing Library tests, with axe passing
- [ ] Keyboard spec tested
- [ ] Visual baseline updated
- [ ] Responsive at 320 / 390 / 768 / 1440
- [ ] Changeset added
