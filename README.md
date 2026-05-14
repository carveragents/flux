<pre>
██████╗   ██╗       ██╗    ██╗   ██╗   ██╗
██╔════╝  ██║       ██║    ██║   ╚██╗ ██╔╝
█████╗    ██║       ██║    ██║    ╚████╔╝ 
██╔══╝    ██║       ██║    ██║    ██╔██ █╗ 
██║       ███████╗  ╚███████╔╝   ██╔╝  ██╗
╚═╝       ╚══════╝   ╚══════╝    ╚═╝   ╚═╝

Compound Engineering Framework for AI Agents
</pre>

## 🌟 Overview 

The Flux framework transforms AI-coder development through **session-based workflows** with **intelligent context priming** and **continuous self-improvement**. Every development session automatically loads the optimal model context and builds institutional knowledge that makes each subsequent session more effective.

[![FLUX Compound Engineering Framework](https://github.com/user-attachments/assets/3c624257-665e-4c8d-98e4-48377857d470)](https://www.youtube.com/watch?v=UAAv3mtX__U)

## 🧠 Core Philosophy 

#### 🤖 Intelligent Context Priming
* Automatically provide AI models with precisely the right information from your codebase and documentation, eliminating manual context management.

#### 🎯 Learning-Driven Sessions
* Structure all development work into trackable sessions with clear goals and automatic progress documentation. Each session runs in its own Git branch - the framework handles this automatically.

#### 📈 Continuous Self-Improvement
* Capture problems, solutions, and insights from every session to build a growing knowledge base that prevents repeated mistakes and accelerates future development.

## ✨ Key Features 

- **Smart Context Loading**: Automatically primes AI model context with relevant files and lessons based on session goals
- **Zero Manual Setup**: No need to explain project structure or copy-paste code snippets
- **Worktree Isolation**: Each session runs in its own isolated Git worktree — parallel sessions work without conflicts
- **Learning Capture**: Every challenge and solution becomes institutional knowledge
- **Documentation Evolution**: Project understanding improves automatically over time

## 🚀 Quick Start

> *Note: The framework works out-of-the-box with Claude Code but can be easily modified to work with other AI coding agents.*

#### 0. Installation
```bash
git clone https://github.com/carveragents/flux.git
cp -R flux/commands ~/.claude/
```

#### 1. Initialize Your Repo (One-Time Setup)
```bash
/flux:repo:init [repo_desc]
```
*Creates boilerplate files (`CLAUDE.md`, `docs/README.md`, `docs/LESSONS.md`), reads your codebase, and generates project documentation automatically*

#### 2. Start with Intelligent Context Priming
```bash
/flux:session:start fix memory leak in data processing
```
*Framework analyzes your goal, loads relevant code and docs, surfaces applicable lessons, and creates an isolated Git worktree at `.claude/worktrees/bugfix-memory-leak-data-processing` for development. Open this path in your IDE to work in the session.*

#### 3. Develop
*Develop as normal. Let AI generate code. It may encounter problems, solve as normal using human + AI mix.*

#### 4. Update and Capture Progress
```bash
/flux:session:update
```
*Updates session progress, summarizes and captures development flow*

#### 5. End with Knowledge Capture
```bash
/flux:session:end
```
*Updates lessons learned and prepares insights for future sessions*

## 📦 Commands Reference

All commands live under `commands/flux/` and are organized into three groups:

### Repo Commands

| Command | Description |
|---------|-------------|
| `/flux:repo:init [repo_desc]` | One-time setup — creates boilerplate files, reads the codebase, and generates project documentation |

### Session Commands

| Command | Description |
|---------|-------------|
| `/flux:session:start [goal]` | Start a new session with context priming and branch creation |
| `/flux:session:update` | Append a progress update to the active session |
| `/flux:session:end` | End the session with a comprehensive summary and lesson capture |
| `/flux:session:current` | Show the active session's status, duration, and recent updates |
| `/flux:session:list` | List all past and present session files |
| `/flux:session:help` | Show session command help and best practices |

### Git Commands

| Command | Description |
|---------|-------------|
| `/flux:git:commit` | Analyze changes and generate conventional commit messages with emojis; auto-splits large changes into atomic commits |
| `/flux:git:merge-cleanup [target]` | Merge work branch into target (default: main), push to origin, and delete the worktree and branch |
| `/flux:git:merge-retain [target]` | Merge work branch into target (default: main), push to origin, and stay on the work branch |

Git commands integrate seamlessly with the session workflow but are entirely optional.

> **Worktree note**: `merge-cleanup` safely handles worktree removal by first `cd`-ing to the main repo, then removing the worktree, then deleting the branch — avoiding shell CWD issues that occur when deleting the directory you're running from.

## 🔧 Extending beyond Claude Code

All logic lives in the **command contracts** (`commands/flux/{repo,session,git}/*.md`). To adapt:

- Map `allowed tools` and filesystem paths to your agent/runtime.
- Keep the **session file format** stable for portability.
- If your agent can run shell steps, branch creation and `git status` work as-is.

## 📋 Best Practices

- **Specific Goals**: Start sessions with clear, measurable objectives
- **Regular Updates**: Document progress and discoveries as they happen
- **Honest Recording**: Capture what didn't work as well as what did
- **Review Lessons**: Let the framework surface relevant insights from previous work
- **Initialize First**: Run `/flux:repo:init` once per project to set up documentation scaffolding

## 🌿 Repo layout & contributing workflow (developers)

This skill is checked into **`carveragents/flux`** and also referenced as a submodule by **`carveragents/carver-tools`** at `skills/flux`.

Recommended local layout:
```
~/work/scribble/code/repos/carver/carver-tools/   # umbrella, clone of carver-tools
  └── skills/
      └── flux/                                    # submodule = this repo
                                                   # ← edit here

~/.claude/skills/flux → (symlink) ──→ the path above
```

**To make a change:**
1. Edit files (from either the `~/.claude/...` symlink or the submodule path — same files).
2. Test locally.
3. Commit and push from inside the skill:
   ```bash
   cd ~/.claude/skills/flux
   git commit -am "feat: ..."
   git push                  # → carveragents/flux
   ```
4. If `carver-tools` consumers should pick up the change, bump the pin:
   ```bash
   cd ~/work/scribble/code/repos/carver/carver-tools
   git add skills/flux
   git commit -m "bump: flux to <short-sha>"
   git push                  # → carveragents/carver-tools
   ```

Full agent-facing notes (including pull/update behavior and common pitfalls) are in `CLAUDE.md` under **Git topology — read before pushing**.

## 🤝 Contributing 

To improve this framework, submit pull requests for better command instructions, new commands, session file formatting, and utilities for session analysis.

## 📚 References & Inspiration 

This framework was inspired by and builds upon ideas from:

- **[claude-sessions](https://github.com/iannuttall/claude-sessions)** - Session-based AI development tracking
- **[My AI Had Already Fixed the Code Before I Saw It](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)** - Compound Engineering article by [Every.to](https://every.to) on AI-assisted development workflows and the future of coding collaboration
- **[Building AI Agents that Actually Work](https://www.youtube.com/watch?v=Kf5-HWJPTIE)** - Principles for creating effective AI development workflows
- **[tevm/commit](https://github.com/evmts/tevm-monorepo/blob/main/.claude/commands/commit.md)** - Claude code git commit slash command

## ⚖️ License 

MIT License - see [LICENSE](LICENSE) file for details.

