---
"@lufia/design-system": minor
---

Layout and target-size fixes found in a review at phone and desktop widths.

- **Badge and StatusBadge (default change):** a badge now keeps its text on one line and does not shrink in a flex row or an auto-layout table cell (`flex: none; white-space: nowrap`). Add the new `wrap` prop to restore the previous wrapping and shrinking for long labels; `truncate` is unchanged.
- **Checkbox:** the box has a 24 by 24px hit area without changing the drawn box, and the new `size="sm"` prop (default `"md"`) gives dense panels a smaller label in a shorter row.
- **Textarea:** the new `rootClassName` prop goes on the root element (`className` still goes on the box). The root now fills the space left in a flex row (`flex: 1 1 auto; min-inline-size: 0`), so `autoSize` no longer collapses there.
- **Modal:** the new `sheetHeight="full"` prop (default `"auto"`) makes the phone sheet fill the screen below `--lufia-modal-sheet-offset`, with no reset of the size rule.
- **FormField and controls:** a read-only `TextInput`, `Textarea`, `SearchInput` or `Combobox` inside a required field is no longer `required` or `aria-required`, and the field hides the required mark and its accessible text.
- **StatusTimeline:** the content column and the action slot can shrink, so a wide action no longer widens the card past its container on a phone.
- **FileField:** in a narrow slot the choose button wraps its icon above the label instead of breaking the label into one word per line.
- **NavRow:** documents that `meta` and a numeric `badge` must carry their own context.
