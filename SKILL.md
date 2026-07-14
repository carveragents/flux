---
name: flux
description: Use when initializing engineering context, tracking a development session, preparing atomic Git commits, or integrating and cleaning up a Git worktree branch with the Flux workflow.
---

# Flux

Use Flux to preserve project context and make Git operations repeatable across Agent
Skills-compatible coding agents. Keep all project state vendor-neutral: use `.flux/`,
never a runtime-specific directory.

## Select The Workflow

Read only the reference needed for the request:

- Initialize or refresh project context: [references/repository.md](references/repository.md)
- Start, update, inspect, list, or end a session: [references/sessions.md](references/sessions.md)
- Prepare one or more commits: [references/commits.md](references/commits.md)
- Merge a work branch, optionally removing it: [references/integration.md](references/integration.md)

If the request is ambiguous, state which workflow you inferred before changing files or
Git state. Never infer permission to commit, push, merge, delete a branch, or remove a
worktree from a request that only asks for analysis or session tracking.

## Shared Rules

1. Resolve the repository root with `git rev-parse --show-toplevel`. Stop if the operation
   requires Git and the current directory is not in a repository.
2. Read the repository's agent instructions and current Git status before making changes.
3. Preserve unrelated user changes. Do not reset, discard, overwrite, or stage them.
4. Treat `.flux/sessions/.current-session` as a filename pointer only. Never store session
   content in it.
5. Run the relevant verification before committing or integrating. Report checks that
   could not run.
6. Stop on conflicts, failed verification, failed pushes, malformed session state, or an
   unexpected branch/worktree. Explain the exact state; do not improvise cleanup.

## Session Helper

Use `scripts/session.py` for session state transitions instead of hand-writing the active
pointer. Run `python3 scripts/session.py --help` from this skill directory for commands.
The helper never edits source files, creates worktrees, commits, pushes, or merges.

Legacy projects may contain `.claude/.sessions/`. Do not silently combine it with `.flux/`.
When Flux is first used, offer to copy the legacy session Markdown files into
`.flux/sessions/`; leave the original files unchanged.
