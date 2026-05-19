# Flux AgentSkills

Agent-specific skill files for the Flux compound engineering framework.
Install once per machine. Works in every project automatically.

---

## How It Works

Each agent has a native mechanism for loading reusable instructions. Flux uses
the correct native format for each — not a workaround.

| Agent | Native mechanism | Install path | Invocation |
|---|---|---|---|
| Claude Code | Slash command files | `~/.claude/commands/flux/` | `/flux:session:start` |
| Amazon Q | Prompt files | `~/.aws/amazonq/prompts/` | `@session-start` |
| Cursor | Skills | `~/.cursor/skills/flux-*/` | `/flux-session-start` |
| Windsurf | Workflows | `~/.codeium/windsurf/windsurf/workflows/` | `/flux-session-start` |
| Copilot | Prompt files + Instructions | `%APPDATA%/Code/User/prompts/` | `/flux-session-start` |

**Key facts verified by live testing:**
- Amazon Q: prompts must be **flat files** in the root of `~/.aws/amazonq/prompts/` — subdirectories are not loaded
- Amazon Q: prompt files need an imperative opening line to execute rather than be treated as passive context
- Cursor: uses `.mdc` extension with `alwaysApply: true` for rules, but **Skills** (`~/.cursor/skills/`) are the correct native mechanism — invokable with `/skill-name`
- Windsurf: **Workflows** (`~/.codeium/windsurf/windsurf/workflows/`) are the correct native mechanism — invokable with `/workflow-name`; `global_rules.md` is a passive fallback only
- Copilot: uses two layers — `.prompt.md` files for invocable `/` commands, `.instructions.md` for always-on passive context

---

## Installation

### Quick Install (All Detected Agents)

```bash
cd flux
python skills/install.py --agent all
```

This detects which agents are installed on your machine and installs Flux skills for all of them (including Claude Code).

### Install for Specific Agent

```bash
python skills/install.py --agent cursor
python skills/install.py --agent amazonq
python skills/install.py --agent windsurf
python skills/install.py --agent copilot
python skills/install.py --agent claude
```

### Check Installation Status

```bash
python skills/install.py --list
```

Shows which agents are detected and when Flux skills were last installed.

### Preview Changes

```bash
python skills/install.py --agent cursor --dry-run
python skills/install.py --agent cursor --diff
```

---

### Install Paths

The installer writes directly to agent install locations:

| Agent | Install path (Unix) | Install path (Windows) |
|---|---|---|
| Claude Code | `~/.claude/commands/flux/` | `%USERPROFILE%\.claude\commands\flux\` |
| Amazon Q | `~/.aws/amazonq/prompts/` | `%USERPROFILE%\.aws\amazonq\prompts\` |
| Cursor | `~/.cursor/skills/` | `%USERPROFILE%\.cursor\skills\` |
| Windsurf | `~/.codeium/windsurf/windsurf/workflows/` | `%USERPROFILE%\.codeium\windsurf\windsurf\workflows\` |
| Copilot | `~/Library/Application Support/Code/User/prompts/` | `%APPDATA%\Code\User\prompts\` |

---

## Project Setup (all agents)

After installing skills, initialize each repo once:

| Agent | Command |
|---|---|
| Claude Code | `/flux:repo:init` |
| Amazon Q | `@repo-init` |
| Cursor | `/flux-repo-init` |
| Windsurf | `/flux-repo-init` |
| Copilot | `/flux-repo-init` |

This creates `docs/`, `.flux/.sessions/`, and generates project documentation.
No agent-specific files are created in the project — any agent with Flux skills
installed can work on any Flux-initialized repo.

---

## Session Workflow (all agents)

| Operation | Claude Code | Amazon Q | Cursor / Windsurf / Copilot |
|---|---|---|---|
| Init repo | `/flux:repo:init` | `@repo-init` | `/flux-repo-init` |
| Start session | `/flux:session:start [goal]` | `@session-start [goal]` | `/flux-session-start` |
| Update session | `/flux:session:update` | `@session-update` | `/flux-session-update` |
| End session | `/flux:session:end` | `@session-end` | `/flux-session-end` |
| Current session | `/flux:session:current` | `@session-current` | `/flux-session-current` |
| List sessions | `/flux:session:list` | `@session-list` | `/flux-session-list` |
| Commit | `/flux:git:commit` | `@git-commit` | `/flux-git-commit` |
| Merge + cleanup | `/flux:git:merge-cleanup` | `@git-merge-cleanup` | `/flux-git-merge-cleanup` |
| Merge + retain | `/flux:git:merge-retain` | `@git-merge-retain` | `/flux-git-merge-retain` |

---

## File Structure

```
skills/
  FLUX-WORKFLOW.md                    <- canonical spec (not installed)
  install.py                          <- installer script
  core/                               <- canonical content for generic agents
    repo-init.md
    session-start.md
    session-update.md
    session-end.md
    session-current.md
    session-list.md
    session-help.md
    git-commit.md
    git-merge-cleanup.md
    git-merge-retain.md
  core-claude/                        <- Claude-enhanced commands with Claude-specific features
    repo/init.md
    session/start.md, update.md, end.md, current.md, list.md, help.md
    git/commit.md, merge-cleanup.md, merge-retain.md
  agents/                             <- per-agent adapter configs
    claude/agent.toml
    cursor/agent.toml
    windsurf/agent.toml
    copilot/agent.toml
    amazonq/agent.toml
  copilot/
    instructions.md                   <- hand-authored, installed to prompts/flux.instructions.md
