import api from "./axios";

export const zoneService = {
  async getAll(warehouseId) {
    if (warehouseId) {
      const { data } = await api.get(`/api/zones/warehouse/${warehouseId}`);
      return data?.result ?? data ?? [];
    }
    const { data } = await api.get(`/api/zones`);
    return data?.result ?? data ?? [];
  },

  // GET /api/zones/{zoneId}
  async getById(zoneId) {
    const { data } = await api.get(`/api/zones/${zoneId}`);
    return data?.result ?? data ?? null;
  },

  // POST /api/zones  (body cần warehouseId)
  async create(warehouseId, payload) {
    const body = { ...payload, warehouseId };
    const { data } = await api.post(`/api/zones`, body);
    return data?.result ?? data;
  },

  // PUT /api/zones/{zoneId}
  async update(zoneId, payload) {
    const { data } = await api.put(`/api/zones/${zoneId}`, {
      name: payload.name,
      code: payload.code,
    });
    return data?.result ?? data;
  },

  async remove(zoneId) {
    // Swagger không có DELETE /api/zones/{zoneId}
    throw new Error("Backend chưa cung cấp DELETE /api/zones/{zoneId}");
    //  await api.delete(`/api/zones/${zoneId}`)
    //  return true
  },
};

// import api from "./axios"

// export const zoneService = {
//   // Lấy tất cả zone rồi lọc theo warehouseId ở FE (do BE đang flat)
//   async getAll(warehouseId) {
//     const { data } = await api.get(`/api/zones`)
//     const list = data?.result ?? data ?? []
//     return warehouseId ? list.filter(z => String(z.warehouseId) === String(warehouseId)) : list
//   },

//   async getById(id) {
//     const { data } = await api.get(`/api/zones/${encodeURIComponent(id)}`)
//     return data?.result ?? data ?? null
//   },

//   // BE flat: POST /api/zones với body gồm name, code, warehouseId
//   async create(warehouseId, payload) {
//     const body = { ...payload, warehouseId }
//     const { data } = await api.post(`/api/zones`, body)
//     return data?.result ?? data
//   },

//   // UpdateZoneRequestDto: name, code (không đổi warehouse)
//   async update(id, payload) {
//     const { data } = await api.put(`/api/zones/${encodeURIComponent(id)}`, {
//       name: payload.name,
//       code: payload.code
//     })
//     return data?.result ?? data
//   },

//   async remove(id) {
//     await api.delete(`/api/zones/${encodeURIComponent(id)}`)
//     return true
//   }
// }
