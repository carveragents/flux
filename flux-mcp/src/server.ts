import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRepoInit } from "./tools/repo-init.js";
import { registerSessionStart } from "./tools/session-start.js";
import { registerSessionUpdate } from "./tools/session-update.js";
import { registerSessionEnd } from "./tools/session-end.js";
import { registerSessionCurrent } from "./tools/session-current.js";
import { registerSessionList } from "./tools/session-list.js";
import { registerLessonsSync } from "./tools/lessons-sync.js";
import { registerGitPrepareCommit } from "./tools/git-prepare-commit.js";
import { registerGitCommit } from "./tools/git-commit.js";
import { registerGitMergeCleanup } from "./tools/git-merge-cleanup.js";
import { registerGitMergeRetain } from "./tools/git-merge-retain.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "flux", version: "1.0.0" });

  registerRepoInit(server);
  registerSessionStart(server);
  registerSessionUpdate(server);
  registerSessionEnd(server);
  registerSessionCurrent(server);
  registerSessionList(server);
  registerLessonsSync(server);
  registerGitPrepareCommit(server);
  registerGitCommit(server);
  registerGitMergeCleanup(server);
  registerGitMergeRetain(server);

  return server;
}
