import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { z } from "zod";
import { getCurrentSessionPath, readSession } from "../lib/session-store.js";

export function registerSessionCurrent(server: McpServer): void {
  server.tool(
    "flux_session_current",
    "Show the active session's status, duration, and most recent update.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
    },
    async ({ cwd }) => {
      try {
        const sessionPath = await getCurrentSessionPath(cwd);
        if (!sessionPath) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ active: false }, null, 2) }],
          };
        }

        const content = await readSession(sessionPath);
        const fileStat = await stat(sessionPath);
        const startedAt = fileStat.birthtime.toISOString();
        const durationMin = Math.round((Date.now() - fileStat.birthtime.getTime()) / 60000);

        const titleMatch = content.match(/^# (.+)$/m);
        const name = titleMatch ? titleMatch[1] : basename(sessionPath, ".md");

        const updates = [...content.matchAll(/^### Update — (.+)$/gm)];
        const lastUpdate = updates.length > 0 ? updates[updates.length - 1][1] : null;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { active: true, name, session_file: basename(sessionPath), started_at: startedAt, duration_minutes: durationMin, last_update: lastUpdate },
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
