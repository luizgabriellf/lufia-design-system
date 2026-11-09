---
"@lufia/design-system": minor
---

Phone targets and overflow. New `--lufia-target-touch` token: Button (every size), TableToolbar search, Combobox trigger and CommandPalette field and close are 44px on phones and coarse pointers, desktop keeps its density. CommandPalette follows `visualViewport`, so it fits above an on-screen keyboard, and its focus ring is no longer clipped. Badge gains `truncate` and `--lufia-badge-max-inline-size` and never overflows its pill. PeerNav labels no longer run into the next item and `layout="scroll"` sizes items to their label. New optional `--lufia-button-danger-bg` and `--lufia-button-danger-fg` hooks. StatTile long figures and a read-only Textarea's resize handle are fixed.
