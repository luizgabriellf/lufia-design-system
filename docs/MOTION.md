# Motion

The rules for motion in `@lufia/design-system` and in the apps that use it. They are enforced where a machine can enforce
them (`lufia-verify-motion`, below) and reviewed where it cannot. Live demos are in Storybook under **Foundations →
Motion**.

## Principles

1. **Continuity over decoration.** A transition exists to keep the person oriented: where something opened from, where it
   went, what just changed. If it does not do that, leave it out.
2. **Never a blank flash or a jump.** A loading placeholder has the shape of the content that replaces it. Scroll position
   and focus survive. Persistent chrome (headers, sidebars) never re-animates.
3. **Never in the way.** Input is never blocked by an animation, and a second tap mid-animation goes straight to the new
   state. Nothing in application UI is longer than 300 ms, and exits are shorter than entrances.
4. **Only real state changes animate.** Not first paint, not every re-render, not every data refresh. CSS entrance
   animations run when a node is created; script-driven ones compare with the previous value first.
5. **One direction language.** Forward is right or up, back is left or down. Sheets rise from the bottom; dialogs scale
   from the centre.
6. **Compositor-friendly only.** Animate `transform` and `opacity` (also `clip-path` and SVG stroke). Never `width`,
   `height`, `top`, `left`, margins or padding. The approved exception is the `Collapse` primitive. Add `will-change` only
   while an animation runs. Do not animate anything on top of a full-viewport `backdrop-filter`.
7. **Respond on the press, not on the response.** What the person clicked shows as chosen at once; the page follows when
   it arrives.
8. **Reduced motion is respected everywhere**, and motion never carries meaning alone.
9. **Restrained.** Never hijack scroll and never move an interactive control the person is aiming at.

## Tokens

All defined in `tokens/` (DTCG) and built to `--lufia-motion-*` in `tokens.css`.

| Token                                      | Value                            | Use                                                 |
| ------------------------------------------ | -------------------------------- | --------------------------------------------------- |
| `--lufia-motion-duration-instant`          | 120 ms                           | Hover, press, colour changes                        |
| `--lufia-motion-duration-fast`             | 180 ms                           | Small control motion, chevrons                      |
| `--lufia-motion-duration-enter`            | 240 ms                           | Anything entering: dialogs, toasts, steps, page in  |
| `--lufia-motion-duration-exit`             | 160 ms                           | Anything leaving (always shorter than its entrance) |
| `--lufia-motion-duration-medium` / `-slow` | 380 / 640 ms                     | Large surfaces, number counts, marketing reveals    |
| `--lufia-motion-easing-out`                | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances                                           |
| `--lufia-motion-easing-in`                 | `cubic-bezier(0.4, 0, 1, 1)`     | Exits                                               |
| `--lufia-motion-easing-in-out`             | `cubic-bezier(0.65, 0, 0.35, 1)` | Movement between two resting places                 |
| `--lufia-motion-easing-drawer`             | `cubic-bezier(0.32, 0.72, 0, 1)` | Large travel such as sheets                         |
| `--lufia-motion-distance-nudge`            | 0.25 rem                         | Small controls and indicators                       |
| `--lufia-motion-distance-rise`             | 0.375 rem                        | Content and page entrances                          |
| `--lufia-motion-distance-slide`            | 0.5 rem                          | List rows and panels                                |
| `--lufia-motion-distance-travel`           | 1 rem                            | Sheets and full-screen surfaces                     |

Write durations and easings as `var(--lufia-motion-*)`. A literal fails `lufia-verify-motion`. Distances are in `rem`.

## Reduced motion

Under `@media (prefers-reduced-motion: reduce)`, `tokens.css` sets every `--lufia-motion-duration-*` to `0.01ms` and every
`--lufia-motion-distance-*` to `0rem`. So:

- **Token-driven CSS needs no extra work.** The end state is reached at once. The duration is `0.01ms` and not `0` so that
  `transitionend` and `animationend` still fire.
- **Entrances fill `backwards`, never `both` or `forwards`.** A forwards fill keeps the animation's `transform` applied
  after it ends, even as an identity matrix. That makes the element the containing block and a stacking context for any
  `position: fixed` descendant rendered inside it, so a sheet or popover is positioned against the element and not the
  viewport. `backwards` applies the first frame during the delay and nothing afterwards, so the resting state is
  `transform: none`. The one exception is `NavSheet`, which rests on its own drag transform
  (`translateY(var(--lufia-sheet-drag, 0))`); it sits inside a fixed root, so nothing is affected. Exits (`*-out`) may hold their last frame because the element is about to unmount. A test
  (`src/test/animationFill.test.ts`) fails on any entrance that animates `transform` and fills forwards.
- **Keyframes animate `from` only**, so the resting state is the end state and a disabled animation leaves the content
  visible.
- **Endless loops (spinners, shimmer) are stopped, not shortened.** A near-zero endless loop is a strobe. Give them a
  `@media (prefers-reduced-motion: reduce)` rule (`animation: none`, or hide the moving part). Endless loops are the one
  case where a literal duration is accepted, because they keep their own pace.
- **Script-driven motion** (`requestAnimationFrame`, the Web Animations API) checks `usePrefersReducedMotion()` (or
  `matchMedia`) and renders the final state.
