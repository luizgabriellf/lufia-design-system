---
"@lufia/design-system": patch
---

Button: throw a clear error when `render` is not a React element, such as a lazy reference from a Server Component,
instead of a `TypeError` about `className`.
