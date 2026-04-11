import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { git, diffStaged, stagedFiles } from "../lib/git.js";
import { getCurrentSessionPath, readSession } from "../lib/session-store.js";

export function registerGitPrepareCommit(server: McpServer): void {
  server.tool(
    "flux_git_prepare_commit",
    "Stage files and return the diff and session context for the agent to compose a commit message. Does NOT commit.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      files: z
        .array(z.string())
        .optional()
        .describe("Specific files to stage. If omitted, stages all unstaged changes."),
    },
    async ({ cwd, files }) => {
      try {
        const g = git(cwd);
        const currentStaged = await stagedFiles(cwd);

        if (files && files.length > 0) {
          await g.add(files);
        } else if (currentStaged.length === 0) {
          await g.add(".");
        }

        const staged = await stagedFiles(cwd);
        const diff = await diffStaged(cwd);

        let sessionContext = "";
        const sessionPath = await getCurrentSessionPath(cwd);
        if (sessionPath) {
          const content = await readSession(sessionPath);
          // Return last 2000 chars of session for context without overwhelming the agent
          sessionContext = content.slice(-2000);
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ diff, staged_files: staged, session_context: sessionContext }, null, 2),
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
