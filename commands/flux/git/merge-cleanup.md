---
allowed-tools: Read, Write, Edit, Grep, Bash(git merge:*), Bash(git push:*), Bash(git worktree list:*), Bash(git rev-parse:*), Bash(git -C:*), Bash(git worktree remove:*), Bash(git checkout:*), Bash(git branch:*)
description: Merge the current work branch into target branch, push to origin, and cleanup work branch
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
3. If `current_worktree` == `main_worktree`: `in_worktree` = false. Else: `in_worktree` = true.
4. Get current branch name: `git rev-parse --abbrev-ref HEAD` → `work_branch`

## Merge and Cleanup

0. If there are uncommitted changes on the current work branch, STOP and inform the user. Don't do anything else.

Otherwise:
1. Merge work branch into `merge_target` from the main worktree:
   `git -C <main_worktree> merge <work_branch> --no-ff -m "Merge <work_branch> into <merge_target>"`
2. Push: `git -C <main_worktree> push origin <merge_target>`
3. If `in_worktree` is true:
   a. Change to main repo: `cd <main_worktree>`
   b. Remove the worktree: `git worktree remove <current_worktree>`
   c. Delete the branch: `git branch -d <work_branch>`
   If `in_worktree` is false (running from main repo directly):
   a. Switch to merge_target: `git checkout <merge_target>`
   b. Delete the work branch: `git branch -d <work_branch>`
4. Inform the user the merge is complete and the work branch/worktree has been cleaned up.
   Note: if the user's IDE was open in the worktree directory, that window is now stale — they should switch it to `<main_worktree>`.
