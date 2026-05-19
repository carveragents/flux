# Flux Workflow — Canonical Specification

> This file is the source of truth for the Flux workflow.
> All per-agent skill files implement this spec.
> If a skill file conflicts with this document, this document wins.
> This file is NOT installed into user projects.

---

## 1. Core Concepts

### Session
A session is a bounded unit of development work. It has a goal, a start time, a series of progress updates, and a closing summary. It lives in a single markdown file. One session is active at a time per worktree.

### The `.flux/` Namespace
`.flux/` is the framework's canonical directory. It is not named after any agent. All session files and pointers live under `.flux/`. The one exception is Claude Code's `EnterWorktree` tool, which places worktrees under `.claude/worktrees/` by its own convention — this is acceptable because the pointer is the contract, not the path.

### The Pointer Contract
`.flux/.sessions/.current-session` contains the **filename only** (not full path) of the active session file. Empty = no active session. It is a pointer — never write session content to it. All agents read this file to find the active session, then open the named file for content.

---

## 2. Directory Layout

Inside every worktree:
```
<worktree-root>/
  .flux/
    .sessions/
      .current-session          ← filename pointer only
      <session-id>-<name>.md    ← session content lives here
  docs/                         ← in main repo root, shared across worktrees
    README.md
    LESSONS.md
```

`docs/` lives in the main repo root and is shared across all worktrees. When
writing to `docs/LESSONS.md` or `docs/README.md` from inside a worktree, the
path resolves correctly because worktrees share the main repo's file tree.
Agents should be explicit about this: they are writing to the main repo, not
the worktree.

Worktree locations:
- Non-Claude agents: `.flux/worktrees/<session-name>/`
- Claude Code (EnterWorktree): `.claude/worktrees/<session-name>/`

---

## 3. Session File Format

```markdown
# <session-name> — <session-id>

**Flux-Version**: 1
**Worktree**: <path-to-this-worktree>
**Started**: <ISO-8601>
**Goal**: <goal verbatim>

## Goals

- <goal>

## Progress

```

- `Flux-Version: 1` — required on all new session files. Files without it are treated as version 0.
- `Worktree` — the path the agent used to create the worktree. The framework follows this path; it never assumes a fixed prefix.
- `session-id` format: `YYYY-MM-DD-HHMM`
- `session-name` format: lowercase slug, hyphens only, max 40 chars

---

## 4. Session Lifecycle

```
session:start
  → require goal (stop and ask if not provided)
  → guard: verify running from main repo root (current_worktree == main_worktree) — stop if not
  → generate session_name slug and session_id timestamp
  → create worktree (agent-specific command)
  → create .flux/.sessions/ inside worktree
  → write session file with Flux-Version: 1 header
  → write filename to .current-session pointer
  → context priming: read docs/README.md as index → follow relevant links only
  → surface lessons: read docs/LESSONS.md → filter by goal keywords
  → report to user
  → STOP — wait for explicit instruction before any work

session:update
  → read .current-session to get filename
  → open named session file
  → append timestamped update block

session:end
  → read .current-session to get filename
  → open named session file
  → append comprehensive summary block
  → get git stats: git diff --stat and git log --oneline $(git merge-base HEAD main)..HEAD
    (substitute master if main does not exist)
  → extract ≤3 lessons → dedup against docs/LESSONS.md → write
  → update docs/README.md if new docs/ files were added
  → clear .current-session (empty string, do not delete)

merge-cleanup  (only after session:end)
  → verify .current-session is empty — stop if not
  → verify no uncommitted changes — stop if any
  → detect worktree context (see Section 6)
  → merge via git -C <main_worktree>
  → push via git -C <main_worktree>
  → remove worktree and delete branch

merge-retain  (only after session:end)
  → verify .current-session is empty — stop if not
  → verify no uncommitted changes — stop if any
  → detect worktree context (see Section 6)
  → merge via git -C <main_worktree>
  → push via git -C <main_worktree>
  → stay on work branch
```

---

