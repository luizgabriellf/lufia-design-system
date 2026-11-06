---
"@lufia/design-system": patch
---

Keep `ToastProvider` announcements in a long-lived pair of live regions so a toast raised as a dialog closes is still announced, and move only the visible stack between hosts without replaying its enter animation.
