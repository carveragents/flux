import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, basename } from "node:path";
import { z } from "zod";
import { getCurrentSessionPath, readSession } from "../lib/session-store.js";

export function registerSessionList(server: McpServer): void {
  server.tool(
    "flux_session_list",
    "List all past and present session files, newest first.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
    },
    async ({ cwd }) => {
      try {
        const sessionsDir = join(cwd, ".flux", ".sessions");
        if (!existsSync(sessionsDir)) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify([], null, 2) }],
          };
        }

        const entries = await readdir(sessionsDir);
        const mdFiles = entries
          .filter((f) => f.endsWith(".md") && f !== ".current-session")
          .sort()
          .reverse();

        const activeSessionPath = await getCurrentSessionPath(cwd);
        const activeFilename = activeSessionPath ? basename(activeSessionPath) : null;

        const sessions = await Promise.all(
          mdFiles.map(async (filename) => {
            const path = join(sessionsDir, filename);
            const content = await readSession(path).catch(() => "");
            const titleMatch = content.match(/^# (.+)$/m);
            const title = titleMatch ? titleMatch[1] : filename;
            const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : "";
            return { filename, title, date, is_active: filename === activeFilename };
          })
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify(sessions, null, 2) }],
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
