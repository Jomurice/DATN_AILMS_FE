import api from "./axios";

export const inventoryCheckService = {
  // --- 1. CRUD HEADER (CÓ PHÂN TRANG) ---
  
  // Cập nhật hàm getAll nhận tham số
  async getAll(status = "ALL", page = 0, size = 10) {
    const response = await api.get("/api/inventories", {
      params: { 
        status, 
        page, 
        size,
        sort: "createdAt,desc" 
      }
    });
    return response.data?.result; 
  },

  async getById(id) { return (await api.get(`/api/inventories/${id}`)).data?.result; },
  
  async create(payload) { return (await api.post("/api/inventories", payload)).data?.result; },
  
  async update(id, payload) { return (await api.put(`/api/inventories/${id}`, payload)).data?.result; },
  
  async delete(id) { return (await api.delete(`/api/inventories/${id}`)).data?.result; },

  // --- 2. FLOW API (QUAN TRỌNG) ---
  
  // Bắt đầu kiểm kê (Tạo Snapshot) - Giữ lại để tương thích dù logic đã chuyển sang create
  async startCheck(id, checkedByUserId) {
    const response = await api.post(`/api/inventories/${id}/start`, null, {
      params: { checkedByUserId }
    });
    return response.data?.result;
  },

  async completeCheck(id) { return (await api.post(`/api/inventories/${id}/complete`)).data?.result; },
  
  async closeCheck(id) { return (await api.post(`/api/inventories/${id}/close`)).data?.result; },

  // --- 3. ITEMS & SCANNING ---
  
  async getItems(id) { return (await api.get(`/api/inventories/${id}/items`)).data?.result || []; },
  
  async scanSerial(id, serialNumber, scannedByUserId) {
    return (await api.post(`/api/inventories/${id}/scan`, null, { 
      params: { serialNumber, scannedByUserId } 
    })).data?.result;
  },
  
  async suggestSerials(id, query) {
    return (await api.get(`/api/inventories/${id}/serials/suggest`, { params: { q: query } })).data?.result || [];
  },
  
  async deleteItemManual(id, itemId) { return (await api.delete(`/api/inventories/${id}/items/${itemId}`)).data?.result; },

  // --- 4. PREVIEW ---
  async getStockPreview(warehouseId) {
    const response = await api.get(`/api/product-details/warehouse/${warehouseId}`);
    return response.data?.result || [];
  }
};