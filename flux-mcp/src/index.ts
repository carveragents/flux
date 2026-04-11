#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const server = createServer();

if (process.env.FLUX_TRANSPORT === "http") {
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );
  const express = (await import("express")).default;
  const port = Number(process.env.FLUX_PORT ?? 3741);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  transport.onerror = (err) => {
    process.stderr.write(`[transport error] ${err.message}\n`);
  };

  const app = express();
  app.use(express.json());
  app.all("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      process.stderr.write(`[handler error] ${(err as Error).message}\n${(err as Error).stack}\n`);
      if (!res.headersSent) {
        res.status(500).json({ error: (err as Error).message });
      }
    }
  });

  app.listen(port, "127.0.0.1", async () => {
    process.stderr.write(`flux-mcp HTTP listening on http://127.0.0.1:${port}/mcp\n`);
    await server.connect(transport);
  });
} else {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
