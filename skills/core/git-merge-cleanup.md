# Flux — Git Merge and Cleanup

## Step 1: Check Session Pointer

Read `.flux/.sessions/.current-session`.

If non-empty: **STOP** — "Active session detected. Run `{{CMD_SESSION_END}}` before cleanup." Do not proceed.

## Step 2: Verify Clean State

Run `git status --porcelain`.

If any uncommitted changes: **STOP** — "Uncommitted changes detected. Run `{{CMD_GIT_COMMIT}}` first."

## Step 3: Determine Target Branch

If no target branch was specified, use `main` (fallback: `master`).

## Step 4: Detect Worktree Context

Run these commands exactly:
```bash
git rev-parse --show-toplevel
git worktree list --porcelain | grep "^worktree " | head -1 | awk '{print $2}'
git rev-parse --abbrev-ref HEAD
```

Assign:
- `current_worktree` = output of first command
- `main_worktree` = output of second command
- `work_branch` = output of third command
- `in_worktree` = true if `current_worktree != main_worktree`, else false

## Step 5: Merge and Push

Always run merge and push from the main worktree using `git -C`:
```bash
git -C [main_worktree] merge [work_branch] --no-ff -m "Merge [work_branch] into [merge_target]"
git -C [main_worktree] push origin [merge_target]
```

## Step 6: Cleanup

If `in_worktree` is true:
```bash
cd [main_worktree]
git worktree remove [current_worktree]
git branch -d [work_branch]
```

If `in_worktree` is false (running from main repo directly):
```bash
git checkout [merge_target]
git branch -d [work_branch]
```

## Step 7: Confirm

Inform the user:
- Work merged into `[merge_target]` and pushed
- Worktree and branch cleaned up
- Note: if the IDE was open in the worktree directory, that window is now stale — switch to `[main_worktree]`
