import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ensureSessionsDir,
  setCurrentSession,
  getCurrentSessionPath,
  clearCurrentSession,
  writeSession,
  appendToSession,
  readSession,
} from "../src/lib/session-store.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "flux-test-"));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe("ensureSessionsDir", () => {
  it("creates .flux/.sessions directory", async () => {
    await ensureSessionsDir(tmpDir);
    expect(existsSync(join(tmpDir, ".flux", ".sessions"))).toBe(true);
  });
});

describe("setCurrentSession / getCurrentSessionPath", () => {
  it("sets and retrieves active session", async () => {
    const sessionFile = "2025-01-01-1200-test-session.md";
    const sessionPath = join(tmpDir, ".flux", ".sessions", sessionFile);
    await ensureSessionsDir(tmpDir);
    await writeSession(sessionPath, "# test");
    await setCurrentSession(tmpDir, sessionFile);
    const result = await getCurrentSessionPath(tmpDir);
    expect(result).toBe(sessionPath);
  });

  it("returns null when no session is set", async () => {
    const result = await getCurrentSessionPath(tmpDir);
    expect(result).toBeNull();
  });
});

describe("clearCurrentSession", () => {
  it("clears the active session pointer", async () => {
    const sessionFile = "2025-01-01-1200-test.md";
    const sessionPath = join(tmpDir, ".flux", ".sessions", sessionFile);
    await ensureSessionsDir(tmpDir);
    await writeSession(sessionPath, "# test");
    await setCurrentSession(tmpDir, sessionFile);
    await clearCurrentSession(tmpDir);
    const result = await getCurrentSessionPath(tmpDir);
    expect(result).toBeNull();
  });
});

describe("appendToSession", () => {
  it("appends content to existing session file", async () => {
    await ensureSessionsDir(tmpDir);
    const path = join(tmpDir, ".flux", ".sessions", "test.md");
    await writeSession(path, "# Initial\n");
    await appendToSession(path, "## Update\n");
    const content = await readSession(path);
    expect(content).toContain("# Initial");
    expect(content).toContain("## Update");
  });
});
