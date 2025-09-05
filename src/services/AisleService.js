import api from "./axios"

let sampleAisles = [
  { id: "01", name: "Aisle 1", code: "A1", zone: { id: "01", name: "Zone A" } },
  { id: "02", name: "Aisle 2", code: "A2", zone: { id: "01", name: "Zone A" } },
]

export const aisleService = {
  async getAll(zid) {
    try {
      const { data } = await api.get(`/api/zones/${encodeURIComponent(zid)}/aisles`)
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      return out ?? sampleAisles.filter(a=>a.zone?.id===zid)
    } catch { return sampleAisles.filter(a=>a.zone?.id===zid) }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/api/aisles/${encodeURIComponent(id)}`)
      return data?.result ?? data ?? sampleAisles.find(x=>x.id===id) ?? null
    } catch { return sampleAisles.find(x=>x.id===id) ?? null }
  },

  async create(zid, payload) {
    try {
      const { data } = await api.post(`/api/zones/${encodeURIComponent(zid)}/aisles`, payload)
      return data?.result ?? data
    } catch {
      const item = { id: crypto.randomUUID?.() ?? Date.now().toString(16), ...payload, zone:{ id: zid, name:"—" } }
      sampleAisles = [item, ...sampleAisles]; return item
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/aisles/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      sampleAisles = sampleAisles.map(x => x.id===id ? { ...x, ...payload } : x)
      return sampleAisles.find(x=>x.id===id)
    }
  },

  async remove(id) {
    try { await api.delete(`/api/aisles/${encodeURIComponent(id)}`); return true }
    catch { sampleAisles = sampleAisles.filter(x=>x.id!==id); return true }
  }
}
