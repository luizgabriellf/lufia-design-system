---
"@lufia/design-system": patch
---

Disclosure: the `plain` variant no longer outranks a consumer's own rules. The summary and panel inline padding are now the documented `--lufia-disclosure-summary-padding-inline` and `--lufia-disclosure-panel-padding-inline` custom properties, and an ordinary `root > summary` rule also wins. The default rendering is unchanged. Menu: add a story and browser test for an inline listbox inside a modal sheet.
