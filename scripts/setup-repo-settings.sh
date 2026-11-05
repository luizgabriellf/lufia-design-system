#!/usr/bin/env bash
# One-off repository configuration through the GitHub API. Run by the maintainer, once, with an authenticated `gh`
# that has admin rights on the repository. Safe to re-run (idempotent).
#
#   scripts/setup-repo-settings.sh [owner/repo]
set -euo pipefail

REPO="${1:-luizgabriellf/lufia-design-system}"
BRANCH="main"

echo "Configuring ${REPO}"

# --- Repository: squash-only merges, delete head branches, features -------------------------------------------------
gh api -X PATCH "repos/${REPO}" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F allow_auto_merge=true \
  -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE \
  -f squash_merge_commit_message=PR_BODY \
  -F has_wiki=false \
  -F has_projects=false >/dev/null
echo "  merge settings: squash only, delete branch on merge"

# --- Security features ----------------------------------------------------------------------------------------------
gh api -X PUT "repos/${REPO}/private-vulnerability-reporting" >/dev/null
echo "  private vulnerability reporting: on"

gh api -X PATCH "repos/${REPO}" --input - >/dev/null <<'JSON'
{
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  }
}
JSON
echo "  secret scanning + push protection: on"

gh api -X PUT "repos/${REPO}/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/${REPO}/automated-security-fixes" >/dev/null
echo "  Dependabot alerts + security updates: on"

# --- GitHub Pages from Actions --------------------------------------------------------------------------------------
if gh api "repos/${REPO}/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/${REPO}/pages" -f build_type=workflow >/dev/null
else
  gh api -X POST "repos/${REPO}/pages" -f build_type=workflow >/dev/null
fi
echo "  Pages: source = GitHub Actions"

# --- Ruleset protecting main ----------------------------------------------------------------------------------------
# PRs are required but 0 approvals (solo maintainer); required checks, linear history, no force pushes or deletions.
# The admin role may bypass through a pull request only: the "Version packages" PR is opened with GITHUB_TOKEN, which does
# not trigger CI, so its required checks never report and the maintainer merges it using the bypass.
EXISTING="$(gh api "repos/${REPO}/rulesets" --jq '.[] | select(.name=="protect-main") | .id' || true)"
PAYLOAD="$(cat <<JSON
{
  "name": "protect-main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }
  ],
  "conditions": { "ref_name": { "include": ["refs/heads/${BRANCH}"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "Verify" },
          { "context": "Conventional Commits title" },
          { "context": "Analyze" }
        ]
      }
    }
  ]
}
JSON
)"
if [ -n "${EXISTING}" ]; then
  echo "${PAYLOAD}" | gh api -X PUT "repos/${REPO}/rulesets/${EXISTING}" --input - >/dev/null
else
  echo "${PAYLOAD}" | gh api -X POST "repos/${REPO}/rulesets" --input - >/dev/null
fi
echo "  ruleset protect-main: PR required (0 approvals), required checks, linear history, no force push"

# --- Labels (from .github/labels.yml) -------------------------------------------------------------------------------
if command -v node >/dev/null 2>&1 && [ -f .github/labels.yml ]; then
  node --input-type=module -e '
    import { readFileSync } from "node:fs";
    // Minimal parser for the flat list in labels.yml (name / color / description).
    const labels = []; let cur = null;
    for (const line of readFileSync(".github/labels.yml", "utf8").split("\n")) {
      const item = line.match(/^- name: "?(.*?)"?$/);
      if (item) { cur = { name: item[1] }; labels.push(cur); continue; }
      const kv = line.match(/^\s+(color|description): "?(.*?)"?$/);
      if (kv && cur) cur[kv[1]] = kv[2];
    }
    for (const l of labels) console.log(JSON.stringify(l));
  ' | while read -r label; do
    name="$(echo "${label}" | node -p 'JSON.parse(require("fs").readFileSync(0,"utf8")).name')"
    enc="$(node -p 'encodeURIComponent(process.argv[1])' "${name}")"
    if gh api "repos/${REPO}/labels/${enc}" >/dev/null 2>&1; then
      echo "${label}" | gh api -X PATCH "repos/${REPO}/labels/${enc}" --input - >/dev/null
    else
      echo "${label}" | gh api -X POST "repos/${REPO}/labels" --input - >/dev/null
    fi
  done
  echo "  labels: synced from .github/labels.yml"
fi

echo "Done. Required status check names must match the workflow job names; verify them after the first CI run."
