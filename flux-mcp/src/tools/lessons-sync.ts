import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readLessons, writeLessons } from "../lib/docs-store.js";

export function registerLessonsSync(server: McpServer): void {
  server.tool(
    "flux_lessons_sync",
    "Append session label and deduplicated lessons to docs/LESSONS.md.",
    {
      cwd: z.string().describe("Absolute path to the project root"),
      session_label: z.string().describe("Session filename used as the SESSIONS index entry"),
      lessons: z
        .array(
          z.object({
            problem: z.string().describe("One sentence: what went wrong or was unclear"),
            mitigation: z.string().describe("One sentence: what was done to resolve it"),
            learned: z.string().describe("One sentence: the transferable principle"),
          })
        )
        .max(3)
        .describe("Max 3 lessons synthesized by the agent from the session"),
    },
    async ({ cwd, session_label, lessons }) => {
      try {
        let content = await readLessons(cwd);

        // Append session label to SESSIONS section
        content = content.replace(
          /^(# SESSIONS\n)/m,
          `$1- ${session_label}\n`
        );

        // Deduplicate and append lessons
        let lessonsAdded = 0;
        for (const lesson of lessons) {
          const alreadyExists = content.toLowerCase().includes(lesson.learned.toLowerCase().slice(0, 40));
          if (!alreadyExists) {
            const block = `\n### Lesson\n- **Problem**: ${lesson.problem}\n- **Mitigation**: ${lesson.mitigation}\n- **Learned**: ${lesson.learned}\n`;
            content = content.replace(/^(# LESSONS\n)/m, `$1${block}`);
            lessonsAdded++;
          }
        }

        await writeLessons(cwd, content);
        const totalLessons = [...content.matchAll(/^### Lesson$/gm)].length;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ lessons_added: lessonsAdded, total_lessons: totalLessons }, null, 2),
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
