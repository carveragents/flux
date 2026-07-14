# Atomic Commits

Use this workflow only when the user has asked to create commits.

1. Read repository instructions and run `git status --short --branch`.
2. Inspect staged and unstaged diffs, including untracked filenames. Check for generated
   files, credentials, tokens, private keys, environment files, and unrelated changes.
3. Preserve an existing staged selection. If nothing is staged, group only task-related
   files into the smallest coherent commit or commits. Never use `git add -A` without first
   verifying every path belongs to the requested change.
4. Run the relevant tests, linters, type checks, or build before committing. Stop on a
   failure caused by the proposed commit. Report unrelated pre-existing failures.
5. Split changes when each group is independently useful and leaves the repository in a
   valid state. Do not split implementation from tests that verify it.
6. Stage explicit paths and inspect `git diff --cached --check` and
   `git diff --cached --stat`. Review the full staged diff before every commit.
7. Use `<type>(<optional-scope>): <imperative summary>` with a subject no longer than 72
   characters. Follow repository conventions for types and emoji; otherwise use plain
   Conventional Commits. Do not add agent attribution or co-authorship unless requested.
8. Commit, then report each commit hash and subject plus the remaining Git status.

Common types are `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, and
`chore`. A commit message must describe the staged diff, not the broader session goal.
