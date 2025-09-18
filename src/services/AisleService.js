import api from "./axios"

export const aisleService = {
  // Lấy tất cả aisle rồi lọc theo zoneId ở FE
  async getAll(zoneId) {
    const { data } = await api.get(`/api/aisles`)
    const list = data?.result ?? data ?? []
    return zoneId ? list.filter(a => String(a.zoneId) === String(zoneId)) : list
  },

  async getById(id) {
    const { data } = await api.get(`/api/aisles/${encodeURIComponent(id)}`)
    return data?.result ?? data ?? null
  },

  // BE flat: POST /api/aisles với body gồm name, code, zoneId
  async create(zoneId, payload) {
    const body = { ...payload, zoneId }
    const { data } = await api.post(`/api/aisles`, body)
    return data?.result ?? data
  },

  // UpdateAisleRequestDto: name, code (không đổi zone)
  async update(id, payload) {
    const { data } = await api.put(`/api/aisles/${encodeURIComponent(id)}`, {
      name: payload.name,
      code: payload.code
    })
    return data?.result ?? data
  },

  async remove(id) {
    await api.delete(`/api/aisles/${encodeURIComponent(id)}`)
    return true
  }
}
