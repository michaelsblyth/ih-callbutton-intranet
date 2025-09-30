const $ = (s) => document.querySelector(s);
const siteEl = $("#site");
const roomEl = $("#room");
const btn = $("#call");

const socket = io();
btn.addEventListener("click", () => {
  const site = siteEl.value.trim();
  const room = roomEl.value.trim();
  if (!site || !room) return alert("Enter site and room");
  socket.emit("call", { site, room });
  btn.blur();
});
