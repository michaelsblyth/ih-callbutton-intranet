// Sites (internal IDs) -> labels shown in dropdowns
export const SITES = [
  { id: "LAUMONE",    label: "L’Aumone" },
  { id: "STSAMPSONS", label: "St Sampson’s" },
  { id: "TOWN",       label: "Town" }
];

// Rooms per site
export const ROOMS = {
  LAUMONE: [
    ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
    "A1","A2","A3","A4","A5"
  ],
  STSAMPSONS: Array.from({ length: 16 }, (_, i) => String(i + 1)),
  TOWN:       Array.from({ length:  4 }, (_, i) => String(i + 1))
};

export const siteById = (id) => SITES.find(s => s.id === id);

export function normSiteId(input) {
  const cleaned = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return SITES.some(s => s.id === cleaned) ? cleaned : "";
}
