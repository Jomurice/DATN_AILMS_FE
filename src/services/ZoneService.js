import api from "./axios"

let sampleZones = [
  { id: "z-01", name: "Zone A", description: "Khu A", warehouse: { id: "w-01", name: "Warehouse A" } },
  { id: "z-02", name: "Zone B", description: "Khu B", warehouse: { id: "w-01", name: "Warehouse A" } },
]

export const zoneService = {
  async getAll(wid) {
    try {
      const { data } = await api.get(`/api/warehouses/${encodeURIComponent(wid)}/zones`)
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      return out ?? sampleZones.filter(z=>z.warehouse?.id===wid)
    } catch { return sampleZones.filter(z=>z.warehouse?.id===wid) }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/api/zones/${encodeURIComponent(id)}`)
      return data?.result ?? data ?? sampleZones.find(x=>x.id===id) ?? null
    } catch { return sampleZones.find(x=>x.id===id) ?? null }
  },

  async create(wid, payload) {
    try {
      const { data } = await api.post(`/api/warehouses/${encodeURIComponent(wid)}/zones`, payload)
      return data?.result ?? data
    } catch {
      const item = { id: crypto.randomUUID?.() ?? Date.now().toString(16), ...payload, warehouse:{ id: wid, name:"—" } }
      sampleZones = [item, ...sampleZones]; return item
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/zones/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      sampleZones = sampleZones.map(x => x.id===id ? { ...x, ...payload } : x)
      return sampleZones.find(x=>x.id===id)
    }
  },

  async remove(id) {
    try { await api.delete(`/api/zones/${encodeURIComponent(id)}`); return true }
    catch { sampleZones = sampleZones.filter(x=>x.id!==id); return true }
  }
}
