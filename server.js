import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import helmet from "helmet";
import path from "path";
import url from "url";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: true, credentials: true } });

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const SHARED_SECRET = process.env.SHARED_SECRET || "dev_secret";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Doctor HTTP trigger (works without sockets)
app.get("/call", (req, res) => {
  const { site, room, token } = req.query;
  if (!site || !room || !token || token !== SHARED_SECRET) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  const payload = { id: id(), site, room, ts: Date.now() };
  io.to(siteRoom(site)).emit("call", payload);
  res.json({ ok: true, payload });
});

// Sockets (reception live, optional doctor)
io.on("connection", (socket) => {
  socket.on("join", ({ site }) => {
    if (!site) return;
    socket.join(siteRoom(site));
    socket.data.site = site;
  });

  socket.on("call", ({ site, room }) => {
    if (!site || !room) return;
    const payload = { id: id(), site, room, ts: Date.now() };
    io.to(siteRoom(site)).emit("call", payload);
  });

  socket.on("ack", ({ id: callId, room }) => {
    const site = socket.data.site;
    if (!site || !callId || !room) return;
    const payload = { id: callId, room, ts: Date.now() };
    io.to(siteRoom(site)).emit("ack", payload);
  });
});

server.listen(PORT, () => console.log("IH CallButton listening on", PORT));

function siteRoom(site) { return `site:${site}`; }
function id() { return (Date.now().toString(36) + Math.random().toString(36).slice(2,10)).toUpperCase(); }
