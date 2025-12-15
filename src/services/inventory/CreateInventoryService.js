// src/services/inventory/CreateInventoryService.js
import api from '../axios';

export const inventoryCheckService = {

  // Lấy danh sách sản phẩm/serial tồn kho theo Kho ID
  async getProductsByWarehouse(warehouseId) {
    if (!warehouseId) return [];
    const response = await api.get(`/api/inventories/products/by-warehouse/${warehouseId}/instock`);
    return response.data.result || [];
  },

  // Tạo Phiếu Kiểm Kê
  async createCheck(payload) {
    const response = await api.post('/api/inventories', payload);
    return response.data.result;
  },

  // Thêm Item thủ công vào Phiếu
  async addItemManual(checkId, itemPayload) {
    const response = await api.post(`/api/inventories/${checkId}/items`, itemPayload);
    return response.data.result;
  },

  // Lấy danh sách Kho (tái sử dụng từ warehouseService nếu cần)
  async getWarehouses() {
    const response = await api.get('/api/warehouses');
    return response.data.result;
  },
};