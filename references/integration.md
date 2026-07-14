# Branch Integration

Use this workflow only when the user explicitly asks to merge. Determine up front whether
the request includes pushing and whether it includes branch/worktree cleanup.

## Preconditions

1. Resolve the current worktree, branch, requested target, and all worktrees with
   `git worktree list --porcelain`.
2. Reject detached HEAD, a source branch equal to the target, missing branches, unresolved
   conflicts, or dirty source/target worktrees.
3. Locate the worktree that has the target branch checked out. If none does, select a clean
   worktree and check out the target there. Never assume the first listed worktree is safe.
4. Verify the source branch contains the intended commits and run relevant checks before
   integration. Fetch only when required by repository policy or the user.

## Merge

From the target worktree, merge the fully qualified source branch:

```bash
git -C <target-worktree> merge --no-ff <source-branch>
```

Use the repository's required merge strategy when it differs. If a conflict occurs, stop
and report conflicted paths. Do not abort or resolve it without user direction unless the
request already granted that scope.

Run post-merge verification. Push only when requested:

```bash
git -C <target-worktree> push origin <target-branch>
```

If verification or push fails, retain the source branch and worktree.

## Retain

Report the merge commit, target status, push result, and the retained source worktree and
branch. Do not change or remove the source worktree.

## Cleanup

Cleanup is allowed only when explicitly requested and the merge and requested push have
succeeded. Ensure the source worktree is clean, then run from another worktree:

```bash
git -C <target-worktree> worktree remove <source-worktree>
git -C <target-worktree> branch -d <source-branch>
```

Use `-d`, never force deletion. Do not remove the main worktree. Report the path removal so
the user knows any editor window rooted there is stale.
