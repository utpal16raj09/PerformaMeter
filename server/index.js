import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

/* eslint-env node */

// ESM-safe __dirname / __filename
const __filename = fileURLToPath(import.meta.url);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create ONE shared server
const server = http.createServer(app);

// Attach WebSocket to SAME server
const wss = new WebSocketServer({ server });

let latestMetrics = [];

app.post("/api/metrics", (req, res) => {
  const { metrics } = req.body;
  latestMetrics.push(...metrics);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "metrics", data: metrics }));
    }
  });

  res.status(200).send({ ok: true });
});

wss.on("connection", (socket) => {
  console.log("Client connected to WebSocket");
  socket.send(JSON.stringify({ type: "hello", data: "connected" }));
});

// Start server ONLY if run directly
if (__filename === process.argv[1]) {
  server.listen(4000, () => {
    console.log("PerfWatch server + WS running on http://localhost:4000");
  });
}

export { wss };
