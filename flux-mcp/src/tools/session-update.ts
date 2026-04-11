import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getCurrentSessionPath, appendToSession } from "../lib/session-store.js";
import { currentBranch, statusPorcelain } from "../lib/git.js";

export function registerSessionUpdate(server: McpServer): void {
  server.tool(
    "flux_session_update",
    "Append a progress update to the active session file.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      summary: z.string().describe("Summary of work done since last update"),
    },
    async ({ cwd, summary }) => {
      try {
        const sessionPath = await getCurrentSessionPath(cwd);
        if (!sessionPath) {
          return {
            content: [{ type: "text" as const, text: "Error: No active session. Run flux_session_start first." }],
            isError: true,
          };
        }

        const timestamp = new Date().toISOString();
        const branch = await currentBranch(cwd).catch(() => "unknown");
        const status = await statusPorcelain(cwd).catch(() => "");

        const block = `### Update — ${timestamp}

**Summary**: ${summary}

**Git**: branch \`${branch}\`
${status ? `\`\`\`\n${status}\n\`\`\`` : "_No changes_"}
`;
        await appendToSession(sessionPath, block);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ session_file: sessionPath, timestamp }, null, 2),
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
