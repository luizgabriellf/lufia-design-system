# Security policy

## Supported versions

This project is pre-1.0. Only the latest released minor version receives security fixes.

| Version      | Supported |
| ------------ | --------- |
| latest `0.x` | Yes       |
| older `0.x`  | No        |

Once 1.0 is released, the latest major and the previous major (for 6 months after a new major ships) are supported.

## Reporting a vulnerability

Please **do not open a public issue**. Report privately through GitHub Security Advisories:

1. Open the repository's [**Security** tab](https://github.com/luizgabriellf/lufia-design-system/security).
2. Choose [**Report a vulnerability**](https://github.com/luizgabriellf/lufia-design-system/security/advisories/new).
3. Describe the issue, the affected version, and steps to reproduce.

You can expect an acknowledgement within 5 working days and a status update within 14 days. Valid reports are fixed in a
private branch, released with an advisory, and credited to the reporter unless you prefer otherwise.

## Scope

This is a front-end component and token library. Relevant issues include cross-site scripting through a component's props,
unsafe handling of user-supplied content, and weaknesses in the build or release supply chain. Accessibility defects are
bugs, not vulnerabilities: file them as regular issues.

## Supply chain

Dependencies are updated by Dependabot, installs use `npm ci` against a committed lockfile, GitHub Actions are pinned to
commit SHAs with least-privilege permissions, and CodeQL and OpenSSF Scorecard run on a schedule.
