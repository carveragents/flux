---
allowed-tools: Read, Write, Edit, Grep, Bash(echo:*), Bash(date:*), Bash(git checkout:*), Bash(cat:*), Bash(mkdir -p:*)
argument-hint: [session_goal]
description: Prime the context and start a new development session to track work progress
model: claude-haiku-4-5
---

> **Note**: This is the Claude Code interface for Flux.
> For agent-agnostic use across Amazon Q, Cursor, Copilot, and Windsurf, install the MCP server: `npx flux-mcp`
> Session files are stored in `.flux/.sessions/` when using the MCP server.

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->


Run these three steps:

# STEP 1: Set the session name
Execute the `Setup` section to set the session name

## Setup

If `session_goal` is not provided, STOP.
Ask the user to specify what the session goal is. DO NOT PROCEED without receiving an answer.

Once the `session_goal` is specified, generate a `session_name` by creating a succinct descriptor from the session goal.
Examples (`session_goal` --> `session_name`)
	* fix bugs in the generation of data identifiers --> bugfix-data-identifiers
	* implement new feature for crawling arbitrary sources --> feat-arbitrary-crawl-sources

---


# STEP 2: Understand the codebase
Execute the `Run`, `Read`, and `Report` sections to understand the codebase and summarize your understanding for use in this session.

## Run

git ls-file

## Read

1. Read the docs/README.md file.
2. Read the docs/LESSONS.md file.
3. IF, AND ONLY IF, docs/README.md does not exist, read all documents found in the docs/ folder and all sub-folders.

## Report

Summarize your understanding of the files and the codebase. Make special note of:
1. any documentation and parts of the codebase related to the session goal
2. the lessons learnt over the course of implementing this project
You will use these as you work, so note where this information can be found and when to consult it.

If there are conflicts between the files and the codebase, the codebase will take precedence.

---


# STEP 3: Create a working git branch
Run the git command in the `Branch` section to create a new git branch for this session

## Branch

git checkout -b `session_name`

---


# STEP 4: Start the session
Execute the `Start` section to start a new session

## Start

Generate a new `session_id` by running the bash date command. Use YYYY-MM-DD-HHMM as the format.

Start a new development session by creating a session file in `.flux/.sessions/` with the format `session_id-session_name.md`.
If `.flux/.sessions/` does not exist, create it using mkdir.

The session file should begin with:
1. Session name and timestamp as the title
2. Session overview section with start time
3. Goals section (ask user for goals if not clear)
4. Empty progress section ready for updates

After creating the file, create or update `.flux/.sessions/.current-session` to track the active session filename.

Confirm the session has started and remind the user they can:
- Update it with `/session:update`
- End it with `/session:end`

NEVER start any work on the session goal, wait till explicitly told to do so

---