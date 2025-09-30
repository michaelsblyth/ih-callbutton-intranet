// Canonical site IDs (internal) -> human labels shown in dropdowns
export const SITES = [
  { id: "LAUMONE",    label: "L’Aumone" },
  { id: "STSAMPSONS", label: "St Sampson’s" },
  { id: "TOWN",       label: "Town" }
];

// Rooms per site
export const ROOMS = {
  LAUMONE: [
    // 1–12
    ...Array.from({length:12}, (_,i)=>String(i+1)),
    // A1–A5
    ..."A".split(""), // keep generator simple
  ].flatMap(r => r === "A" ? ["A1","A2","A3","A4","A5"] : [r]),
  STSAMPSONS: Array.from({length:16}, (_,i)=>String(i+1)),
  TOWN: Array.from({length:4},  (_,i)=>String(i+1))
};

// Utility: find site object by id
export const siteById = (id) => SITES.find(s => s.id === id);

// Normalize any string to a safe site ID (fallback to empty)
export function normSiteId(input) {
  const cleaned = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return SITES.some(s => s.id === cleaned) ? cleaned : "";
}
