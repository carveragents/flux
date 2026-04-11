---
description: Show current session status
model: claude-haiku-4-5
---

> **Note**: This is the Claude Code interface for Flux.
> For agent-agnostic use across Amazon Q, Cursor, Copilot, and Windsurf, install the MCP server: `npx flux-mcp`
> Session files are stored in `.flux/.sessions/` when using the MCP server.

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->

Show the current session status by:

1. Check if `.flux/.sessions/.current-session` exists
2. If no active session, inform user and suggest starting one
3. If active session exists:
   - Show session name and filename
   - Calculate and show duration since start
   - Show last few updates
   - Show current goals/tasks
   - Remind user of available commands

Keep the output concise and informative.
