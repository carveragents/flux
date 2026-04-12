---
allowed-tools: Read, Write, Edit, Grep, Bash(git merge:*), Bash(git push:*), Bash(git worktree list:*), Bash(git rev-parse:*), Bash(git -C:*)
description: Merge the current work branch into target branch, push to origin, back to work branch
argument-hint: [target_branch]
model: claude-haiku-4-5
---

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->

## Set value for merge_target

If `target_branch` is not specified, then: 
	`merge_target` = main (or master) branch
Else:
	`merge_target` = `target_branch`

## Detect worktree context

1. Get current worktree root: `git rev-parse --show-toplevel` → `current_worktree`
2. Get main worktree path:
   `git worktree list --porcelain | grep "^worktree " | head -1 | awk '{print $2}'` → `main_worktree`
3. Get current branch name: `git rev-parse --abbrev-ref HEAD` → `work_branch`

## Merge and Back

0. If there are uncommitted changes on the current work branch, STOP and inform the user. Don't do anything else.

Otherwise:
1. Merge work branch into `merge_target` from the main worktree:
   `git -C <main_worktree> merge <work_branch> --no-ff -m "Merge <work_branch> into <merge_target>"`
   (Always use `git -C <main_worktree>` — avoids the constraint that git checkout
   cannot switch to a branch checked out in another worktree.)
2. Push: `git -C <main_worktree> push origin <merge_target>`
3. Do NOT delete the worktree or branch.
   Inform the user the merge is complete and they can continue working in `current_worktree` on `work_branch`.
