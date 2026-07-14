# Development Sessions

Session files live in `<worktree-root>/.flux/sessions/`. Use native agent file operations
for every session read and write; assume no language runtime or Flux helper exists.

The active pointer `.flux/sessions/.current-session` is either empty or contains exactly
one session filename. A valid value is a basename ending in `.md`; it contains no path
separator, `.` or `..` segment, or surrounding content. The named file must exist. Treat
any other non-empty value as malformed state and stop without repairing it.

Session mutations are single-writer. Never mutate session state while another agent is
known to be mutating the same worktree. Native operations cannot detect or prevent an
unknown concurrent writer. Immediately before a write, re-read the pointer and target file
and confirm they still match the state already inspected.

## Start

1. Require a concrete goal. Derive a 1-64 character session name matching
   `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
2. Read `docs/README.md`, `docs/LESSONS.md`, repository instructions, and goal-relevant
   code. Report the most relevant context before creating state.
3. Validate the current worktree's session state before creating any branch or worktree.
   Prefer an isolated worktree for substantial work unless the user or repository policy
   says otherwise:

   ```bash
   git worktree add -b flux/<session-name> <worktree-path> HEAD
   ```

   Place the worktree outside the repository working tree. Check that neither the branch
   nor path exists first. If the agent cannot enter a new worktree, report its path and do
   not claim the current process moved there. Validate session state again in the selected
   worktree; if it is invalid, stop and report the created worktree without removing it.
4. In the selected worktree, create `.flux/sessions/` and an empty pointer with native
   file operations when missing. Validate existing state and stop if a session is active.
5. Use the most precise truthful local timestamp available in the agent context: either
   `YYYY-MM-DD-HHMMSS` or `YYYY-MM-DD`. Create `<timestamp>-<session-name>.md`. Never
   invent a time or overwrite a path; add a numeric suffix if it already exists.
   Write:
   - title: `<session-name>`
   - overview: local start time, absolute worktree, branch, and baseline HEAD
   - goal
   - empty `## Progress` section
6. Re-read the new session file. Only after it is complete, write its basename plus a
   newline to `.current-session`, then re-read the pointer to verify activation.
7. Report the session file, branch, and worktree. Starting a session does not itself grant
   permission to implement the goal.

## Update

1. Read and validate `.current-session`, then read the named session file. Stop if none is
   active.
2. Inspect `git status --short`, the current branch, commits since the recorded baseline
   HEAD, completed work, verification, issues, and decisions since the previous update.
3. Re-read the pointer and session immediately before editing. Append a timestamped
   `### Update` section. Keep it factual and concise. Distinguish completed, in-progress,
   and pending work, then verify the resulting file.

## Current

Read and validate the pointer. If active, read the named file and report its goal, start
time, recent updates, branch/worktree, and remaining work. Do not create state or dump the
entire file unless requested.

## List

Read `.flux/sessions/` without creating it. Present session Markdown files newest first
and mark the valid active session. If no session directory exists, say so.

## End

1. Read and validate the pointer and active session, then inspect the final Git state and
   relevant verification.
2. Append a `## Final Summary` containing duration, changed files, commits, completed and
   incomplete tasks, key decisions, problems and mitigations, configuration or dependency
   changes, verification, and follow-up work.
3. Consolidate at most three durable lessons into `docs/LESSONS.md`. Merge overlaps rather
   than appending duplicates, and add the session link under `# Sessions`.
4. Update `docs/README.md` only when documentation was added, removed, or renamed.
5. Re-read the pointer and active file. Only after the summary and lesson updates succeed,
   clear `.current-session` to an empty file and verify it is empty.
6. Ending a session does not imply committing, merging, pushing, or deleting its worktree.

## Legacy Data

If `.claude/.sessions/` exists and `.flux/sessions/` does not, ask before migration. Copy
only session Markdown files and a valid active pointer. Never delete the legacy directory.
