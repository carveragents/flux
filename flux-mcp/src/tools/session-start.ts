import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { join } from "node:path";
import { z } from "zod";
import {
  ensureSessionsDir,
  setCurrentSession,
  writeSession,
} from "../lib/session-store.js";
import { git } from "../lib/git.js";

function slugify(goal: string): string {
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40)
    .replace(/-+$/, "");
}

function sessionId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function registerSessionStart(server: McpServer): void {
  server.tool(
    "flux_session_start",
    "Start a new development session with context priming. Creates a session file and optionally a git branch.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      goal: z.string().describe("What this session aims to accomplish"),
      create_branch: z
        .boolean()
        .optional()
        .default(false)
        .describe("If true, creates a git branch named after the session slug"),
    },
    async ({ cwd, goal, create_branch }) => {
      try {
        await ensureSessionsDir(cwd);

        const id = sessionId();
        const slug = slugify(goal);
        const filename = `${id}-${slug}.md`;
        const sessionPath = join(cwd, ".flux", ".sessions", filename);
        const startedAt = new Date().toISOString();

        const content = `# ${slug} — ${id}

## Overview

- **Started**: ${startedAt}
- **Goal**: ${goal}

## Goals

- ${goal}

## Progress

`;
        await writeSession(sessionPath, content);
        await setCurrentSession(cwd, filename);

        let branchCreated = false;
        if (create_branch) {
          await git(cwd).checkoutLocalBranch(slug);
          branchCreated = true;
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ session_file: filename, session_name: slug, started_at: startedAt, branch_created: branchCreated }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text" as const, text: `Error: ${(err as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
