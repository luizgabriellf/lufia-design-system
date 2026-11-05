# Changesets

Every pull request that changes the published package adds a changeset: run `npm run changeset`, pick the bump
(`patch`, `minor`, `major`) and write a one-line, user-facing summary. The release workflow turns pending changesets into
a "Version packages" pull request that updates `CHANGELOG.md` and `package.json`; merging it creates the git tag.
Docs-only and tooling-only pull requests do not need one.
