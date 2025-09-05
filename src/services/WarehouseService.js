import api from "./axios"

let sampleWarehouses = [
  { id: "01", name: "Warehouse A", location: "Hà Nội" },
  { id: "02", name: "Warehouse B", location: "HCM" }
]

export const warehouseService = {
  async getAll() {
    try {
      const { data } = await api.get("/api/warehouses")
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      return out ?? sampleWarehouses
    } catch { return sampleWarehouses }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/api/warehouses/${encodeURIComponent(id)}`)
      return data?.result ?? data ?? sampleWarehouses.find(x=>x.id===id) ?? null
    } catch { return sampleWarehouses.find(x=>x.id===id) ?? null }
  },

  async create(payload) {
    try {
      const { data } = await api.post(`/api/warehouses`, payload)
      return data?.result ?? data
    } catch {
      const item = { id: crypto.randomUUID?.() ?? Date.now().toString(16), ...payload }
      sampleWarehouses = [item, ...sampleWarehouses]; return item
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/warehouses/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      sampleWarehouses = sampleWarehouses.map(x => x.id===id ? { ...x, ...payload } : x)
      return sampleWarehouses.find(x=>x.id===id)
    }
  },

  async remove(id) {
    try { await api.delete(`/api/warehouses/${encodeURIComponent(id)}`); return true }
    catch { sampleWarehouses = sampleWarehouses.filter(x=>x.id!==id); return true }
  }
}
