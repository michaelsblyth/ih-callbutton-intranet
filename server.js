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
const io = new IOServer(server, {
  cors: { origin: true, credentials: true }
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;
const SHARED_SECRET = process.env.SHARED_SECRET || "dev_secret";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static
app.use(express.static(path.join(__dirname, "public")));

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// HTTP trigger for headless buttons
// GET /call?site=LAumone&room=3&token=SHARED_SECRET
app.get("/call", (req, res) => {
  const { site, room, token } = req.query;
  if (!site || !room || !token || token !== SHARED_SECRET) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  const payload = { id: cryptoRandomId(), site, room, ts: Date.now() };
  io.to(siteRoom(site)).emit("call", payload);
  return res.json({ ok: true, payload });
});

io.on("connection", (socket) => {
  socket.on("join", ({ site }) => {
    if (!site) return;
    socket.join(siteRoom(site));
    socket.data.site = site;
  });

  socket.on("call", ({ site, room }) => {
    if (!site || !room) return;
    const payload = { id: cryptoRandomId(), site, room, ts: Date.now() };
    io.to(siteRoom(site)).emit("call", payload);
  });

  socket.on("ack", ({ id, room }) => {
    const site = socket.data.site;
    if (!site || !id || !room) return;
    const payload = { id, room, ts: Date.now() };
    io.to(siteRoom(site)).emit("ack", payload);
  });
});

function siteRoom(site){ return `site:${site}`; }
function cryptoRandomId(){
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).toUpperCase();
}

server.listen(PORT, () => {
  console.log("IH CallButton intranet server listening on", PORT);
});
