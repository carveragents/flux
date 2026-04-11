import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { git, currentBranch, hasUncommittedChanges } from "../lib/git.js";

export function registerGitMergeCleanup(server: McpServer): void {
  server.tool(
    "flux_git_merge_cleanup",
    "Merge the current work branch into target, push to origin, and delete the work branch.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      target_branch: z
        .string()
        .optional()
        .default("main")
        .describe("Branch to merge into. Defaults to main."),
    },
    async ({ cwd, target_branch }) => {
      try {
        if (await hasUncommittedChanges(cwd)) {
          return {
            content: [{ type: "text" as const, text: "Error: Uncommitted changes detected. Commit or stash them before merging." }],
            isError: true,
          };
        }

        const workBranch = await currentBranch(cwd);
        const g = git(cwd);

        await g.checkout(target_branch!);
        const mergeResult = await g.merge([workBranch]);
        await g.push("origin", target_branch!);
        await g.deleteLocalBranch(workBranch, true);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { merged_into: target_branch, commit_hash: mergeResult.result ?? "", branch_deleted: workBranch },
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
