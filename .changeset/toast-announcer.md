---
"@lufia/design-system": minor
---

`ToastProvider` now announces from persistent, visually hidden live regions (`role="status"` and `role="alert"`): one in the body and one inside each open modal dialog, so a toast raised while a dialog is open, or as it closes, is still read out. Only the visible stack moves between hosts, without replaying its enter animation. Note for tests: the hidden announcer holds a copy of each message, so `getByText` can find two matches; assert what is announced with `getByRole("status")` (or `"alert"` for errors) and query the visible toast inside the `Notifications` region.
