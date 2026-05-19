# Flux — Repository Initialization

## Step 1: Create Scaffolding

Create the following structure:

```
docs/
  README.md   (empty for now)
  LESSONS.md
.flux/
  .sessions/
```

Create `docs/LESSONS.md` with:
```markdown
# SESSIONS

# LESSONS
```

Create an empty `docs/README.md`.

## Step 2: Analyze the Codebase

If a repository description was provided, use it as guidance.

1. Run `git ls-files` to enumerate the codebase
2. Read files selectively — focus on entry points, configuration, existing documentation
3. Prioritize codebase over documentation if conflicts exist

## Step 3: Generate Documentation

1. Create well-structured documentation under `docs/` covering:
   - System architecture and design patterns
   - How to run and test the code
   - Any other information relevant to working on this project
   - Keep each doc focused — one topic per file

2. Create `docs/README.md` as a reference-style index that:
   - Points to files under `docs/` — does NOT duplicate their content
   - Orients anyone working on the project to find information quickly

## Step 4: Confirm

Report:
- What files were created
- A 2–3 sentence summary of the project
- Remind the user: use `{{CMD_SESSION_START}}` to begin a development session
