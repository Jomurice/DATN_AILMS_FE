import api from "./axios"

let sampleShelves = [
  { id: "01", name: "Shelf A1", code: "SHELF-A1", aisle:{ id:"01", name:"Aisle 1" }, bins: [
    { id: "01", name: "Bin A1-01", code: "BIN-A1-S1", capacity: 100, currentQty: 20 }
  ]},
  { id: "02", name: "Shelf A2", code: "SHELF-A2", aisle:{ id:"01", name:"Aisle 1" }, bins: [] },
]

export const shelfService = {
  async getAll(aid) {
    try {
      const { data } = await api.get(`/api/aisles/${encodeURIComponent(aid)}/shelves`)
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      return out ?? sampleShelves.filter(s=>s.aisle?.id===aid)
    } catch { return sampleShelves.filter(s=>s.aisle?.id===aid) }
  },

async getByAisle(shelfId) {
  try {
    const { data } = await api.get(`/api/shelves/aisle/${encodeURIComponent(shelfId)}`);
    return Array.isArray(data?.result) ? data.result : [];
  } catch (err) {
    console.error("shelfService.getByAisle error", err);
    return [];
  }
},

  async create(payload) {
    try {
      const { data } = await api.post(`/api/shelves`, payload)
      return data?.result ?? data
    } catch {
      const item = { id: crypto.randomUUID?.() ?? Date.now().toString(16), ...payload, aisle:{ id: aid, name:"—" }, bins: [] }
      sampleShelves = [item, ...sampleShelves]; return item
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/shelves/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      sampleShelves = sampleShelves.map(x => x.id===id ? {
        ...x,
        name: payload.name ?? x.name,
        code: payload.code ?? x.code,
        aisle: payload.aisleId ? { id: payload.aisleId, name: x.aisle?.name ?? "—" } : x.aisle
      } : x)
      return sampleShelves.find(x=>x.id===id)
    }
  },

  async remove(id) {
    try { await api.delete(`/api/shelves/${encodeURIComponent(id)}`); return true }
    catch { sampleShelves = sampleShelves.filter(x=>x.id!==id); return true }
  }
}
