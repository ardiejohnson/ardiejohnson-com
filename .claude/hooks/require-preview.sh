#!/usr/bin/env bash
# Blocks promoting to production until the change has been previewed.
#
# Why this exists: the preview-first rule used to live only in CLAUDE.md and in
# the `promote` agent. A session doing the merge itself never encountered it,
# and the rule quietly stopped being followed. A hook binds every session.
#
# Escape hatch: prefix the command with PREVIEW_APPROVED=1 — for when Ardie has
# reviewed the preview and said ship it, or when production is broken. That is
# deliberately something that has to be typed on purpose and shows up in the
# transcript, instead of a habit nobody notices.

set -uo pipefail

payload="$(cat)"
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')"

# Explicit, auditable override.
if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])PREVIEW_APPROVED=1([[:space:]]|$)'; then
  exit 0
fi

reason=""

if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]&;|(])gh[[:space:]]+pr[[:space:]]+merge([[:space:]]|$)'; then
  reason="BLOCKED: merging a PR promotes it to production.

Hand Ardie the Vercel preview URL for this branch and wait for him to review it.
Only merge after he says so.

If he has already approved, or production is broken and this is a hotfix, re-run
the command prefixed with PREVIEW_APPROVED=1 and say in your reply that you
bypassed preview and why."
elif printf '%s' "$cmd" | grep -Eq '(^|[[:space:]&;|(])(vercel|npx[[:space:]]+vercel|[^[:space:]]*/vercel)([[:space:]]|$)' \
  && printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])--prod(uction)?([[:space:]]|$)'; then
  reason="BLOCKED: this deploys straight to production.

Deploy a preview instead (no --prod) and give Ardie the preview URL.

If he has already approved, or production is broken and this is a hotfix, re-run
the command prefixed with PREVIEW_APPROVED=1 and say in your reply that you
bypassed preview and why."
else
  exit 0
fi

jq -cn --arg r "$reason" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $r
  }
}'
exit 0
