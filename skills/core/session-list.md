# Flux — Session List

## Step 1: Read Sessions Directory

> Session files live inside each worktree at `[worktree_path]/.flux/.sessions/`. Running this from the main repo will show an empty directory — run it from inside the active worktree.

List all `.md` files in `.flux/.sessions/` (excluding `.current-session`).

If the directory doesn't exist or contains no `.md` files, inform the user no sessions exist here and remind them to run from inside the worktree.

## Step 2: Parse Session Files

For each session file, extract:
- Session ID (date/time from filename)
- Session name
- Goal (from `Goal:` field in header)
- Status: active if filename matches `.current-session`, otherwise completed

## Step 3: Display Sessions

Present in reverse chronological order (newest first):

```
📚 Development Sessions

🟢 ACTIVE
2026-04-12-1430-feat-user-auth
   Goal: Implement user authentication system

✅ COMPLETED
2026-04-11-0930-bugfix-memory-leak
   Goal: Fix memory leak in data processing

---
Total: [count] sessions
Use {{CMD_SESSION_CURRENT}} to see active session details
Use {{CMD_SESSION_START}} to begin a new session
```
