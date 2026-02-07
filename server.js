import express from "express";
import { WebSocketServer } from "ws";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("LQR Studio Backend Running");
});

const server = app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    // Broadcast to all clients
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
