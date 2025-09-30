// Uses the fixed site/room lists from config.js
import { SITES, ROOMS, normSiteId } from "./config.js?v=5";

const $ = (s) => document.querySelector(s);
const siteSel = $("#site");
const roomSel = $("#room");
const callBtn = $("#call");

// Fill dropdowns
function fillSites() {
  siteSel.innerHTML = '<option value="">Select site…</option>' +
    SITES.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
}
function fillRooms(siteId) {
  const rooms = ROOMS[siteId] || [];
  roomSel.innerHTML = '<option value="">Select room…</option>' +
    rooms.map(r => `<option value="${r}">${r}</option>`).join("");
}

// Remember selections per doctor
function saveLocal() {
  localStorage.setItem("doc_site", siteSel.value || "");
  localStorage.setItem("doc_room", roomSel.value || "");
}
function loadLocal() {
  const s = localStorage.getItem("doc_site") || "";
  const r = localStorage.getItem("doc_room") || "";
  fillSites();
  if (s) siteSel.value = s;
  fillRooms(siteSel.value || "");
  if (r) roomSel.value = r;
}

siteSel.addEventListener("change", () => { fillRooms(siteSel.value); saveLocal(); });
roomSel.addEventListener("change", () => { saveLocal(); });

// Fire a call via HTTP (no token)
callBtn.addEventListener("click", async () => {
  const siteId = normSiteId(siteSel.value);
  const room = roomSel.value;
  if (!siteId) return alert("Choose a site");
  if (!room)   return alert("Choose a room");

  try {
    const res = await fetch(`/call?site=${siteId}&room=${encodeURIComponent(room)}`);
    const data = await res.json();
    if (!data?.ok) throw new Error(data?.error || "Call failed");
    callBtn.blur();
  } catch (e) {
    alert("Call failed: " + (e?.message || e));
  }
});

loadLocal();
