import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { stat } from "node:fs/promises";
import { z } from "zod";
import {
  getCurrentSessionPath,
  appendToSession,
  readSession,
  clearCurrentSession,
} from "../lib/session-store.js";
import { diffHeadStat } from "../lib/git.js";

export function registerSessionEnd(server: McpServer): void {
  server.tool(
    "flux_session_end",
    "End the active session: appends final summary, captures git stats, clears the session pointer. Returns full session content for use with flux_lessons_sync.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      summary: z.string().describe("Comprehensive session summary written by the agent"),
    },
    async ({ cwd, summary }) => {
      try {
        const sessionPath = await getCurrentSessionPath(cwd);
        if (!sessionPath) {
          return {
            content: [{ type: "text" as const, text: "Error: No active session to end." }],
            isError: true,
          };
        }

        const fileStat = await stat(sessionPath);
        const startedAt = fileStat.birthtime;
        const endedAt = new Date();
        const durationMs = endedAt.getTime() - startedAt.getTime();
        const durationMin = Math.round(durationMs / 60000);

        const gitStats = await diffHeadStat(cwd).catch(() => "");

        const block = `### Session End — ${endedAt.toISOString()}

**Duration**: ${durationMin} minutes

**Git Stats**:
${gitStats ? `\`\`\`\n${gitStats}\n\`\`\`` : "_No committed changes_"}

**Summary**:
${summary}
`;
        await appendToSession(sessionPath, block);
        const fullContent = await readSession(sessionPath);
        await clearCurrentSession(cwd);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ session_file: sessionPath, full_content: fullContent }, null, 2),
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
