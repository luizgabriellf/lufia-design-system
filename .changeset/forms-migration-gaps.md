---
"@lufia/design-system": minor
---

Forms: `FormField` parts carry stable `data-lufia-part` hooks (`field`, `label`, `hint`, `error`, `control`). Behaviour change: the children now sit inside a `data-lufia-part="control"` wrapper element (`display: contents`), so direct-child selectors on the field root (`.f > input`, `:nth-child`) no longer reach the control. `LufiaProvider` gets a `required` label that is the default `requiredLabel` of `FormField` and `RadioGroup` (an explicit prop still wins). `RadioGroup` gets `variant="card"` and per-option `meta` and `content` slots. New `SwitchInput`, a native `<input type="checkbox" role="switch">` whose value is read from the form; `Switch` is unchanged. `LufiaLabels` gains a required `required` key, so code that builds a complete `LufiaLabels` object must add it.