## 5. Docs Contract

**`docs/README.md`** — reference index only. Points to other files. Never duplicates content from them. Updated at `session:end` only when new files were added to `docs/` or existing ones changed.

**`docs/LESSONS.md`** — institutional knowledge base. Two sections:
- `# SESSIONS` — append-only log of session labels
- `# LESSONS` — deduplicated, consolidated lessons

Lesson format — one sentence each:
```
- **Problem**: <what went wrong or was unclear>
  **Mitigation**: <what was done to address it>
  **Learned**: <the transferable principle>
```

Dedup rules:
- Normalize text: lowercase, strip punctuation, collapse whitespace
- If word overlap with existing lesson >60%: merge, do not add
- If unique: add as new entry
- Select at most 3 lessons per session
- Discard lessons specific to this project only — lessons must be transferable

---

## 6. Git Workflow

### Worktree context detection (exact sequence)
```bash
git rev-parse --show-toplevel                                              # → current_worktree
git worktree list --porcelain | grep "^worktree " | head -1 | awk '{print $2}'  # → main_worktree
git rev-parse --abbrev-ref HEAD                                            # → work_branch
# in_worktree = (current_worktree != main_worktree)
```

### Merge pattern
Always use `git -C <main_worktree>` — never run merge or checkout from inside the worktree. Running git operations from inside a worktree operates on that worktree's branch context, not the main repo's. This is the most common failure mode.

```bash
git -C <main_worktree> merge <work_branch> --no-ff -m "Merge <work_branch> into <merge_target>"
git -C <main_worktree> push origin <merge_target>
```

### Cleanup (merge-cleanup only)
If `in_worktree` is true:
```bash
cd <main_worktree>
git worktree remove <current_worktree>
git branch -d <work_branch>
```
If `in_worktree` is false (running from main repo directly):
```bash
git checkout <merge_target>
git branch -d <work_branch>
```

---

## 7. Commit Workflow

1. Check staged files. If none staged: `git add -A`.
2. If specific files already staged: commit only those.
3. `git diff --staged` — understand what is changing.
4. Analyze diff for logical groupings: different concerns, different change types, different file patterns.
5. If multiple distinct concerns: split into atomic commits, one per concern.
6. For each commit: `<emoji> <type>: <imperative description>` — max 72 chars first line.
7. Never add co-authorship footers.

Emoji/type mapping (core set):

| Emoji | Type | Use |
|---|---|---|
| ✨ | feat | New feature |
| 🐛 | fix | Bug fix |
| 📝 | docs | Documentation |
| ♻️ | refactor | Refactoring |
| ✅ | test | Tests |
| 🔧 | chore | Tooling, config |
| ⚡️ | perf | Performance |
| 🚀 | ci | CI/CD |
| 💄 | style | Formatting |
| 🔥 | fix | Remove code/files |
| 🚑️ | fix | Critical hotfix |
| 💥 | feat | Breaking change |
| 🏗️ | refactor | Architecture change |
| 🔒️ | fix | Security fix |
| ➕ | chore | Add dependency |
| ➖ | chore | Remove dependency |
| 🚨 | fix | Linter warnings |
| 🩹 | fix | Non-critical fix |

---

## 8. Context Priming Strategy

At `session:start`, do not read all docs and all lessons blindly. The correct sequence:

1. Read `docs/README.md` as an index. Identify sections relevant to the session goal.
2. Follow only the relevant links. Do not read every file under `docs/`.
3. Read `docs/LESSONS.md`. Filter lessons by keyword overlap with the goal. Surface only relevant ones.
4. Report findings to user.
5. Stop. Do not begin work until the user gives explicit instruction.

Context consumption must be proportional to the session goal, not to the total size of the knowledge base.

---

## 9. What This Spec Does NOT Define

- Agent-specific syntax (front matter, slash command format, rules file format)
- MCP tool call points (those belong in the skill files)
- Project-specific content (filled in by `repo:init` at setup time)
- Worktree creation command (agent-specific, defined in each skill file)
