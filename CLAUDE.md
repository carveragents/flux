# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flux is a Claude Code workflow framework — a collection of skill commands that standardize development workflows through session management, git automation, and repository initialization. Commands are markdown files with YAML front matter that are loaded as skills in the Claude Code harness.

## Git topology — read before pushing

This skill is one repo nested inside another via a submodule. Knowing where you are matters.

- **Standalone repo:** `github.com/carveragents/flux` — canonical home of the skill's code and history. All skill commits land here.
- **Aggregator repo:** `github.com/carveragents/carver-tools` — references this skill as a submodule at `skills/flux`. Pinned to a specific SHA.
- **Local working copy:** `~/work/scribble/code/repos/carver/carver-tools/skills/flux/` — the submodule checkout. Edit here.
- **Symlink for the loader:** `~/.claude/skills/flux` → the working copy above. Don't edit `~/.claude/...` directly; it dereferences to the same files.

### Making a skill change

1. Edit files from either the `~/.claude/...` symlink or the submodule path (identical files).
2. Test locally.
3. Commit and push from inside the submodule:
   ```bash
   cd ~/.claude/skills/flux
   git status                    # branch shows `main`, remote `origin/main`
   git commit -am "feat: ..."
   git push                      # → carveragents/flux
   ```
4. **The aggregator is now stale.** To advance the pin (only needed if carver-tools consumers should pick up the change):
   ```bash
   cd ~/work/scribble/code/repos/carver/carver-tools
   git add skills/flux
   git commit -m "bump: flux to $(git -C skills/flux rev-parse --short HEAD)"
   git push                      # → carveragents/carver-tools
   ```

### When pulling

- **From the skill repo:** `git pull` inside the symlink/submodule path. Normal Git.
- **From the aggregator:** after `git pull` in `carver-tools`, also run `git submodule update` to move the working tree to the new SHA.

### Don't do this

- Don't `git clone` the standalone repo into a fresh directory and edit there — the symlink still points at the submodule checkout and your edits will be invisible to Claude Code.
- Don't commit aggregator-level changes inside the skill submodule.
- Don't push the symlink itself — it's local and not tracked by either repo.

## Architecture

Each command is a standalone `.md` file structured as:
- **YAML front matter**: declares `allowed-tools`, `model`, `argument-hint`, and `description`
- **Markdown body**: step-by-step instructions executed by the Claude agent

Commands are organized by domain:
- `repo/` — repository initialization (`init.md`)
- `git/` — commit creation, branch merging with/without worktree cleanup
- `session/` — full lifecycle of a development session (start → update → end, plus list/current/help)

### Session System

Sessions are stored in the adopting repo at `.claude/.sessions/YYYY-MM-DD-HHMM-<session-name>.md`. The active session is tracked via `.claude/.sessions/.current-session` (contains only the filename pointer, never session content). Each session runs inside an isolated git worktree created by `EnterWorktree`.

### Worktree Pattern

`session/start.md` creates a worktree via `EnterWorktree` with the session name. Merge commands detect whether they're running inside a worktree and handle cleanup accordingly. `merge-cleanup.md` removes the worktree and branch after merging; `merge-retain.md` merges and returns without cleanup.

### Knowledge Preservation

`session/end.md` extracts lessons from the session and consolidates them (max 3 per session) into `docs/LESSONS.md` in the adopting repo. `docs/README.md` is kept as a reference-only pointer document — it links to other docs but never duplicates content from them.

## Models Used

| Command | Model |
|---------|-------|
| `repo/init.md` | `opus` (complex codebase analysis) |
| All others | `claude-haiku-4-5` (fast, routine tasks) |

## Skill Command Reference

Invoked in Claude Code as `/flux:<domain>:<command>`:

| Skill | Argument | Purpose |
|-------|----------|---------|
| `/flux:repo:init` | `[repo_desc]` | Initialize repo with docs/, LESSONS.md, CLAUDE.md |
| `/flux:session:start` | `[session_goal]` | Start session, create worktree, write session file |
| `/flux:session:update` | — | Append progress to active session file |
| `/flux:session:end` | — | Finalize session, update LESSONS.md and docs/README.md |
| `/flux:session:current` | — | Show active session status |
| `/flux:session:list` | — | List all session files |
| `/flux:session:help` | — | Print session system documentation |
| `/flux:git:commit` | — | Smart commit with conventional format + emoji |
| `/flux:git:merge-cleanup` | `[target_branch]` | Merge → push → remove worktree and branch |
| `/flux:git:merge-retain` | `[target_branch]` | Merge → push → stay on work branch |

## Editing Commands

When modifying command files:
- The YAML front matter controls which tools the agent may call — keep `allowed-tools` minimal and explicit (e.g., `Bash(git commit:*)` not `Bash`)
- Steps are executed sequentially by the agent; use numbered headings (`# STEP 1`, `# STEP 2`) for multi-phase commands
- The comment block at the top of each file (`<!-- Some parts... -->`) flags Claude Code–specific behavior for portability
- `git/commit.md` explicitly prohibits adding Claude co-authorship footers — preserve this constraint in any edits
