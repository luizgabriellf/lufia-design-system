---
"@lufia/design-system": patch
---

Fix three narrow-screen defects in form controls. `ListField`: the add button keeps its label on one line and wraps under the input when the two cannot share the row, instead of breaking the word. `FormField` and `ListField`: the label text and the required mark now sit in one inline wrapper, so a stylesheet that turns the label into a flex or grid container no longer drops the mark onto its own line. `TextInput`, `Textarea`, `Select`, `SearchInput`, `Combobox` and `DateField`: a focused control draws a single focus ring over its border, with no border colour change and no gap, instead of two rings (an invalid control keeps its danger border visible beside the ring).
