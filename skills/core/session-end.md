# Flux — Session End

## Step 1: Verify Active Session

> `.flux/.sessions/.current-session` is a pointer — it contains ONLY the session filename (e.g., `2026-03-05-2300-feat-name.md`). Read it to get the filename, then open the named file. Never write session content to `.current-session`. All paths are relative to the worktree root.

Read `.flux/.sessions/.current-session` to get the active session filename.

If empty or missing, inform the user there is no active session to end.

## Step 2: Read Session History

Read the complete named session file to understand all work performed.

Calculate session duration from the `Started` field in the file header.

## Step 3: Generate Session Summary

Get git stats: `git diff --stat` and
`git log --oneline $(git merge-base HEAD main)..HEAD`
(substitute `master` if `main` does not exist).

Append to the named session file:

```markdown
## Session Summary

**Duration**: [HH:MM]
**Status**: Completed

### Git Summary
- Files changed: [N]
- [change-type]: [filename]
- Commits: [N]
- Final status: [clean / N uncommitted changes]

### Accomplishments
- [bullet per accomplishment]

### Features Implemented
- [bullet per feature, or "None"]

### Problems and Solutions
- **Problem**: [description]
  **Solution**: [description]

### Breaking Changes
- [bullet, or "None"]

### Dependencies Changed
- Added: [list, or "None"]
- Removed: [list, or "None"]

### Configuration Changes
- [bullet, or "None"]

### Deployment Steps Taken
- [bullet, or "None — not deployed this session"]

### Lessons Learned
- [bullet per lesson]

### What Wasn't Completed
- [bullet, or "Nothing — all goals met"]

### Tips for Future Work
- [bullet per tip]
```

## Step 4: Capture Lessons Learned

Extract lessons from the summary. Select **at most 3**. Criteria:
- The user intervened to correct or redirect the agent during the session
- The lesson applies across projects — discard project-specific lessons
- Not already covered in `docs/LESSONS.md`

Update `docs/LESSONS.md` (in the main repo root, shared across all worktrees; the path resolves correctly from inside a worktree):

1. Append the session label to the `# SESSIONS` section
2. For each selected lesson:
   - Normalize the text (lowercase, strip punctuation)
   - Check existing lessons for >60% word overlap — if similar, merge rather than add
   - If unique, add as a new entry in this format:
     ```
     - **Problem**: [one sentence]
       **Mitigation**: [one sentence]
       **Learned**: [one sentence — the transferable principle]
     ```

## Step 5: Update docs/README.md

If any new files were added to `docs/` during this session, update `docs/README.md` to reference them. Reference only — do not duplicate content.

## Step 6: Clear Session Pointer

Write an empty string to `.flux/.sessions/.current-session` (clear it, do not delete the file).

## Step 7: Confirm

Inform the user:
- Session has been documented
- Lessons captured in `docs/LESSONS.md`
- Session pointer cleared
- Remind them to commit their work with `{{CMD_GIT_COMMIT}}` if not already done
