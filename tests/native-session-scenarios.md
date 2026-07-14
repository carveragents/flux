# Native Session Scenarios

Use these scenarios when changing Flux session-state instructions. The agent has native
file read, create, and edit operations plus Git, but no language runtime or Flux helper.

## Initialize An Empty Repository

The agent creates `.flux/sessions/` and an empty `.current-session`, then creates only
missing project documentation. It does not invoke Python, Node, or another runtime.

## Start A Session

The agent validates a 1-64 character name against
`^[a-z0-9]+(?:-[a-z0-9]+)*$` and requires a non-empty goal. It validates session state
before and after any worktree creation, uses only truthful timestamp precision available
in its context, creates the session Markdown file without overwriting an existing path,
and writes its filename to `.current-session` only after the session file exists.

## Refuse A Second Active Session

When `.current-session` names an existing session file, the agent stops without creating
or changing session state.

## Reject Malformed State

When `.current-session` contains a path, a non-Markdown filename, or a missing session
filename, the agent stops and reports malformed state. It does not clear or repair the
pointer without user direction.

## Inspect State Without Mutation

Current and list operations read the pointer and session Markdown files directly. They
do not create `.flux/`, modify timestamps, or require a helper command.

## End Safely

The agent writes the final summary and durable lessons first. It clears the active pointer
only after every required write succeeds. A failed write leaves the session active.

## Prevent Concurrent Writers

Flux treats session state as single-writer. If another agent is known to be starting,
updating, or ending a session in the same worktree, the agent stops and asks the user to
serialize the operations. The skill discloses that unknown concurrent writers cannot be
detected or prevented with native file operations.

## Runtime-Free Contract

The active skill and references contain no required Python, Node, shell-script, or other
language-runtime command. Session management uses native agent file operations; Git
commands remain allowed for repository metadata and worktree management.
