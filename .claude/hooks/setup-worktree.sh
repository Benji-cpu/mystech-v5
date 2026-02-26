#!/bin/bash
# Copies .env files into new Claude Code worktrees so the dev server
# can find DATABASE_URL and other environment variables.
# Registered as a WorktreeCreate hook in .claude/settings.local.json.

INPUT=$(cat)
WORKTREE_DIR=$(echo "$INPUT" | jq -r '.cwd')
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

for envfile in .env .env.local; do
  if [ -f "$REPO_ROOT/$envfile" ]; then
    cp "$REPO_ROOT/$envfile" "$WORKTREE_DIR/$envfile"
  fi
done
exit 0
