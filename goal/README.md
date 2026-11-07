# AI layer goal

This directory is an **evidence-based validation workspace**, not a claim that Lufia agents already achieve state-of-the-art results.

- AI_LAYER_REVIEW_2026-11-07.md: source-grounded snapshot, gaps and a prioritized plan.
- agent-scenarios.json: ten real-world UI tasks with expected documented props, forbidden invented props and a behavioral rubric.
- verify-ai-layer.mjs: deterministic offline guard checking the **manifest and scenario contracts**, run by npm run verify:ai-quality (and npm run check).

## Run

    npm run verify:ai-quality
    npm run verify:ai-quality -- --json

This validator does not invoke any LLM, evaluate generated code, check runtime accessibility or test a live MCP server.

## To measure actual agent quality

1. Execute each scenario without extra design-system context, with static Lufia AI docs, and with an MCP-enabled Storybook.
2. Run the same models, budgets, temperatures and prompts; repeat each condition three times.
3. Typecheck/build generated React, run accessibility and interaction tests, and review semantic tokens and prohibited or invented props.
4. Record valid-import rate, valid-prop rate, successful task completion, accessibility checks, token cost and task duration. Include failures and model versions.
5. Compare outcomes to a control and publish the raw anonymized results. **Only then** make a performance claim.

For MCP: a GitHub Pages static site does not serve a live MCP endpoint. The Storybook addon exposes /mcp in a running dev server; public hosting requires a separate compatible MCP host or a provider such as Chromatic.

Research:
- https://storybook.js.org/docs/ai
- https://storybook.js.org/docs/ai/mcp/sharing
- https://storybook.js.org/docs/ai/best-practices
- https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html
