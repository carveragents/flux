---
description: Show current session status
model: claude-haiku-4-5
---

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->

Show the current session status by:

IMPORTANT:
- All session file paths are relative to the worktree root (current working directory), e.g., `.claude/.sessions/`. Do NOT use the global `~/.claude/` directory.
- `.claude/.sessions/.current-session` is ONLY a pointer — it contains the filename of the active session file. Read the pointer, then read the named session file for content.

1. Read `.claude/.sessions/.current-session` (relative to worktree root) to get the active session filename
2. If no active session, inform user and suggest starting one
3. If active session exists, read the named session file and show:
   - Session name and filename
   - Calculate and show duration since start
   - Show last few updates
   - Show current goals/tasks
   - Remind user of available commands

Keep the output concise and informative.
