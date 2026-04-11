import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCurrentSessionPath } from "../src/lib/session-store.js";
import { createServer } from "../src/server.js";

type ToolHandler = (args: Record<string, unknown>) => Promise<{ content: Array<{ text: string }> }>;
type ToolRegistry = Record<string, { handler: ToolHandler }>;

function getTool(name: string): ToolHandler {
  const server = createServer();
  const tools = (server as unknown as { _registeredTools: ToolRegistry })._registeredTools;
  const tool = tools[name];
  if (!tool) throw new Error(`Tool ${name} not found`);
  return tool.handler;
}

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "flux-test-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("flux_session_start", () => {
  it("creates session file and sets pointer", async () => {
    const handler = getTool("flux_session_start");
    const result = await handler({ cwd: tmpDir, goal: "test the session start tool", create_branch: false });
    const parsed = JSON.parse(result.content[0].text);

    expect(parsed.session_name).toBe("test-the-session-start-tool");
    expect(parsed.branch_created).toBe(false);
    expect(existsSync(join(tmpDir, ".flux", ".sessions", parsed.session_file))).toBe(true);

    const activePath = await getCurrentSessionPath(tmpDir);
    expect(activePath).not.toBeNull();
  });
});

describe("flux_session_list", () => {
  it("returns empty array when no sessions exist", async () => {
    const handler = getTool("flux_session_list");
    const result = await handler({ cwd: tmpDir });
    const parsed = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
  });
});

describe("flux_repo_init", () => {
  it("creates docs/ and agent guidance files", async () => {
    const handler = getTool("flux_repo_init");
    const result = await handler({ cwd: tmpDir, repo_desc: "test repo", target_agents: ["amazonq"] });
    const parsed = JSON.parse(result.content[0].text);

    expect(parsed.files_created).toContain("docs/LESSONS.md");
    expect(parsed.files_created).toContain("docs/README.md");
    expect(parsed.files_created).toContain(".amazonq/rules/FLUX.md");
    expect(existsSync(join(tmpDir, "docs", "LESSONS.md"))).toBe(true);
  });
});

describe("flux_lessons_sync", () => {
  it("appends lessons and deduplicates", async () => {
    const handler = getTool("flux_lessons_sync");
    const lessons = [
      { problem: "Test failed", mitigation: "Fixed the test", learned: "Always write tests before code" },
    ];

    const result1 = await handler({ cwd: tmpDir, session_label: "session-1.md", lessons });
    const parsed1 = JSON.parse(result1.content[0].text);
    expect(parsed1.lessons_added).toBe(1);

    // Second call with same lesson — should deduplicate
    const result2 = await handler({ cwd: tmpDir, session_label: "session-2.md", lessons });
    const parsed2 = JSON.parse(result2.content[0].text);
    expect(parsed2.lessons_added).toBe(0);
  });
});