- **Reduced motion means less motion, not less information.** Show the new value; do not hide the change.

## Primitives

| Primitive                 | Use for                                    | Reduced motion               |
| ------------------------- | ------------------------------------------ | ---------------------------- |
| `Reveal`                  | Content that appears or disappears         | Appears and unmounts at once |
| `Collapse`                | Content that expands to its natural height | Snaps open and closed        |
| `Skeleton`                | Placeholder for content that is loading    | Shimmer stops, shape stays   |
| `AnimatedNumber`          | A figure that changes while visible        | New value at once            |
| `ChangeHighlight`         | Pointing at a value that updated by itself | No flash                     |
| `Stagger`                 | A group that enters on mount, in sequence  | Children are simply there    |
| `RouteTransition`         | The content region when the page changes   | Nothing is marked            |
| `usePrefersReducedMotion` | Anything CSS cannot switch off             | n/a                          |

Import from `@lufia/design-system/motion`. All are `beta`.

The chart components (`Sparkline`, `BarList`, `BulletBar`, `ProgressBar`, `StackedBar`) draw in once on mount with
`--lufia-motion-duration-medium` (380 ms), on `transform` or stroke only. It is a one-time entrance of a drawing, not an
interaction, which is why it is longer than the 300 ms an interactive control may take. It is removed under reduced motion.

## Checklist for a new screen

- [ ] Durations and easings are tokens; no literal times, no `ease`/`cubic-bezier`.
- [ ] Nothing animates a layout property (use `Collapse` for height). No `will-change` at rest.
- [ ] Loading states use skeletons shaped like the real content; layout shift on swap is negligible.
- [ ] Entrances are longer than exits; nothing is longer than 300 ms in application UI.
- [ ] Only real changes animate. First paint does not.
- [ ] Checked with `prefers-reduced-motion: reduce`: everything still works and nothing is hidden.
- [ ] Checked on a throttled CPU (DevTools 4x slowdown): no dropped frames in transitions.
- [ ] `lufia-verify-motion` passes.

## `lufia-verify-motion`

A command-line check for the rules a machine can verify. It ships in the package (`bin`) and reads your CSS, and the
inline styles and animation calls in your scripts. No dependencies beyond Node 22.

```bash
npx lufia-verify-motion src
```

| Rule             | Flags                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duration`       | A literal time in `transition` or `animation` (shorthand or longhand). Delays, `1ms` steps and `infinite` loops are exempt.                                                                                                                                               |
| `easing`         | `ease`, `ease-in`, `ease-out`, `ease-in-out` or `cubic-bezier()` in a transition or animation. `linear` and `steps()` are fine.                                                                                                                                           |
| `layout`         | `width`, `height`, `top`, `left`, `inset`, margins, paddings, `font-size`, `grid-template-*`, `all` and similar in `transition` or in `@keyframes`.                                                                                                                       |
| `reduced-motion` | A stylesheet with literal-duration or endless motion and no `prefers-reduced-motion` rule (and no global one in the scan). A script that calls `requestAnimationFrame` or `.animate()` without `usePrefersReducedMotion`, `useReducedMotion` or `prefers-reduced-motion`. |

Token-only, finite CSS motion is accepted without a media query, because the tokens collapse by themselves. A global
kill-switch (a `*` selector that resets `animation` or `transition` inside the reduced-motion query) satisfies the rule
for the whole scan.

Options:

```text
lufia-verify-motion [paths...]
  --baseline <file>      ratchet file (below)
  --init                 create the baseline from today's violations
  --update               rewrite the baseline after fixing violations (refuses to add any)
  --ignore <prefix>      skip paths that start with this prefix (repeatable)
  --token-prefix <p>     extra custom-property prefix that counts as a motion token (repeatable)
```

Tests (`*.test.*`, `*.spec.*`), `.d.ts` files and `node_modules`, `dist`, `build`, `coverage`, `.next` are skipped. Exit code
`0` is ok, `1` is violations, `2` is a usage error.

### Deliberate exceptions

Put `lufia-motion-allow <rule>` in a comment on the same line or the line above (CSS `/* */`, scripts `//`). It silences that
rule only, for the next declaration. Use it with a reason; `Collapse` is the model:

```css
/* The one place a layout property is animated, on purpose: 0fr to 1fr reaches height: auto. */
/* lufia-motion-allow layout */
transition: grid-template-rows var(--lufia-motion-duration-enter) var(--lufia-motion-easing-in-out);
```

### Adopting it in an existing codebase: the ratchet

An app with existing violations records them once and from then on may only improve:

```bash
npx lufia-verify-motion src --baseline motion-baseline.json --init     # once
npx lufia-verify-motion src --baseline motion-baseline.json            # in CI
npx lufia-verify-motion src --baseline motion-baseline.json --update   # after fixing some
```

The baseline stores violation counts per file and rule. A count above the baseline fails (all findings of that file and
rule are printed, since the counts cannot tell which one is new); a lower count passes and tells you the baseline can
shrink. `--update` refuses to write anything bigger than what is recorded, and `--init` refuses to overwrite.

### Limits

It is a static, line-based check, not a CSS parser. It does not follow `var()` values, preprocessor mixins or class
composition, and it does not see animation set through the Web Animations API options. Passing it is necessary, not
sufficient: the checklist above still applies.
