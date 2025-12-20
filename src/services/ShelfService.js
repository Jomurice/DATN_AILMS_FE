import api from "./axios";

export const shelfService = {
  async getAll(aisleId) {
    if (aisleId) {
      const { data } = await api.get(`/api/shelves/aisle/${aisleId}`);
      return data?.result ?? data ?? [];
    }
    const { data } = await api.get(`/api/shelves`);
    return data?.result ?? data ?? [];
  },

  // GET /api/shelves/{shelfId}
  async getById(shelfId) {
    const { data } = await api.get(`/api/shelves/${shelfId}`);
    return data?.result ?? data ?? null;
  },

  // POST /api/shelves  (body cần aisleId)
  async create(aisleId, payload) {
    const body = { ...payload, aisleId };
    const { data } = await api.post(`/api/shelves`, body);
    return data?.result ?? data;
  },

  // PUT /api/shelves/{shelfId}
  async update(shelfId, payload) {
    const body = { name: payload.name, code: payload.code };
    if (payload.aisleId) body.aisleId = payload.aisleId;
    const { data } = await api.put(`/api/shelves/${shelfId}`, body);
    return data?.result ?? data;
  },

  async remove(shelfId) {
    // Swagger không có DELETE /api/shelves/{shelfId}
    throw new Error("Backend chưa cung cấp DELETE /api/shelves/{shelfId}");
    // await api.delete(`/api/shelves/${shelfId}`)
    //  return true
  },
};

// import api from "./axios"

// export const shelfService = {
//   // BE flat: chưa thấy endpoint filter => lấy all rồi lọc theo aisleId
//   async getAll(aisleId) {
//     const { data } = await api.get(`/api/shelves`)
//     const list = data?.result ?? data ?? []
//     return aisleId ? list.filter(s => String(s.aisleId) === String(aisleId)) : list
//   },

//   async getById(id) {
//     const { data } = await api.get(`/api/shelves/${encodeURIComponent(id)}`)
//     return data?.result ?? data ?? null
//   },

//   // Tạo mới: name, code, aisleId
//   async create(aisleId, payload) {
//     const body = { ...payload, aisleId }
//     const { data } = await api.post(`/api/shelves`, body)
//     return data?.result ?? data
//   },

//   // Cập nhật: name, code (+ tuỳ BE có cho đổi aisleId không; để tuỳ chọn)
//   async update(id, payload) {
//     const body = { name: payload.name, code: payload.code }
//     if (payload.aisleId) body.aisleId = payload.aisleId
//     const { data } = await api.put(`/api/shelves/${encodeURIComponent(id)}`, body)
//     return data?.result ?? data
//   },

//   async remove(id) {
//     await api.delete(`/api/shelves/${encodeURIComponent(id)}`)
//     return true
//   }
// }
