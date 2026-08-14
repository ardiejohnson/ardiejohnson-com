---
name: fewer-prompts
description: How to stop Claude Code (Terminal) from asking "Do you want to proceed?" on every safe command, without disabling safety wholesale. Use when Ardie is annoyed by repeated permission prompts during agent runs (e.g. new-app scanning conventions).
---

# Fewer permission prompts in Terminal Claude Code

Those "Do you want to proceed?" prompts are Claude Code's guard against an agent being tricked into a destructive command. In Ardie's own repos, running his own agency on trusted tasks, the risk is low — so tuning them down is reasonable. The goal is to auto-approve the *safe, boring* commands while still stopping on genuinely risky ones. Do not just disable all safety.

## The right long-term fix: a user-level allowlist (once, applies everywhere)
Put an allowlist in `~/.claude/settings.json` on the Mac so every project inherits it — old repos, new repos, everything. Easiest: ask Terminal Claude Code to write it:

> Add a permissions allowlist to my user settings at ~/.claude/settings.json: auto-accept these read-only bash commands — echo, ls, cat, find, grep, head, tail, wc, pwd, cd, tree, git log, git status, git diff, git show — plus npm, npx, git add/commit/push/pull/checkout/branch, and gh. Keep sudo, force-push, rm -rf, and reading .env blocked.

The shape it writes (for reference):

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(echo:*)", "Bash(ls:*)", "Bash(cat:*)", "Bash(find:*)", "Bash(grep:*)",
      "Bash(head:*)", "Bash(tail:*)", "Bash(wc:*)", "Bash(pwd)", "Bash(cd:*)", "Bash(tree:*)",
      "Bash(git log:*)", "Bash(git status:*)", "Bash(git diff:*)", "Bash(git show:*)",
      "Bash(npm:*)", "Bash(npx:*)", "Bash(gh:*)",
      "Bash(git add:*)", "Bash(git commit:*)", "Bash(git push:*)", "Bash(git pull:*)",
      "Bash(git checkout:*)", "Bash(git branch:*)"
    ],
    "deny": [
      "Bash(sudo:*)", "Bash(git push --force:*)", "Bash(git push -f:*)",
      "Bash(git reset --hard:*)", "Bash(rm -rf:*)", "Read(.env)", "Read(.env.*)"
    ]
  }
}
```

New apps already get this at the **project** level — `app-template` ships a `.claude/settings.json` with the same allowlist, so template-born repos barely prompt. The user-level file is what covers older repos and cross-repo work.

## Quick levers
- **This session only:** press **Shift+Tab** to cycle the permission mode to auto-accept (shown at the bottom of the screen).
- **Full walk-away for one trusted run:** launch with `claude --dangerously-skip-permissions`, hand the agent the task, and leave. Right tool for "build a new app while I'm away," in your own repo. Honest caveat: it approves everything, so use it only for trusted tasks in trusted repos.

## Known limitation
A compound command like `cd ~/Documents/other-repo && git log` can still prompt even with the allowlist, because Claude Code is extra-cautious about `cd`-then-git (a hostile repo could hide git hooks). For guaranteed zero interruptions on a trusted run, use `--dangerously-skip-permissions`.
