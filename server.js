import express from "express";
import { WebSocketServer } from "ws";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { startFFmpegMultiOutput } from "./rtmp-bridge.js";

const app = express();
const PORT = process.env.PORT || 10000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const publicPath = path.join(__dirname, "public");
const webRoot = fs.existsSync(distPath) ? distPath : publicPath;

app.use(express.json());

let ffmpegProcess = null;

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LQR Studio Backend Running",
    webRoot: path.basename(webRoot),
    hint: "Use npm run dev for live 3D site on :3000 or npm run build && npm start for production site on :10000",
  });
});

app.post("/start-stream", (req, res) => {
  const { streamKey } = req.body;

  if (!streamKey) {
    return res.status(400).json({ error: "streamKey is required" });
  }

  const inputUrl = `rtmp://localhost/live/${streamKey}`;

  if (ffmpegProcess) {
    return res.status(400).json({ error: "Stream already running" });
  }

  ffmpegProcess = startFFmpegMultiOutput({ inputUrl });

  if (!ffmpegProcess) {
    return res.status(500).json({ error: "No RTMP outputs configured" });
  }

  return res.json({ status: "stream-started" });
});

app.post("/stop-stream", (req, res) => {
  if (!ffmpegProcess) {
    return res.status(400).json({ error: "No active stream" });
  }

  ffmpegProcess.kill("SIGINT");
  ffmpegProcess = null;
  return res.json({ status: "stream-stopped" });
});

app.use(express.static(webRoot));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path === "/start-stream" || req.path === "/stop-stream") {
    return next();
  }

  const indexFile = path.join(webRoot, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  return res.status(404).send("No web build found. Run npm run build first.");
});

const server = app.listen(PORT, () => {
  console.log("Backend running on port", PORT, "serving", webRoot);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg.toString());
      }
    });
  });
});
