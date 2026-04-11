import { simpleGit, SimpleGit } from "simple-git";

export function git(cwd: string): SimpleGit {
  return simpleGit({ baseDir: cwd, binary: "git" });
}

export async function currentBranch(cwd: string): Promise<string> {
  const g = git(cwd);
  const status = await g.status();
  return status.current ?? "unknown";
}

export async function stagedFiles(cwd: string): Promise<string[]> {
  const g = git(cwd);
  const status = await g.status();
  return [
    ...status.staged,
    ...status.created.filter((f) => status.staged.includes(f)),
  ];
}

export async function hasUncommittedChanges(cwd: string): Promise<boolean> {
  const g = git(cwd);
  const status = await g.status();
  return !status.isClean();
}

export async function diffStaged(cwd: string): Promise<string> {
  return git(cwd).diff(["--staged"]);
}

export async function diffHeadStat(cwd: string): Promise<string> {
  return git(cwd).diff(["HEAD", "--stat"]).catch(() => "");
}

export async function statusPorcelain(cwd: string): Promise<string> {
  const g = git(cwd);
  const status = await g.status();
  const lines: string[] = [
    ...status.modified.map((f) => ` M ${f}`),
    ...status.created.map((f) => `?? ${f}`),
    ...status.deleted.map((f) => ` D ${f}`),
    ...status.staged.map((f) => `A  ${f}`),
  ];
  return lines.join("\n");
}
