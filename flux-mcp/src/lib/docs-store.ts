import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const docsDir = (cwd: string) => join(cwd, "docs");
const lessonsPath = (cwd: string) => join(docsDir(cwd), "LESSONS.md");
const readmePath = (cwd: string) => join(docsDir(cwd), "README.md");

const LESSONS_SKELETON = "# SESSIONS\n\n# LESSONS\n";

export async function ensureDocsDir(cwd: string): Promise<void> {
  await mkdir(docsDir(cwd), { recursive: true });
}

export async function readLessons(cwd: string): Promise<string> {
  const path = lessonsPath(cwd);
  if (!existsSync(path)) return LESSONS_SKELETON;
  return readFile(path, "utf8");
}

export async function writeLessons(cwd: string, content: string): Promise<void> {
  await ensureDocsDir(cwd);
  await writeFile(lessonsPath(cwd), content, "utf8");
}

export async function readDocsReadme(cwd: string): Promise<string | null> {
  const path = readmePath(cwd);
  if (!existsSync(path)) return null;
  return readFile(path, "utf8");
}

export async function writeDocsReadme(cwd: string, content: string): Promise<void> {
  await ensureDocsDir(cwd);
  await writeFile(readmePath(cwd), content, "utf8");
}

export async function listDocsFiles(cwd: string): Promise<string[]> {
  const dir = docsDir(cwd);
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { recursive: true });
  return (entries as string[]).filter((e) => e.endsWith(".md"));
}

export { lessonsPath, readmePath };
