// src/services/BinService.js
import api from "./axios";

export const viStatus = (s) =>
  ({ AVAILABLE: "Có sẵn", RESERVED: "Đã giữ", SOLD: "Đã bán", DEFECTIVE: "Lỗi" }[s] ?? s ?? "—");

export const binService = {
  // GET /api/bins
  async getAll() {
    const { data } = await api.get(`/api/bins`);
    return data?.result ?? data ?? [];
  },

  // GET /api/bins/{binId}
  async getById(binId) {
    const { data } = await api.get(`/api/bins/${binId}`);
    return data?.result ?? data ?? null;
  },

  // GET /api/bins/shelf/{shelfId}
  async listByShelf(shelfId) {
    const { data } = await api.get(`/api/bins/shelf/${shelfId}`);
    return data?.result ?? data ?? [];
  },

  // POST /api/bins  (body phải có shelfId)
  async create(shelfId, payload) {
    const body = {
      name: payload.name,
      code: payload.code,
      capacity: payload.capacity,
      currentQty: payload.currentQty,
      preferredProductId: payload.preferredProductId ?? null,
      shelfId
    };
    const { data } = await api.post(`/api/bins`, body);
    return data?.result ?? data;
  },

  // PUT /api/bins/{binId}
  async update(binId, payload) {
    const body = {
      name: payload.name,
      code: payload.code,
      capacity: payload.capacity,
      currentQty: payload.currentQty,
      preferredProductId: payload.preferredProductId ?? null,
      ...(payload.shelfId ? { shelfId: payload.shelfId } : {})
    };
    const { data } = await api.put(`/api/bins/${binId}`, body);
    return data?.result ?? data;
  },

  // BE hiện không có DELETE /api/bins/{binId}
  async remove() {
    throw new Error("Backend chưa có DELETE /api/bins/{binId}.");
  }
};

// import api from "./axios"

// export const viStatus = s =>
//   ({ AVAILABLE: "Có sẵn", RESERVED: "Đã giữ", SOLD: "Đã bán", DEFECTIVE: "Lỗi" }[s] ?? s ?? "—")

// export const binService = {
//   // Lấy all rồi lọc theo shelfId (vì BE flat)
//   async list(shelfId) {
//     const { data } = await api.get(`/api/bins`)
//     const list = data?.result ?? data ?? []
//     return shelfId ? list.filter(b => String(b.shelfId) === String(shelfId)) : list
//   },

//   async getById(id) {
//     const { data } = await api.get(`/api/bins/${encodeURIComponent(id)}`)
//     return data?.result ?? data ?? null
//   },

//   // Tạo mới: name, code, capacity, currentQty, preferredProductId, shelfId
//   async create(shelfId, payload) {
//     const body = { ...payload, shelfId }
//     const { data } = await api.post(`/api/bins`, body)
//     return data?.result ?? data
//   },

//   // Cập nhật: name, code, capacity, currentQty, preferredProductId (+ shelfId nếu cho phép chuyển ngăn)
//   async update(id, payload) {
//     const body = {
//       name: payload.name,
//       code: payload.code,
//       capacity: payload.capacity,
//       currentQty: payload.currentQty,
//       preferredProductId: payload.preferredProductId
//     }
//     if (payload.shelfId) body.shelfId = payload.shelfId
//     const { data } = await api.put(`/api/bins/${encodeURIComponent(id)}`, body)
//     return data?.result ?? data
//   },

//   async remove(id) {
//     await api.delete(`/api/bins/${encodeURIComponent(id)}`)
//     return true
//   }
// }
