# Flux — Session Current

## Step 1: Check for Active Session

> `.flux/.sessions/.current-session` is a pointer — it contains ONLY the session filename. Read it to get the filename, then open the named file. Never write content to `.current-session`. All paths are relative to the worktree root.

Read `.flux/.sessions/.current-session` to get the active session filename.

If empty or missing, inform the user no session is active and suggest `{{CMD_SESSION_START}}`.

## Step 2: Read Named Session File

Read the named session file (e.g., `.flux/.sessions/YYYY-MM-DD-HHMM-session-name.md`).

## Step 3: Display Session Information

```
📋 Active Session: [session_name]
🎯 Goal: [goal from session file]
📁 Worktree: [Worktree field from session file]
⏱️  Started: [Started field from session file]
⏳ Duration: [calculate elapsed time from Started to now]

Recent Updates:
[show last 2-3 progress entries]

---
Use {{CMD_SESSION_UPDATE}} to add progress
Use {{CMD_SESSION_END}} to complete the session
```

Calculate duration from the `Started` field to current time.
