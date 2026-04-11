# Changelog

## [1.0.0] — Initial Release

### Tools Added
- `flux_repo_init` — one-time project scaffolding for docs and agent guidance files
- `flux_session_start` — start a session with optional git branch creation
- `flux_session_update` — append timestamped progress update to active session
- `flux_session_end` — finalize session with summary and git stats
- `flux_session_current` — show active session status and duration
- `flux_session_list` — list all sessions newest first
- `flux_lessons_sync` — deduplicate and append lessons to docs/LESSONS.md
- `flux_git_prepare_commit` — stage files and return diff for agent to compose message
- `flux_git_commit` — commit staged changes with provided message
- `flux_git_merge_cleanup` — merge work branch into target, push, delete work branch
- `flux_git_merge_retain` — merge work branch into target, push, return to work branch

### Versioning Policy
- `1.x.x` — stable tool schemas; new optional fields only within major version
- `2.x.x` — any required field rename, removal, or tool rename
- Old tool names kept as aliases for one major version before removal
