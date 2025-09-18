import api from "./axios"

export const zoneService = {
 
  async getAll(warehouseId) {
    const { data } = await api.get(`/api/zones`)
    const list = data?.result ?? data ?? []
    return warehouseId ? list.filter(z => String(z.warehouseId) === String(warehouseId)) : list
  },

  async getById(id) {
    const { data } = await api.get(`/api/zones/${encodeURIComponent(id)}`)
    return data?.result ?? data ?? null
  },


  async create(warehouseId, payload) {
    const body = { ...payload, warehouseId }
    const { data } = await api.post(`/api/zones`, body)
    return data?.result ?? data
  },

  // UpdateZoneRequestDto: name, code (không đổi warehouse)
  async update(id, payload) {
    const { data } = await api.put(`/api/zones/${encodeURIComponent(id)}`, {
      name: payload.name,
      code: payload.code
    })
    return data?.result ?? data
  },

  async remove(id) {
    await api.delete(`/api/zones/${encodeURIComponent(id)}`)
    return true
  }
}
