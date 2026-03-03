---
allowed-tools: Read, Write, Edit, Grep, Bash(git merge:*), Bash(git push:*), Bash(git checkout:*)
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

## Merge and Back

0. If there are uncommitted changes on the current work branch, STOP and inform the user. Don't do anything else.

Otherwise:
1. Merge the current work branch into `merge_target`
2. Push `merge_target` to origin
3. Switch back to current work branch
