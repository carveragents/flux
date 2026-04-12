---
allowed-tools: Read, Write, Edit, Grep, Bash(echo:*), Bash(cat:*)
description: Update the current development session
model: claude-haiku-4-5
---

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->


Update the current development session by:

IMPORTANT:
- All session file paths are relative to the worktree root (current working directory), e.g., `.claude/.sessions/`. Do NOT use the global `~/.claude/` directory.
- `.claude/.sessions/.current-session` is ONLY a pointer — it contains the filename of the active session file (e.g., `2026-03-05-2300-feat-session-name.md`). NEVER write session content to `.current-session`.

1. Read `.claude/.sessions/.current-session` (relative to worktree root) to get the active session filename
2. If no active session, inform user to start one with `/session:start`
3. If session exists, append the update to the named session file (e.g., `.claude/.sessions/YYYY-MM-DD-HHMM-session-name.md`) with:
   - Current timestamp
   - The update: summarize recent activities
   - Git status summary:
     * Files added/modified/deleted (from `git status --porcelain`)
     * Current branch and last commit
   - Todo list status:
     * Number of completed/in-progress/pending tasks
     * List any newly completed tasks
   - Any issues encountered
   - Solutions implemented
   - Code changes made

Keep updates concise but comprehensive for future reference.

Example format:
```
### Update - 2025-06-16 12:15 PM

**Summary**: Implemented user authentication

**Git Changes**:
- Modified: app/middleware.ts, lib/auth.ts
- Added: app/login/page.tsx
- Current branch: main (commit: abc123)

**Todo Progress**: 3 completed, 1 in progress, 2 pending
- ✓ Completed: Set up auth middleware
- ✓ Completed: Create login page
- ✓ Completed: Add logout functionality

**Details**: [user's update or automatic summary of the session]
```
