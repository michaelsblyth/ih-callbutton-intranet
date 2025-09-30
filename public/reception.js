const $ = (s) => document.querySelector(s);
const siteEl = $("#site");
const joinBtn = $("#join");
const queueEl = $("#queue");
const overlayEl = $("#overlay");
const roomEl = $("#room");
const timeEl = $("#time");
const countEl = $("#count");
const ackBtn = $("#ack");

const socket = io();
const queue = []; // newest first
let current = null;
let chimeTimer = null;

function joinSite(){
  const site = siteEl.value.trim();
  if (!site) return alert("Enter site");
  socket.emit("join", { site });
  joinBtn.textContent = "Joined";
  joinBtn.disabled = true;
}

function renderQueue(){
  queueEl.innerHTML = "";
  queue.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = \`
      <div><strong>Room \${item.room}</strong> <span class="meta">\${new Date(item.ts).toLocaleTimeString()}</span></div>
      <button data-id="\${item.id}" data-room="\${item.room}">ACK</button>
    \`;
    li.querySelector("button").addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const room = e.target.getAttribute("data-room");
      socket.emit("ack", { id, room });
    });
    queueEl.appendChild(li);
  });
}

function startChime(){
  stopChime();
  playBeep();
  chimeTimer = setInterval(playBeep, 5000);
}
function stopChime(){
  if (chimeTimer) clearInterval(chimeTimer);
  chimeTimer = null;
}
function playBeep(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 200);
  } catch {}
}

function showOverlay(item){
  current = item;
  roomEl.textContent = "ROOM " + item.room;
  timeEl.textContent = new Date(item.ts).toLocaleTimeString();
  countEl.textContent = queue.length ? \`(+\${queue.length} more)\` : "";
  overlayEl.classList.remove("hidden");
  startChime();
}
function hideOverlay(){
  overlayEl.classList.add("hidden");
  stopChime();
}

// Socket events
socket.on("call", (data) => {
  if (!current){ showOverlay(data); }
  else { queue.unshift(data); countEl.textContent = \`(+\${queue.length} more)\`; }
  queue.unshift(data);
  renderQueue();
});
socket.on("ack", (data) => {
  const idx = queue.findIndex(x => x.id === data.id);
  if (idx >= 0){ queue.splice(idx, 1); renderQueue(); }
  if (current && current.id === data.id){
    if (queue.length){ const next = queue.shift(); showOverlay(next); renderQueue(); }
    else { current = null; hideOverlay(); }
  } else {
    countEl.textContent = queue.length ? \`(+\${queue.length} more)\` : "";
  }
});

// UI events
joinBtn.addEventListener("click", joinSite);
ackBtn.addEventListener("click", () => {
  if (!current) return;
  socket.emit("ack", { id: current.id, room: current.room });
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Enter" || e.code === "Space"){
    if (current) socket.emit("ack", { id: current.id, room: current.room });
  }
  if (e.code === "Escape"){ stopChime(); } // mute
});
