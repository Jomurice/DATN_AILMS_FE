import api from "./axios"

export const shelfService = {
  // BE flat: chưa thấy endpoint filter => lấy all rồi lọc theo aisleId
  async getAll(aisleId) {
    const { data } = await api.get(`/api/shelves`)
    const list = data?.result ?? data ?? []
    return aisleId ? list.filter(s => String(s.aisleId) === String(aisleId)) : list
  },

  async getById(id) {
    const { data } = await api.get(`/api/shelves/${encodeURIComponent(id)}`)
    return data?.result ?? data ?? null
  },

  // Tạo mới: name, code, aisleId
  async create(aisleId, payload) {
    const body = { ...payload, aisleId }
    const { data } = await api.post(`/api/shelves`, body)
    return data?.result ?? data
  },

  // Cập nhật: name, code (+ tuỳ BE có cho đổi aisleId không; để tuỳ chọn)
  async update(id, payload) {
    const body = { name: payload.name, code: payload.code }
    if (payload.aisleId) body.aisleId = payload.aisleId
    const { data } = await api.put(`/api/shelves/${encodeURIComponent(id)}`, body)
    return data?.result ?? data
  },

  async remove(id) {
    await api.delete(`/api/shelves/${encodeURIComponent(id)}`)
    return true
  }
}
