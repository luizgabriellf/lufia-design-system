# 0002. Distribution: git tag now, npm on hold

- **Status:** Accepted
- **Date:** 2026-11-05

## Context

Consuming apps need versioned installs of the package. Publishing to the public npm registry as `@lufia/design-system` is the
intended end state (the `@lufia` scope leaves room for `@lufia/tokens`, `@lufia/icons`), but the owner has put publishing on hold.

## Decision

- Until the hold is lifted, apps install a git tag: `"@lufia/design-system": "github:luizgabriellf/lufia-design-system#vX.Y.Z"`.
- The package builds itself on install through the `prepare` script, so a tag needs no committed `dist/`.
- Releases are driven by **changesets**: a workflow opens a "Version packages" pull request and tags the release on merge. It does
  not publish.
- `publishConfig` (public, provenance) stays in `package.json` so that enabling npm later needs only a trusted-publishing setup
  and a publish step.
- The package ships ESM, `.d.ts` and CSS Modules per file, with `sideEffects` limited to CSS.

## Consequences

- Positive: no registry account needed, the release flow is already exercised, switching to npm is a small change.
- Negative: installs from git run a build (slower, devDependencies must be available during install), and there is no
  registry-side provenance or download statistics until npm publishing starts.

## Alternatives considered

- Publish to npm immediately: on hold by the owner.
- Commit `dist/` on a release branch: noisy history; `prepare` is simpler.
- Private registry: unnecessary for a public package.
