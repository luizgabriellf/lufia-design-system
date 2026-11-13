---
"@lufia/design-system": patch
---

Document the `TextInput` `size` typing. Since `size="sm"` was added, `TextInputProps` omits the native numeric `size` attribute, so props types that extend the native input attributes and are spread into `TextInput` must omit `size`: `Omit<InputHTMLAttributes<HTMLInputElement>, "size">`. `SearchInput`, `DateField` and `Select` already follow this convention. No runtime change.
