# Flux — Session Start

## Step 1: Validate Session Goal

If no session goal was provided, STOP and ask the user to specify the session goal. DO NOT PROCEED without it.

Once the session goal is specified, generate a `session_name` — a succinct lowercase slug, hyphens only, max 40 chars.

Examples:
- "fix bugs in data identifier generation" → `bugfix-data-identifiers`
- "implement feature for crawling arbitrary sources" → `feat-arbitrary-crawl-sources`
- "refactor authentication module" → `refactor-auth-module`

## Step 1b: Guard — verify main repo root

Run:
```bash
git rev-parse --show-toplevel
git worktree list --porcelain | grep "^worktree " | head -1 | awk '{print $2}'
```

Assign `current_worktree` and `main_worktree` from the outputs.

If `current_worktree != main_worktree`: **STOP** — "You are inside an existing worktree. Run `{{CMD_SESSION_START}}` from the main repo root at `[main_worktree]`."

## Step 2: Create Git Worktree

Generate a `session_id` using format: `YYYY-MM-DD-HHMM`

From the **main repo root**, create an isolated worktree for this session:
```bash
git worktree add .flux/worktrees/[session_name] -b [session_name]
```

`worktree_path` = `.flux/worktrees/[session_name]`

Create the sessions directory inside the worktree:
```bash
mkdir -p [worktree_path]/.flux/.sessions
```

Inform the user:
- The session runs inside the worktree at `[worktree_path]`
- Open `[worktree_path]` in {{IDE_NAME}} to work in this session

## Step 3: Initialize Session File

Create the session file at `[worktree_path]/.flux/.sessions/[session_id]-[session_name].md`:

```markdown
# [session_name] — [session_id]

**Flux-Version**: 1
**Worktree**: [worktree_path]
**Started**: [ISO-8601 timestamp]
**Goal**: [session goal verbatim]

## Goals

- [session goal]

## Progress

```

Write `[session_id]-[session_name].md` (filename only, not full path) to `[worktree_path]/.flux/.sessions/.current-session`.

> `.current-session` is a pointer — it must contain ONLY the session filename. Never write session content to it.

## Step 4: Load Context

1. Read `docs/README.md` as an index. Identify sections relevant to the session goal. Follow only the relevant links — do not read all files under `docs/`.
2. Read `docs/LESSONS.md`. Surface only the lessons whose keywords overlap with the session goal.

Summarize what was found. Note where relevant information lives for use during the session.

## Step 5: Confirm and Wait

Report:
- Session name and worktree path
- Relevant context and lessons surfaced

Remind the user:
- Update progress with `{{CMD_SESSION_UPDATE}}`
- End session with `{{CMD_SESSION_END}}`

**NEVER** start working on the session goal automatically. Wait for explicit instruction.
