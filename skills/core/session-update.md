# Flux — Session Update

## Step 1: Verify Active Session

> `.flux/.sessions/.current-session` is a pointer — it contains ONLY the session filename. Read it to get the filename, then open the named file. Never write content to `.current-session`. All paths are relative to the worktree root.

Read `.flux/.sessions/.current-session` to get the active session filename.

If empty or missing, inform the user and suggest starting one with `{{CMD_SESSION_START}}`.

## Step 2: Gather Update Information

Get current git status:
```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
git log -1 --format="%h"
```

Ask the user what progress to record, or auto-summarize recent activity.

## Step 3: Append to Named Session File

Append to the named session file (e.g., `.flux/.sessions/YYYY-MM-DD-HHMM-session-name.md`):

```markdown
### Update — [YYYY-MM-DD HH:MM]

**Summary**: [brief description of what happened since last update]

**Git Changes**:
- Modified: [files]
- Added: [files]
- Deleted: [files]
- Branch: [branch] (commit: [short-hash])

**Todo Progress**: [N completed, N in-progress, N pending]
- ✓ [newly completed task]
- → [in-progress task]

**Issues & Solutions**:
- [issue encountered and how it was resolved, or "None"]

**Details**: [user's update text or auto-summary of recent activity]
```

Keep updates concise. The session file is a log, not a narrative.
If no explicit todo list exists for the session, omit the Todo Progress section.

## Step 4: Confirm

Confirm the update was recorded and remind the user:
- Add more updates with `{{CMD_SESSION_UPDATE}}`
- End the session with `{{CMD_SESSION_END}}`
