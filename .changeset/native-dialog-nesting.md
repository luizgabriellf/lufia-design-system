---
"@lufia/design-system": patch
---

Render a portal `Modal` or `ConfirmDialog` opened over a native dialog inside that dialog, turn the native `close` event into `onClose`, compose the caller's `onClick` and `onPointerDown` on a native `Modal`, keep the registration order of `useShellPrimaryAction`, and honour a prevented `PeerNav` `onItemClick`.
