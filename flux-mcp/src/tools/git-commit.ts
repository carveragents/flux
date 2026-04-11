import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { git, currentBranch, stagedFiles } from "../lib/git.js";

export function registerGitCommit(server: McpServer): void {
  server.tool(
    "flux_git_commit",
    "Commit staged changes with the provided message. Call flux_git_prepare_commit first to stage and review the diff.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      message: z.string().describe("Full commit message including emoji and type prefix"),
    },
    async ({ cwd, message }) => {
      try {
        const staged = await stagedFiles(cwd);
        if (staged.length === 0) {
          return {
            content: [{ type: "text" as const, text: "Error: No staged files to commit. Run flux_git_prepare_commit first." }],
            isError: true,
          };
        }

        const result = await git(cwd).commit(message);
        const branch = await currentBranch(cwd);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { commit_hash: result.commit, files_committed: staged, branch },
                null,
                2
              ),
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
