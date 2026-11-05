# @lufia/design-system

An accessible, themeable React design system. It provides design tokens, components, motion primitives and the quality gates that keep them consistent across products.

## What's inside

- **Design tokens:** colour, spacing, radius, typography, elevation, z-index and motion, exposed as `--lufia-*` CSS custom properties.
- **Components:** React 19 components styled with CSS modules and safe to use with Server Components. Every user-facing string comes in through props, so the package carries no i18n of its own.
- **Motion:** duration and easing tokens, primitives that respect `prefers-reduced-motion`, and a `lufia-verify-motion` gate.

## Theming

The package ships a neutral default theme. A product applies its brand by mapping its own values onto the `--lufia-*` semantic tokens.

## Install

npm publishing is on hold. Until then, install from a git tag:

```jsonc
// package.json
"@lufia/design-system": "github:luizgabriellf/lufia-design-system#v0.1.0"
```

```js
// next.config.js: needed only until the build step lands
transpilePackages: ["@lufia/design-system"];
```

## Project docs

- [Roadmap](docs/ROADMAP.md)
- [Standards checklist](docs/STANDARDS.md)

## License

[MIT](LICENSE)
