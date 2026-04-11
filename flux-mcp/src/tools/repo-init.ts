import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { ensureDocsDir, lessonsPath, readmePath } from "../lib/docs-store.js";

const AGENTS = ["amazonq", "cursor", "copilot", "windsurf", "claude"] as const;
type Agent = (typeof AGENTS)[number];

const FLUX_GUIDANCE = (repoDesc: string) => `# Flux Framework Guidance

This project uses the Flux MCP server for session-based development workflows.

## Project Overview

${repoDesc || "{{TBD — run flux_repo_init with a repo_desc to fill this in}}"}

## Important Reference Files

- Project documentation: [docs/README.md](docs/README.md)
- Lessons learned: [docs/LESSONS.md](docs/LESSONS.md)

## Flux Workflow

1. Start a session: \`flux_session_start\`
2. Update progress: \`flux_session_update\`
3. End and capture lessons: \`flux_session_end\`
`;

async function writeIfAbsent(path: string, content: string): Promise<boolean> {
  if (existsSync(path)) return false;
  await writeFile(path, content, "utf8");
  return true;
}

async function writeAgentFile(cwd: string, agent: Agent, guidance: string): Promise<string | null> {
  const files: Record<Agent, { dir?: string; file: string }> = {
    amazonq: { dir: ".amazonq/rules", file: ".amazonq/rules/FLUX.md" },
    cursor: { dir: ".cursor/rules", file: ".cursor/rules/FLUX.md" },
    copilot: { dir: ".github", file: ".github/copilot-instructions.md" },
    windsurf: { file: ".windsurfrules" },
    claude: { file: "CLAUDE.md" },
  };
  const { dir, file } = files[agent];
  if (dir) await mkdir(join(cwd, dir), { recursive: true });
  const path = join(cwd, file);
  const created = await writeIfAbsent(path, guidance);
  return created ? file : null;
}

export function registerRepoInit(server: McpServer): void {
  server.tool(
    "flux_repo_init",
    "One-time project setup: creates docs/, LESSONS.md, README.md, and agent guidance files.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      repo_desc: z.string().optional().describe("Short description of the repo to seed scaffolding"),
      target_agents: z
        .array(z.enum(AGENTS))
        .optional()
        .describe("Which agent guidance files to create. Defaults to all."),
    },
    async ({ cwd, repo_desc = "", target_agents }) => {
      try {
        const agents = target_agents ?? [...AGENTS];
        const filesCreated: string[] = [];

        await ensureDocsDir(cwd);
        await mkdir(join(cwd, ".flux", ".sessions"), { recursive: true });

        if (await writeIfAbsent(lessonsPath(cwd), "# SESSIONS\n\n# LESSONS\n")) {
          filesCreated.push("docs/LESSONS.md");
        }
        if (await writeIfAbsent(readmePath(cwd), "# Project Documentation\n\n{{TBD}}\n")) {
          filesCreated.push("docs/README.md");
        }

        const guidance = FLUX_GUIDANCE(repo_desc);
        for (const agent of agents) {
          const created = await writeAgentFile(cwd, agent, guidance);
          if (created) filesCreated.push(created);
        }

        const scaffoldPrompt = `You have just initialized the Flux framework for this project.
Please read the codebase and fill in the following:
1. Update docs/README.md with a reference-style overview of the project structure.
2. Update the Project Overview section in each agent guidance file.
3. Do NOT duplicate information — docs/README.md should only point to other docs.
${repo_desc ? `\nRepo description provided: "${repo_desc}"` : ""}`;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ files_created: filesCreated, scaffold_prompt: scaffoldPrompt }, null, 2),
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
