# Flux — Git Merge and Retain

## Step 1: Check Session Pointer

Read `.flux/.sessions/.current-session`.

If non-empty: **STOP** — "Active session detected. Run `{{CMD_SESSION_END}}` before merging." Do not proceed.

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

## Step 5: Merge and Push

Always run merge and push from the main worktree using `git -C`:
```bash
git -C [main_worktree] merge [work_branch] --no-ff -m "Merge [work_branch] into [merge_target]"
git -C [main_worktree] push origin [merge_target]
```

(Always use `git -C [main_worktree]` — avoids the constraint that git checkout cannot switch to a branch checked out in another worktree.)

## Step 6: Confirm

Do NOT delete the worktree or branch.

Inform the user:
- Work merged into `[merge_target]` and pushed
- Still on `[work_branch]` — worktree retained for continued work
