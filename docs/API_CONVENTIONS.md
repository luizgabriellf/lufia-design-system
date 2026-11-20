# API conventions

How a component's props are named and shaped. The rules below describe what the package already does, so a new component reads like the existing ones. [STANDARDS.md](STANDARDS.md) §3 tracks the status; `AGENTS.md` carries the short form.

## Root element

- `className` is merged onto the root element, and the remaining props are spread onto it. A consumer can always add `id`, `data-*`, `aria-*` and event handlers without a wrapper.
- `ref` is a regular prop (React 19). The package does not use `forwardRef`.
- A component that can render more than one element says so with a typed `as` (`Reveal`) or a discriminated union (`Button` is a button, or a link when it gets `href`). There is no untyped `component` prop.

## Appearance props

| Prop      | Meaning                                              | Values                                             |
| --------- | ---------------------------------------------------- | -------------------------------------------------- |
| `variant` | Which visual treatment of the same component         | Named per component (`primary`, `secondary`, ...)  |
| `size`    | Density of the control                               | `"sm" \| "md" \| "lg"`, or the subset that exists  |
| `tone`    | Semantic colour: status or emphasis, never a raw hue | Named per component, on the semantic status tokens |

- `md` is the default size. A component that offers one alternative offers `sm`, not a new word.
- Two components predate the rule and keep their own size names for now: `Banner` (`"md" | "compact" | "inline"`) and `Disclosure` (`"default" | "compact"`). Do not copy them.
- A new look is a new `variant` value, not a new boolean. Booleans are for independent states (`disabled`, `loading`, `fullWidth`), never for alternatives that exclude one another.

## State props

| Prop       | Use it for                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| `disabled` | The control cannot be used. Same name as the native attribute.              |
| `loading`  | A control or a region that is waiting for its own data or action (`Button`) |
| `busy`     | A surface whose content is being submitted (`Modal`, `ConfirmDialog`)       |
| `pending`  | A navigation or a form submission in flight (`RouteProgress`)               |

Boolean props are bare adjectives or participles. No `is` or `has` prefix.

## Controlled and uncontrolled

A stateful component works both ways, with the same pair of names React uses for inputs:

- value: `value` + `onValueChange(value)`, or `defaultValue`;
- open state: `open` + `onOpenChange(open)`, or `defaultOpen`.

## Callback names

| Callback        | When                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| `onValueChange` | A component with its own value model reports the new value (`Tabs`, `Combobox`, `DateField`) |
| `onChange`      | A thin wrapper over a native control passes the native event through (`TextInput`)           |
| `onOpenChange`  | A component that owns its trigger opens or closes (`Menu`, `Popover`)                        |
| `onClose`       | A surface the app opens asks to be closed (`Modal`, `ConfirmDialog`)                         |
| `onDismiss`     | The person dismisses a message (`Banner`, `Toast`)                                           |

`onValueChange` receives the value, never an event. A callback that reports an exit animation ending is named after the state reached (`onExited`).

## State in the DOM

State that a consumer may want to style or test is exposed as `data-*` attributes on the root, not as generated class names:

- `data-state="open" | "closed"` for anything that opens;
- `data-variant`, `data-size`, `data-tone` mirror the props of the same name.

CSS inside the package selects on these attributes too, so the public hook and the internal one are the same.

## Strings and navigation

- Every user-facing string comes in through props. English defaults exist only for text that is read by assistive technology alone, and they live in `LufiaProvider` `labels`.
- Links render through the `LinkComponent` set once on `LufiaProvider`. A component never imports a router.

## Documentation

Every exported prop carries a JSDoc description. It feeds the generated component manifest, and `npm run verify:ai-docs` fails on a prop without one.