```

Skill files are generated on-demand and installed directly to agent locations.
No intermediate delivery files are committed to the repo.

---

## Modifying Skills

### Source of truth

```
skills/
  core/           <- canonical workflow content for generic agents (edit these)
    repo-init.md
    session-start.md
    ...
  core-claude/    <- Claude-enhanced commands with Claude-specific features (edit these)
    repo/init.md
    session/start.md
    ...
  agents/         <- per-agent adapter configs (edit these)
    claude/agent.toml
    cursor/agent.toml
    windsurf/agent.toml
    copilot/agent.toml
    amazonq/agent.toml
  install.py      <- installer script
```

### Making a logic change

**For generic agents (Amazon Q, Cursor, Windsurf, Copilot):**
1. Edit the relevant file in `skills/core/`
2. Run: `python skills/install.py --agent all`
3. Test in your agent

**For Claude Code:**
1. Edit the relevant file in `skills/core-claude/`
2. Run: `python skills/install.py --agent claude`
3. Test in Claude Code

### Adding a new agent

1. Research the agent's native skill format (file structure, front matter schema, invocation)
2. Create `skills/agents/<name>/agent.toml` - copy an existing config as a starting point
3. Add `[install]` section with platform-specific paths
4. Run: `python skills/install.py --agent <name> --force`
5. Test
6. Add install instructions to this README

### Updating after git pull

```bash
git pull
python skills/install.py --agent all
```

The installer detects which agents are on your machine and updates only those.

### Variables available in core files

| Token | Example value (Cursor) | Example value (Amazon Q) |
|---|---|---|
| `{{IDE_NAME}}` | `Cursor` | `the IDE` |
| `{{CMD_REPO_INIT}}` | `/flux-repo-init` | `@repo-init` |
| `{{CMD_SESSION_START}}` | `/flux-session-start` | `@session-start` |
| `{{CMD_SESSION_UPDATE}}` | `/flux-session-update` | `@session-update` |
| `{{CMD_SESSION_END}}` | `/flux-session-end` | `@session-end` |
| `{{CMD_SESSION_CURRENT}}` | `/flux-session-current` | `@session-current` |
| `{{CMD_SESSION_LIST}}` | `/flux-session-list` | `@session-list` |
| `{{CMD_GIT_COMMIT}}` | `/flux-git-commit` | `@git-commit` |
| `{{CMD_GIT_MERGE_CLEANUP}}` | `/flux-git-merge-cleanup` | `@git-merge-cleanup` |
| `{{CMD_GIT_MERGE_RETAIN}}` | `/flux-git-merge-retain` | `@git-merge-retain` |

All `CMD_*` tokens are derived from `cmd_prefix` in `agent.toml` + the operation slug.

---

## Lessons Learned from Live Testing

These were discovered during actual installation and testing — not from docs.

| Agent | Issue | Fix |
|---|---|---|
| Amazon Q | Subdirectories in `prompts/` are silently ignored | Install all files flat to root |
| Amazon Q | Prompt files treated as passive context, not executed | Open each file with `Execute the following instructions now.` |
| Cursor | `~/.cursor/rules/*.mdc` not reliably loaded globally | Use Skills (`~/.cursor/skills/`) instead |
| Windsurf | `global_rules.md` is passive only | Use Workflows (`windsurf/workflows/`) instead |
| Copilot | `codeGeneration.instructions` setting with `file:` reference deprecated | Use `prompts/` directory with `.instructions.md` extension |
| Copilot | `.instructions.md` alone can't run commands (passive only) | Add `.prompt.md` files with `mode: agent` for invocable commands |
