# Flux — Session Help

Show help for the session management system:

## Session Management Commands

The session system helps document development work for future reference.

### Available Commands:

- `{{CMD_SESSION_START}}` - Start a new session with the stated goal
- `{{CMD_SESSION_UPDATE}}` - Update current session with summary of activities
- `{{CMD_SESSION_END}}` - End session with comprehensive summary
- `{{CMD_SESSION_LIST}}` - List all session files
- `{{CMD_SESSION_CURRENT}}` - Show current session status
- `{{CMD_SESSION_HELP}}` - Show this help

### How It Works:

1. Sessions are markdown files in `.flux/.sessions/` inside the active worktree
2. Files use `YYYY-MM-DD-HHMM-name.md` format
3. Only one session can be active at a time
4. Sessions track progress, issues, solutions, and learnings

### Best Practices:

- Start a session when beginning significant work
- Update regularly, especially at important checkpoints
- End with thorough summary for future reference
- Review past sessions before starting similar work

### Example Workflow:

```
{{CMD_SESSION_START}} refactor the auth flow for better code re-use
{{CMD_SESSION_UPDATE}}
.
.
.
{{CMD_SESSION_UPDATE}}
{{CMD_SESSION_END}}
```
