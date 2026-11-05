# @lufia/design-system

The design layer that Salvus (PT, `luizgabriellf/salvus`) and salvflow (BR, `luizgabriellf/salvus-br`) share.

## In scope
- Motion tokens: durations, easings and `prefers-reduced-motion` handling (`tokens.css`).
- Motion primitives: enter/exit, skeleton, number count-up, route transition, change highlight (`lufia-design-system/motion`).
- The `lufia-verify-motion` gate and the motion rules (`docs/MOTION.md`, derived from salvflow's `FLOW_MOTION.md`).

## Out of scope
Brand colors, fonts, logos and product components. Each app keeps its own.

## Consuming it
The package ships TypeScript source; there is no build step. In each app:

```jsonc
// package.json
"@lufia/design-system": "^0.1.0"
```
```js
// next.config: transpilePackages: ["@lufia/design-system"] // only until the build step lands
```
Pin to a tag. To ship a change, bump the version, tag it, then bump the tag in both apps.
Published on public npm (see docs/STANDARDS.md §8).
