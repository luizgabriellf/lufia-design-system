# useModalState

> Open, close and the element to return focus to, for a controlled modal.

- Status: beta
- Category: Hooks
- Import: `import { browserHistoryAdapter, decodeModalId, useModalState } from "@lufia/design-system/components/useModalState"`
- Also from: `@lufia/design-system`
- Source: [src/components/useModalState](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useModalState)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usemodalstate--docs)

## Purpose

Keeps "which modal is open" in the URL, so a refresh or a shared link reopens it and the browser's back button closes it.
Router-agnostic: it talks to the URL through a small adapter.

## When to use

- Modals people link to, refresh on, or expect the back button to close: record details, edit forms.

## When not to use

- Transient confirmations and menus. A confirmation should not survive a refresh; use `useConfirmDialog` or plain state.
- Anything that must not appear in the URL (personal data belongs in the `id`'s lookup, not in the address).

## Exports

| Name | Kind |
| --- | --- |
| `browserHistoryAdapter` | constant |
| `decodeModalId` | function |
| `useModalState` | hook |

## API

### `decodeModalId`

Decodes a composite modal id (`item::42`) that was stored URI-encoded; malformed input is returned as is.

```ts
decodeModalId(id: string | null): string | null
```

### `useModalState`

Keeps "which modal is open" in the URL, so a refresh or a shared link reopens it and the back button closes it. When one modal opens from another (a detail view opening its history), the parent is remembered and shown again when the child closes. It owns four query parameters (`modal`, `id`, `returnModal`, `returnId`) and keeps every other one untouched. Works with any router through {@link ModalStateAdapter}; with none it uses the browser History API.

```ts
useModalState({ adapter, keys, onNavigate, }?: UseModalStateOptions): { readonly modal: string | null; readonly id: string | null; readonly returnModal: string | null; readonly returnId: string | null; readonly open: (name: string, itemId?: string | undefined, options?: ModalOpenOptions | undefined) => void; readonly close: () => void; }
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `__0` | `UseModalStateOptions` | no |  |

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `modal` | `string \| null` | yes |  |
| `id` | `string \| null` | yes |  |
| `returnModal` | `string \| null` | yes |  |
| `returnId` | `string \| null` | yes |  |
| `open` | `(name: string, itemId?: string \| undefined, options?: ModalOpenOptions \| undefined) => void` | yes |  |
| `close` | `() => void` | yes |  |

## Types

- `ModalOpenOptions`: `{ consumeKeys?: readonly string[] | undefined; }`
- `ModalStateAdapter`: `{ get: () => SearchParamsReader; set: (params: URLSearchParams, mode: "push" | "replace") => void; subscribe?: ((onChange: () => void) => () => void) | undefined; }`
- `ModalStateKeys`: `{ modal: string; id: string; returnModal: string; returnId: string; }`
- `SearchParamsReader`: `{ get(name: string): string | null; forEach(callback: (value: string, key: string) => void): void; toString(): string; }`
- `UseModalStateOptions`: `{ adapter?: ModalStateAdapter | undefined; keys?: Partial<ModalStateKeys> | undefined; onNavigate?: (() => void) | undefined; }`

## Example

```tsx
import { useModalState } from "@lufia/design-system/components/useModalState";

const { modal, id, open, close } = useModalState();

<Modal open={modal === "detail"} onClose={close} title="Detail">
  ...
</Modal>;
```

## Accessibility

- A refresh reopens the modal, and there is no opener to return focus to. Focus then goes back to the page body when it closes. If that matters, manage focus in the consumer.
- `open` pushes a history entry and `close` replaces it, so Back closes the modal and does not stack closed states.
- Opening and closing are real navigations: in a routed app, let `onNavigate` drive the same loading indication as other navigations.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usemodalstate--default`
- `hooks-usemodalstate--opens-from-the-url`
- `hooks-usemodalstate--returns-to-the-parent`
