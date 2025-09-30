const $ = (s) => document.querySelector(s);
const siteEl = $("#site");
const roomEl = $("#room");
const btn = $("#call");
const example = $("#exampleUrl");

const socket = io({ transports: ["websocket"] });

function normSite(val){
  return String(val || "").toUpperCase().replace(/[^A-Z0-9]/g,"");
}

function updateExample(){
  const s = normSite(siteEl.value) || "LAUMONE";
  const r = roomEl.value || "3";
  example.textContent = `/call?site=${s}&room=${r}&token=SECRET`;
}
siteEl.addEventListener("change", updateExample);
roomEl.addEventListener("change", updateExample);
updateExample();

btn.addEventListener("click", () => {
  const site = normSite(siteEl.value);
  const room = roomEl.value;
  if (!site || !room) { alert("Choose a site and room"); return; }
  socket.emit("call", { site, room });
  btn.blur();
});
