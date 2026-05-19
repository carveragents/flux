# Flux — Git Commit

## What This Does

1. Checks which files are staged with `git status`
2. If 0 files are staged, automatically adds all modified and new files with `git add`
3. If specific files are already staged, only commits those files
4. Reads the current session history to understand the context of the changes
5. Performs a `git diff` to understand what changes are being committed
6. Analyzes the session history and diff to determine if multiple distinct logical changes are present
7. If multiple distinct changes are detected, suggests breaking the commit into multiple smaller commits
8. For each commit, creates a commit message using emoji conventional commit format

DO NOT add co-authorship footers.

## Best Practices

- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Conventional commit format**: `<emoji> <type>: <description>`
- **Present tense, imperative mood**: "add feature" not "added feature"
- **Concise first line**: Keep under 72 characters

## Step 1: Check Git Status

Run `git status` to see what's staged.

- If 0 files staged: run `git add -A` to stage all changes
- If files are staged: only commit those files

## Step 2: Understand Context

1. Read `.flux/.sessions/.current-session` to get the active session filename (pointer only — contains filename, not content)
2. If non-empty, read the named session file to understand what work is being done
3. Run `git diff --staged` to see the actual code changes

## Step 3: Analyze Changes

Determine if changes should be split based on:
- Different concerns (unrelated parts of codebase)
- Different types (features vs fixes vs refactoring)
- File patterns (source code vs documentation)
- Logical grouping (easier to understand separately)
- Size (very large changes that would be clearer broken down)

## Step 4: Create Commits

For each logical commit:

1. If splitting, stage only relevant files with `git add [files]`
2. Generate commit message: `[emoji] [type]: [imperative description]` — max 72 chars
3. Execute `git commit -m "[message]"`
4. Confirm what was committed

## Emoji/Type Reference

- ✨ `feat`: New feature
- 🐛 `fix`: Bug fix
- 📝 `docs`: Documentation
- 💄 `style`: Formatting/style
- ♻️ `refactor`: Code refactoring
- ⚡️ `perf`: Performance improvements
- ✅ `test`: Tests
- 🔧 `chore`: Tooling, configuration
- 🚀 `ci`: CI/CD improvements
- 🗑️ `revert`: Reverting changes
- 🧪 `test`: Add a failing test
- 🚨 `fix`: Fix compiler/linter warnings
- 🔒️ `fix`: Fix security issues
- 👥 `chore`: Add or update contributors
- 🚚 `refactor`: Move or rename resources
- 🏗️ `refactor`: Make architectural changes
- 🔀 `chore`: Merge branches
- 📦️ `chore`: Add or update compiled files or packages
- ➕ `chore`: Add a dependency
- ➖ `chore`: Remove a dependency
- 🌱 `chore`: Add or update seed files
- 🧑💻 `chore`: Improve developer experience
- 🧵 `feat`: Add or update code related to multithreading or concurrency
- 🔍️ `feat`: Improve SEO
- 🏷️ `feat`: Add or update types
- 💬 `feat`: Add or update text and literals
- 🌐 `feat`: Internationalization and localization
- 👔 `feat`: Add or update business logic
- 📱 `feat`: Work on responsive design
- 🚸 `feat`: Improve user experience / usability
- 🩹 `fix`: Simple fix for a non-critical issue
- 🥅 `fix`: Catch errors
- 👽️ `fix`: Update code due to external API changes
- 🔥 `fix`: Remove code or files
- 🎨 `style`: Improve structure/format of the code
- 🚑️ `fix`: Critical hotfix
- 🎉 `chore`: Begin a project
- 🔖 `chore`: Release/Version tags
- 🚧 `wip`: Work in progress
- 💚 `fix`: Fix CI build
- 📌 `chore`: Pin dependencies to specific versions
- 👷 `ci`: Add or update CI build system
- 📈 `feat`: Add or update analytics or tracking code
- ✏️ `fix`: Fix typos
- ⏪️ `revert`: Revert changes
- 📄 `chore`: Add or update license
- 💥 `feat`: Introduce breaking changes
- 🍱 `assets`: Add or update assets
- ♿️ `feat`: Improve accessibility
- 💡 `docs`: Add or update comments in source code
- 🗃️ `db`: Perform database related changes
- 🔊 `feat`: Add or update logs
- 🔇 `fix`: Remove logs
- 🤡 `test`: Mock things
- 🥚 `feat`: Add or update an easter egg
- 🙈 `chore`: Add or update .gitignore file
- 📸 `test`: Add or update snapshots
- ⚗️ `experiment`: Perform experiments
- 🚩 `feat`: Add, update, or remove feature flags
- 💫 `ui`: Add or update animations and transitions
- ⚰️ `refactor`: Remove dead code
- 🦺 `feat`: Add or update code related to validation
- ✈️ `feat`: Improve offline support

## Examples

Good commit messages:
- ✨ feat: add user authentication system
- 🐛 fix: resolve memory leak in rendering process
- 📝 docs: update API documentation with new endpoints
- ♻️ refactor: simplify error handling logic in parser
- 🚨 fix: resolve linter warnings in component files
- 🧑💻 chore: improve developer tooling setup process
- 👔 feat: implement business logic for transaction validation
- 🩹 fix: address minor styling inconsistency in header
- 🚑️ fix: patch critical security vulnerability in auth flow
- 🎨 style: reorganize component structure for better readability
- 🔥 fix: remove deprecated legacy code
- 🦺 feat: add input validation for user registration form
- 💚 fix: resolve failing CI pipeline tests
- 📈 feat: implement analytics tracking for user engagement
- 🔒️ fix: strengthen authentication password requirements
- ♿️ feat: improve form accessibility for screen readers

Example of splitting commits:
- First commit: ✨ feat: add new solc version type definitions
- Second commit: 📝 docs: update documentation for new solc versions
- Third commit: 🔧 chore: update package.json dependencies
- Fourth commit: 🏷️ feat: add type definitions for new API endpoints
- Fifth commit: 🧵 feat: improve concurrency handling in worker threads
- Sixth commit: 🚨 fix: resolve linting issues in new code
- Seventh commit: ✅ test: add unit tests for new solc version features
- Eighth commit: 🔒️ fix: update dependencies with security vulnerabilities
