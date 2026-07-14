# Repository Context

Use this workflow to initialize Flux or refresh project documentation.

## Initialize

1. Resolve the repository root and read existing instruction and documentation files.
2. Run:

   ```bash
   python3 <flux-skill>/scripts/session.py --root <repo-root> init
   ```

3. Create missing files only:
   - `docs/README.md`: a short index linking to project documentation.
   - `docs/LESSONS.md`: headings `# Sessions` and `# Lessons`.
   - `docs/project-overview.md`: project purpose, architecture, development commands,
     test strategy, and important boundaries.
4. Do not create or replace runtime-specific instruction files such as `CLAUDE.md`.
   Update an existing repository instruction file only when the repository convention and
   the user's request require it.
5. Inspect source, configuration, tests, and useful existing documentation. Prefer code
   over stale documentation when they conflict.
6. Fill `docs/project-overview.md` with verified facts. Keep `docs/README.md` as an index;
   do not duplicate the detailed documentation there.
7. Run documentation checks if the repository provides them, then summarize created and
   updated files.

Never overwrite populated documentation during initialization. Merge missing information
into the existing structure with a small, reviewable edit.

## Refresh

Re-read changed code and configuration, then update only documentation made stale by those
changes. Record durable pitfalls in `docs/LESSONS.md`; do not record transient debugging
notes or duplicate an existing lesson.
