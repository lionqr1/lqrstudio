import express from "express";
import { WebSocketServer } from "ws";
import { startFFmpegMultiOutput } from "./rtmp-bridge.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("LQR Studio Backend Running");
});

let ffmpegProcess = null;

app.post("/start-stream", (req, res) => {
  const { inputUrl } = req.body;

  if (!inputUrl) {
    return res.status(400).json({ error: "inputUrl is required" });
  }

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

const server = app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
