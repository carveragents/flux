# Development Sessions

Session files live in `<worktree-root>/.flux/sessions/`. The active pointer contains only
the active session filename. Run the helper using its absolute path when the current
directory is a project worktree:

```bash
python3 <flux-skill>/scripts/session.py --root <worktree-root> <command>
```

## Start

1. Require a concrete goal. Derive a short lowercase hyphenated session name.
2. Read `docs/README.md`, `docs/LESSONS.md`, repository instructions, and goal-relevant
   code. Report the most relevant context before creating state.
3. Prefer an isolated worktree for substantial work unless the user or repository policy
   says otherwise:

   ```bash
   git worktree add -b flux/<session-name> <worktree-path> HEAD
   ```

   Place the worktree outside the repository working tree. Check that neither the branch
   nor path exists first. If the runtime cannot enter a new worktree, report its path and
   do not claim the current process moved there.
4. In the selected worktree, run:

   ```bash
   python3 <flux-skill>/scripts/session.py --root <worktree-root> start \
     --name <session-name> --goal "<goal>"
   ```

5. Report the session file, branch, and worktree. Starting a session does not itself grant
   permission to implement the goal.

## Update

1. Run `active` to resolve the session file. Stop if none is active.
2. Inspect `git status --short`, the current branch, commits since the recorded baseline
   HEAD, completed work,
   verification, issues, and decisions since the previous update.
3. Append a timestamped `### Update` section. Keep it factual and concise. Distinguish
   completed, in-progress, and pending work.

## Current

Run `current`, read the returned file, and report its goal, start time, recent updates,
branch/worktree, and remaining work. Do not dump the entire file unless requested.

## List

Run `list`. Present sessions newest first and mark the active session. If no session
directory exists, say so without creating one.

## End

1. Resolve the active file and inspect the final Git state and relevant verification.
2. Append a `## Final Summary` containing duration, changed files, commits, completed and
   incomplete tasks, key decisions, problems and mitigations, configuration or dependency
   changes, verification, and follow-up work.
3. Consolidate at most three durable lessons into `docs/LESSONS.md`. Merge overlaps rather
   than appending duplicates, and add the session link under `# Sessions`.
4. Update `docs/README.md` only when documentation was added, removed, or renamed.
5. Only after the summary and lesson updates succeed, run `end` to clear the pointer.
6. Ending a session does not imply committing, merging, pushing, or deleting its worktree.

## Legacy Data

If `.claude/.sessions/` exists and `.flux/sessions/` does not, ask before migration. Copy
only session Markdown files and a valid active pointer. Never delete the legacy directory.
