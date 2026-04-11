import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { git, currentBranch, hasUncommittedChanges } from "../lib/git.js";

export function registerGitMergeRetain(server: McpServer): void {
  server.tool(
    "flux_git_merge_retain",
    "Merge the current work branch into target, push to origin, then switch back to the work branch.",
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
        await g.checkout(workBranch);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { merged_into: target_branch, commit_hash: mergeResult.result ?? "", back_on_branch: workBranch },
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
