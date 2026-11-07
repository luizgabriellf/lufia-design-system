# Lufia AI layer: assessment — 2026-11-07

## Verdict

**Strong machine-readable documentation foundation; not yet independently validated as state of the art.** No model-based evaluation was run in this review. The numbers below are a repository snapshot, not an observed agent success rate.

## Evidence from main

- 66 manifest entries; 242 declared exports; 452 explicit component prop entries.
- 343 of 452 props have a JSDoc description (**75.9%**); 109 lack one.
- All 66 manifest entries are currently labeled beta.
- One type-only directory (ChartKit) has no standalone usage page / stories. The other 65 runtime entries have docs, example, usage decision notes and story references.
- Deterministic TypeScript + MDX + story extraction exists in scripts/ai/build-manifest.mjs.
- Committed docs/ai/components.json, per-component Markdown specs, llms.txt and llms-full.txt; drift detection in scripts/ai/verify.mjs; publication by scripts/ai/publish.mjs.
- Accessibility and motion have their own unit tests and CI checks, but those are not a direct measure of generated code by agents.
- Storybook v10.6.6 uses react-docgen-typescript. As inspected, .storybook/main.ts does not enable componentsManifest or register @storybook/addon-mcp. The package does not declare that addon.

## Priority gaps

| Priority | Gap | Why it matters | Acceptance criterion |
| --- | --- | --- | --- |
| P0 | No controlled agent evaluation | It is impossible to prove the AI layer prevents hallucinated imports/props or improves workflows | Run the ten scenarios in three conditions and repeat at least three times; publish compile, a11y, prop accuracy, tokens and time |
| P0 | No Storybook MCP bridge | Static docs are helpful but cannot give agents native Storybook docs-show, story authoring or test-run tools | Add matching @storybook/addon-mcp, enable componentsManifest, test docs-list/docs-show/test-run locally and document how consumers connect |
| P0 | Confuse static GitHub Pages with a live MCP host | Pages can serve manifests but not an HTTP MCP service | Keep static docs on Pages; explicitly choose dev-server, self-hosted @storybook/mcp or Chromatic for live MCP |
| P1 | 109 undocumented explicit props | An agent can know the type but not the intended semantics | Add meaningful JSDoc to high-traffic props first; increase coverage to >=95% with a ratcheting gate |
| P1 | No model-based anti-hallucination regression suite | The current test checks union aliases and status but not generated UI behavior | Test valid imports/props, required behaviors and accessibility on real agent outputs; compare to a control |
| P1 | Weakly structured choice guidance | Agents need explicit when-to-use / when-not-to-use for similar primitives | Verify UI decisions between Button/Link, Select/Combobox, Modal/ConfirmDialog, Card/DetailSectionCard |
| P2 | Context efficiency unmeasured | Large full-context docs can add tokens without improving correctness | Compare targeted retrieval against llms-full and measure context cost / success |
| P2 | MCP security model not documented | Tool descriptions, external docs and write/test tools expand the attack surface | Least privilege, no secrets in manifests, approval for write operations, pinned deps and untrusted-content boundaries |

## Proposed evaluation design

Run ten prompts from agent-scenarios.json with these conditions: A) public README alone, B) current AI docs / component manifest, C) Storybook MCP with native manifest. Use same baseline applications, prompts, models, budgets and 3 independent repetitions. Start with one agent/model for a feasible pilot, then replicate on multiple agents.

**Score each trial** using automated lint / typecheck / build, invalid component and prop detection against the TypeScript APIs, accessibility checks, integration tests and normalized token and time costs. Use blind review only for aesthetic or qualitative judgments. Do not count a static manifest validation as an LLM performance result.

Suggested target thresholds (goals, not measurements): >=98% valid component and prop use; >=90% successful scenarios including accessibility gates; meaningful lift over baseline without unacceptable token/time overhead. Document any skipped tests.

## Implementation constraints

- Maintain product-agnostic public repository hygiene.
- Keep the existing deterministic manifest as a distinct capability; do not silently replace it with Storybook's experimental schema.
- Storybook 10.6 native AI features are still marked preview. Pin addon versions and validate Storybook build and CI before shipping.
- GitHub Pages is static: it cannot host the local addon dev server's /mcp path.
- This PR adds a static quality gate + a versioned agent scenario suite. It **does not** deliver or pretend to have executed the runtime MCP / agent benchmark.

## References

- Storybook AI: https://storybook.js.org/docs/ai
- Storybook MCP: https://storybook.js.org/docs/ai/mcp/overview
- Storybook MCP sharing: https://storybook.js.org/docs/ai/mcp/sharing
- Storybook AI best practices: https://storybook.js.org/docs/ai/best-practices
- MCP security: https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
