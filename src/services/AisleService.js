import api from "./axios";

export const aisleService = {
  async getAll(zoneId) {
    if (zoneId) {
      const { data } = await api.get(`/api/aisles/zone/${zoneId}`);
      return data?.result ?? data ?? [];
    }
    const { data } = await api.get(`/api/aisles`);
    return data?.result ?? data ?? [];
  },

  // GET /api/aisles/{aisleId}
  async getById(aisleId) {
    const { data } = await api.get(`/api/aisles/${aisleId}`);
    return data?.result ?? data ?? null;
  },

  // POST /api/aisles  (body cần zoneId)
  async create(zoneId, payload) {
    const body = { ...payload, zoneId };
    const { data } = await api.post(`/api/aisles`, body);
    return data?.result ?? data;
  },

  // PUT /api/aisles/{aisleId}
  async update(aisleId, payload) {
    const { data } = await api.put(`/api/aisles/${aisleId}`, {
      name: payload.name,
      code: payload.code,
    });
    return data?.result ?? data;
  },

  async remove(aisleId) {
    // Swagger không có DELETE /api/aisles/{aisleId}
    throw new Error("Backend chưa cung cấp DELETE /api/aisles/{aisleId}");
     //  await api.delete(`/api/aisles/${aisleId}`)
     // return true
  },
};


// import api from "./axios"

// export const aisleService = {
//   // Lấy tất cả aisle rồi lọc theo zoneId ở FE
//   async getAll(zoneId) {
//     const { data } = await api.get(`/api/aisles`)
//     const list = data?.result ?? data ?? []
//     return zoneId ? list.filter(a => String(a.zoneId) === String(zoneId)) : list
//   },

//   async getById(id) {
//     const { data } = await api.get(`/api/aisles/${encodeURIComponent(id)}`)
//     return data?.result ?? data ?? null
//   },

//   // BE flat: POST /api/aisles với body gồm name, code, zoneId
//   async create(zoneId, payload) {
//     const body = { ...payload, zoneId }
//     const { data } = await api.post(`/api/aisles`, body)
//     return data?.result ?? data
//   },

//   // UpdateAisleRequestDto: name, code (không đổi zone)
//   async update(id, payload) {
//     const { data } = await api.put(`/api/aisles/${encodeURIComponent(id)}`, {
//       name: payload.name,
//       code: payload.code
//     })
//     return data?.result ?? data
//   },

//   async remove(id) {
//     await api.delete(`/api/aisles/${encodeURIComponent(id)}`)
//     return true
//   }
// }
