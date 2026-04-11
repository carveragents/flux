---
allowed-tools: Read, Write, Edit, Grep, Bash(echo:*), Bash(date:*), Bash(git checkout:*), Bash(cat:*), Bash(mkdir -p:*)
argument-hint: [repo_desc]
description: Prime the context and start a new development session to track work progress
model: claude-opus-4-6
---

> **Note**: This is the Claude Code interface for Flux.
> For agent-agnostic use across Amazon Q, Cursor, Copilot, and Windsurf, install the MCP server: `npx flux-mcp`
> Session files are stored in `.flux/.sessions/` when using the MCP server.

<!-- Some parts of this command are specific to Claude Code,
especially folder locations, front matter, and argument passing.
Modify as needed if using with other coding agents. -->


Run these two steps:

# STEP 1: Create required boilerplate files/folders

Execute the `Setup` section to create all required boilerplate files/folders

## Setup

1. create a docs/ folder using `mkdir -p docs`
2. create a LESSONS.md file under docs with content
```
# SESSIONS

# LESSONS
```
3. create an empty README.md file under docs
4. create a CLAUDE.md file in codebase root with the following content
```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**NEVER** update this file during a working session, we have other files to track project learnings and documentation references.

## Project Overview

{{TBD}}

## Specialized Sub-Agents Available

**ALWAYS** 
1. Use the appropriate specialized sub-agents available for the task being worked on. 
2. Provide the specialized sub-agents with the current working session goal. 
3. Run the code review agent after each code change and have the appropriate coding agents fix any issues found.

## Important Reference Files

- Starting point to understand the project is: [docs/README.md](docs/README.md)
- Important lessons learned and pitfalls to avoid: [docs/LESSONS.md](docs/LESSONS.md)
```

---


# STEP 2: Understand the codebase

Note: If `repo_desc` is provided, use that to guide you during this step
Execute the `Read`, and `Report` sections to understand the codebase and summarize your understanding.

## Read

1. Read the files in the codebase and understand what it does
2. If there are useful documentation files in the codebase, read those as well and understand

If there are conflicts between the documentation and the codebase, the codebase will take precedence.

## Report

Summarize your understanding of the documentation and the codebase and update the following files:
1. update the `Project Overview` section in CLAUDE.md with a concise 2-3 lines describing the purpose of the codebase
2. create documentation in docs/ (under well laid out folder structures) your understanding of the codebase including system architecture, design patterns, development process, running the code, testing methodology, and any other relevant information
3. create reference style documentation in docs/README.md with your understanding of the codebase. see below for what the README.md file should contain

!!! IMPORTANT - Purpose of the README !!!: 
- the readme file should be a reference style document. it should orient anyone working on the project to quickly find the info they need. the readme file should ONLY act as a pointer to the info that is available in documentation. it should NOT duplicate information found in the documentation. the readme file should be complete enough that anyone who wants to work on the project should be able to find the jumping off points in the file. 

---

