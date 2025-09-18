import api from "./axios"

export const warehouseService = {
  async getAll() {
    const { data } = await api.get("/api/warehouses")
    return data?.result ?? data ?? []
  },
  async getById(id) {
    const { data } = await api.get(`/api/warehouses/${encodeURIComponent(id)}`)
    return data?.result ?? data ?? null
  },
  async create(payload) {
    const { data } = await api.post(`/api/warehouses`, payload)
    return data?.result ?? data
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/warehouses/${encodeURIComponent(id)}`, payload)
    return data?.result ?? data
  },
  async remove(id) {
    await api.delete(`/api/warehouses/${encodeURIComponent(id)}`)
    return true
  }
}
