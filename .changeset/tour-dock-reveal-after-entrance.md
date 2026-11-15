---
"@lufia/design-system": patch
---

Tour: with `dialogLayout.dock`, the target is scrolled clear of the dialog's footer again whenever the dialog docks or its dock changes size. A modal still animating in docks only once its entrance ends; on a slow device that came after the tour's last reveal, which had measured the undocked dialog, so the target stayed hidden behind the footer.
