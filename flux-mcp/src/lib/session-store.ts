import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import lockfile from "proper-lockfile";

const sessionsDir = (cwd: string) => join(cwd, ".flux", ".sessions");
const pointerPath = (cwd: string) => join(sessionsDir(cwd), ".current-session");

export async function ensureSessionsDir(cwd: string): Promise<void> {
  await mkdir(sessionsDir(cwd), { recursive: true });
}

export async function getCurrentSessionPath(cwd: string): Promise<string | null> {
  const pointer = pointerPath(cwd);
  if (!existsSync(pointer)) return null;
  const content = (await readFile(pointer, "utf8")).trim();
  if (!content) return null;
  const full = join(sessionsDir(cwd), content);
  return existsSync(full) ? full : null;
}

export async function setCurrentSession(cwd: string, filename: string): Promise<void> {
  await ensureSessionsDir(cwd);
  const pointer = pointerPath(cwd);
  if (!existsSync(pointer)) {
    await writeFile(pointer, filename, "utf8");
    return;
  }
  const release = await lockfile.lock(pointer, { retries: 3 });
  try {
    await writeFile(pointer, filename, "utf8");
  } finally {
    await release();
  }
}

export async function clearCurrentSession(cwd: string): Promise<void> {
  await setCurrentSession(cwd, "");
}

export async function readSession(sessionPath: string): Promise<string> {
  return readFile(sessionPath, "utf8");
}

export async function writeSession(sessionPath: string, content: string): Promise<void> {
  await writeFile(sessionPath, content, "utf8");
}

export async function appendToSession(sessionPath: string, block: string): Promise<void> {
  const existing = await readSession(sessionPath);
  await writeSession(sessionPath, existing + "\n" + block);
}
