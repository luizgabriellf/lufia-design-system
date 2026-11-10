# Governance

## Roles

- **Maintainer:** [@luizgabriellf](https://github.com/luizgabriellf). Reviews and merges pull requests, cuts releases, enforces the
  [Code of Conduct](CODE_OF_CONDUCT.md), and owns the roadmap.
- **Contributors:** anyone who opens an issue, an RFC or a pull request.

More maintainers may be added by invitation after sustained, high-quality contributions. This document will be updated when
that happens.

## How decisions are made

- **Small changes** (bug fixes, docs, tests): a pull request and one review.
- **New components, public API changes, new tokens or themes:** a short **RFC issue** first (see [CONTRIBUTING](CONTRIBUTING.md)).
  The maintainer decides after discussion, aiming for consensus; silence is not consent, so allow a few days.
- **Significant or hard-to-reverse decisions** (token format, distribution, primitives library, breaking changes) are recorded
  as an **Architecture Decision Record** in [`docs/adr/`](docs/adr). An ADR has a status: `Proposed`, `Accepted`,
  `Superseded` or `Rejected`. Accepted ADRs are not edited; they are superseded by a new one.

## Review policy

The policy for `main` is a pull request, passing checks and a linear history, with **0 required approvals**. Branch
protection is applied by the owner with `scripts/setup-repo-settings.sh`; until then the policy is followed by convention.
Zero approvals is intentional: the
project has a single maintainer, and a required approval nobody else can give would only block work. Review still happens
(CI, the pull request checklist, and the maintainer's own read-through); more approvals will be required once there is a
second maintainer.

## Releases and versioning

Semantic versioning, driven by changesets. Breaking changes are major versions with a migration note. Deprecations last at
least one minor version and log a development warning. Release pull requests ("Version packages") are opened by the release
workflow with `GITHUB_TOKEN`, which does not trigger CI; the maintainer merges them using the admin bypass on the `main` ruleset. See [CONTRIBUTING](CONTRIBUTING.md#versioning-and-deprecation).

## Changing this document

Through a pull request, announced in an issue, with the maintainer's approval.
