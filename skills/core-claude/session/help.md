---
description: Session commands help
model: claude-haiku-4-5
---

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->

Show help for the session management system:

## Session Management Commands

The session system helps document development work for future reference.

### Available Commands:

- `/session:start [goal]` - Start a new session with the stated goal
- `/session:update` - Update current session with summary of activities
- `/session:end` - End session with comprehensive summary
- `/session:list` - List all session files
- `/session:current` - Show current session status
- `/session:help` - Show this help

### How It Works:

1. Sessions are markdown files in `.claude/.sessions/`
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
/session:start refactor the auth flow for better code re-use
/session:update
.
.
.
/session:update
/session:end
```
