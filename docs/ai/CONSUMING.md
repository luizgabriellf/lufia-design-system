# Consuming @lufia/design-system

How to use the package from an application. This is the guide an agent should read before it writes UI with these
components. For one component, read its spec in `docs/ai/components/<Name>.md` (or `components.json` for the typed API).

## Install

npm publishing is on hold. Install from a git tag; the package builds itself on install:

```bash
npm install github:luizgabriellf/lufia-design-system#<latest-tag>
```

Use the latest release tag listed in the changelog. Peer dependencies: React 19 and React DOM 19.

## Set up once, at the root of the app

```tsx
import "@lufia/design-system/tokens.css";
import "@lufia/design-system/themes/default.css";
```

- Light and dark follow `prefers-color-scheme`. Force one with `data-lufia-mode="light"` or `"dark"` on `<html>`.
- Pick a named theme with `data-lufia-theme="<name>"`.
- A brand is a CSS file in the consuming app that defines the semantic `--lufia-color-*` properties (and, optionally,
  `--lufia-font-family-*`). Do not fork components to rebrand.
- Wrap the app in `LufiaProvider` to set the link component (for client-side routing) and the aria-only labels.

```tsx
import { LufiaProvider } from "@lufia/design-system/components/LufiaProvider";
```

## Importing

- Import each component from its own subpath: `@lufia/design-system/components/<Name>`. Hooks live in the same place
  (`@lufia/design-system/components/useDismiss`).
- Motion primitives come from `@lufia/design-system/motion`.
- Token data is available as `@lufia/design-system/tokens` (typed map) and `@lufia/design-system/tokens.json`.
- The root export `@lufia/design-system` re-exports everything, but the subpaths keep bundles small.

## Live Storybook MCP for local agents

The official Storybook MCP addon is enabled for the development server:

```bash
npm run storybook
# Connect an MCP-capable agent to http://127.0.0.1:6006/mcp
```

Use `docs-list` and `docs-show` to discover components, real prop APIs and documented examples. The MCP dev toolset also supports Storybook development flows. The `test-run` toolset is intentionally disabled until an addon-vitest integration is configured and verified. Never connect a development MCP endpoint to an untrusted public network.

The GitHub Pages documentation remains **static**: it serves the machine-readable Lufia files at `/components.json` and the separate Storybook-native manifest at `/manifests/components.json`, but **not** `/mcp`. To connect a remote agent, run a trusted compatible MCP host rather than treating GitHub Pages as a live server.

## Coding agents: version-matched lookup

The installed package ships the AI docs of **its own version** (`node_modules/@lufia/design-system/dist/ai/`: `components.json`, one
spec per component, `llms.txt`) and a `lufia-ai` command that reads them offline, with no server and no network. Prefer it to
the published site, which always documents the latest version.

```bash
npx lufia-ai search "searchable async select"   # ranked components for a task (--json, --limit 8)
npx lufia-ai show Combobox                      # import path, props, example, accessibility (--json)
npx lufia-ai list                               # every component
npx lufia-ai version                            # the installed version
```

`lufia-ai mcp` starts a local stdio [MCP](https://modelcontextprotocol.io) server with three read-only tools:
`search_components` (`query`, optional `limit`), `get_component` (`name`) and `list_components`. Each returns JSON text.
Register it in your agent. The package must be installed in the project, since `npx` resolves the local copy.

Claude Code, `.mcp.json` at the project root (or `claude mcp add lufia -- npx lufia-ai mcp`):

```json
{ "mcpServers": { "lufia": { "command": "npx", "args": ["lufia-ai", "mcp"] } } }
```

Cursor, `.cursor/mcp.json`:

```json
{ "mcpServers": { "lufia": { "command": "npx", "args": ["lufia-ai", "mcp"] } } }
```

VS Code (Copilot agent mode), `.vscode/mcp.json`; note the top-level key is `servers`, not `mcpServers`:

```json
{ "servers": { "lufia": { "type": "stdio", "command": "npx", "args": ["lufia-ai", "mcp"] } } }
```

The raw files are also importable, for example `@lufia/design-system/ai/components.json`.

## AI agent workflow

For coding agents, use **progressive disclosure** rather than loading the entire manifest into every prompt:

1. Start with [`llms.txt`](https://luizgabriellf.github.io/lufia-design-system/llms.txt) to select a component from its category and description.
2. Read that component's generated `/ai/components/<Name>.md` specification for the real subpath, explicit prop types, required fields, usage example and accessibility notes. Use `components.json` when structured machine-readable data is needed.
3. Never guess prop names, variants, imports or relationships from another React design system. If a native HTML prop is not explicitly shown, verify against the TypeScript declaration before using it.
4. Compare the **when to use** and **when not to use** sections of nearby alternatives before choosing. Keep text translation and brand themes in the consuming app.
5. Compile/typecheck and test the resulting UI. The static AI docs are guidance, not proof that generated JSX is correct.

The same lookup is available through `lufia-ai` above. Contributors with the repository checked out can run `npm run ai:search -- "task"` and `npm run ai:show -- Button` to retrieve only the relevant manifest data. The JSON flag (`--json`) is intended for agent tooling.

## Rules when you use components

- **Every user-facing string is a prop.** The package has no i18n. Translate in the app and pass the result in.
  Examples in the specs use plain English literals only for brevity.
- **No router inside.** Links render through the `linkComponent` given to `LufiaProvider`.
- **Server Components:** static components carry no `"use client"` and work in a Server Component. Interactive ones start with
  `"use client"`; from a Server Component, pass them only serialisable props (event handlers must come from a client
  component).
- **Style with tokens.** Use `--lufia-*` semantic custom properties in your own CSS. Never copy raw colour values and never
  read the primitive palette.
- **Respect status.** `alpha` and `beta` components may change in a minor release before 1.0. Read the changelog when you
  upgrade.
- **Accessibility is part of the API.** Icon-only controls need an accessible name; use `FormField` to wire a label, hint and error to a control;
  tone and colour never carry meaning alone. Follow the keyboard and accessibility notes in each spec.
- **Motion** follows the rules in `docs/MOTION.md`: only `transform` and `opacity`, never over 300 ms in application UI,
  and everything honours `prefers-reduced-motion`. Use the primitives from `@lufia/design-system/motion` instead of
  writing keyframes, and check your own source with the `lufia-verify-motion` CLI.

## Where things are

| Need                         | Read                                                      |
| ---------------------------- | --------------------------------------------------------- |
| Index of everything          | `llms.txt` on the documentation site                      |
| Everything in one file       | `llms-full.txt` on the documentation site                 |
| Typed API of every component | `components.json` (props, types, defaults, status)        |
| One component                | `docs/ai/components/<Name>.md`                            |
| Motion rules                 | `docs/MOTION.md`                                          |
| Live examples                | The Storybook site (the link is in the repository README) |
