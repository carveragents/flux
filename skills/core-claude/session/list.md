---
description: List all development sessions for project
model: claude-haiku-4-5
---

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->

List all development sessions by:

1. Check if `.claude/.sessions/` directory exists
2. List all `.md` files (excluding hidden files and `.current-session`)
3. For each session file:
   - Show the filename
   - Extract and show the session title
   - Show the date/time
   - Show first few lines of the overview if available
4. If `.claude/.sessions/.current-session` exists, highlight which session is currently active
5. Sort by most recent first

Present in a clean, readable format.
