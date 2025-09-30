import { SITES, ROOMS, normSiteId, siteById } from "./config.js";

const $ = (s) => document.querySelector(s);
const siteSel = $("#site");
const roomSel = $("#room");
const tokenEl = $("#token");
const callBtn = $("#call");
const example = $("#exampleUrl");

// Populate site dropdown
function fillSites() {
  siteSel.innerHTML = '<option value="">Select site…</option>' +
    SITES.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
}

// Populate rooms for a given site id
function fillRooms(siteId) {
  const rooms = ROOMS[siteId] || [];
  roomSel.innerHTML = '<option value="">Select room…</option>' +
    rooms.map(r => `<option value="${r}">${r}</option>`).join("");
}

// Persist selections locally
function saveLocal() {
  localStorage.setItem("doc_site", siteSel.value || "");
  localStorage.setItem("doc_room", roomSel.value || "");
  localStorage.setItem("doc_token", tokenEl.value || "");
}
function loadLocal() {
  const s = localStorage.getItem("doc_site") || "";
  const r = localStorage.getItem("doc_room") || "";
  const t = localStorage.getItem("doc_token") || "";
  if (s) siteSel.value = s;
  fillRooms(siteSel.value || "");
  if (r) roomSel.value = r;
  if (t) tokenEl.value = t;
  updateExample();
}

function updateExample() {
  const s = siteSel.value || "LAUMONE";
  const r = roomSel.value || (ROOMS[s]?.[0] || "1");
  const t = tokenEl.value || "YOUR_SECRET";
  example.textContent = `/call?site=${s}&room=${encodeURIComponent(r)}&token=${t}`;
}

siteSel.addEventListener("change", () => { fillRooms(siteSel.value); saveLocal(); updateExample(); });
roomSel.addEventListener("change", () => { saveLocal(); updateExample(); });
tokenEl.addEventListener("input", () => { saveLocal(); updateExample(); });

// Button: call via HTTP (works even if sockets are grumpy)
callBtn.addEventListener("click", async () => {
  const siteId = normSiteId(siteSel.value);
  const room = roomSel.value;
  const token = tokenEl.value.trim();
  if (!siteId) return alert("Choose a site");
  if (!room) return alert("Choose a room");
  if (!token) return alert("Enter the call token (SHARED_SECRET)");

  try {
    const res = await fetch(`/call?site=${siteId}&room=${encodeURIComponent(room)}&token=${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Call failed");
    callBtn.blur();
  } catch (e) {
    alert("Call failed: " + (e?.message || e));
  }
}
