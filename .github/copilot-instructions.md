# Copilot instructions

The canonical instructions for coding agents are in [AGENTS.md](../AGENTS.md). Read it before changing anything. Summary:

- This is a public, product-agnostic design system. Never name or identify consuming apps, their domains or internal paths;
  say "consuming apps".
- No i18n or app imports in components; every user-facing string is a prop; styles use only `--lufia-*` semantic tokens in
  CSS Modules; respect `prefers-reduced-motion`.
- Run `npm run typecheck`, `npm run lint`, `npm run test` and `npm run verify:ai-docs` before proposing a change.
- Do not edit generated files in `docs/ai/`; run `npm run build:ai-docs`.
- Conventional Commits, header at most 72 characters, no AI trailers.
