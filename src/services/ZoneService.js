import api from "./axios";

export const zoneService = {
  // Lấy tất cả zone
  async getAll() {
    try {
      const { data } = await api.get("/api/zones");
      return Array.isArray(data?.result) ? data.result : [];
    } catch (err) {
      console.error("zoneService.getAll error", err);
      return [];
    }
  },

  // Lấy zone theo warehouse UUID
  async getByWarehouse(warehouseId) {
    try {
      const { data } = await api.get(`/api/zones/warehouse/${encodeURIComponent(warehouseId)}`);
      return Array.isArray(data?.result) ? data.result : [];
    } catch (err) {
      console.error("zoneService.getByWarehouse error", err);
      return [];
    }
  },

  // Lấy chi tiết zone theo id
  async getById(zoneId) {
    try {
      const { data } = await api.get(`/api/zones/${encodeURIComponent(zoneId)}`);
      return data?.result ?? null;
    } catch (err) {
      console.error("zoneService.getById error", err);
      return null;
    }
  },

  // Tạo mới zone
  async create(payload) {
    try {
      const { data } = await api.post("/api/zones", payload,{
      headers: { "Content-Type": "application/json" }
    });
      return data?.result ?? null;
    } catch (err) {
      console.error("zoneService.create error", err);
      return null;
    }
  },

  // Cập nhật zone
  async update(zoneId, payload) {
    try {
      const { data } = await api.put(`/api/zones/${encodeURIComponent(zoneId)}`, payload);
      return data?.result ?? null;
    } catch (err) {
      console.error("zoneService.update error", err);
      return null;
    }
  }
};
