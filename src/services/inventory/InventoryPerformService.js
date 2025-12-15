// src/services/inventory/InventoryPerformService.js
import api from '../axios';

export const inventoryPerformService = {

  // Lấy phiếu kiểm kê theo ID
  async getCheckById(checkId) {
    const response = await api.get(`/api/inventories/${checkId}`);
    return response.data.result;
  },

  // Lấy danh sách items theo phiếu ID
  async getItemsByCheckId(checkId) {
    const response = await api.get(`/api/inventories/${checkId}/items`);
    return response.data.result || [];
  },

  // Quét serial
  async scanSerial(checkId, serialNumber, scannedByUserId) {
    const params = { serialNumber };
    if (scannedByUserId) params.scannedByUserId = scannedByUserId;
    const response = await api.post(`/api/inventories/${checkId}/scan`, null, { params });
    return response.data.result;
  },

  // Cập nhật item (countedQuantity, note, status)
  async updateItem(itemId, payload) {
    const response = await api.put(`/api/inventories/items/${itemId}`, payload);
    return response.data.result;
  },

  // Hoàn thành kiểm kê (tính status MATCHED/SHORTAGE/OVERAGE)
  async completeCheck(checkId) {
    const response = await api.post(`/api/inventories/${checkId}/complete`);
    return response.data.result;
  },

  // Lưu tạm (update all items)
  async saveTemporary(checkId, items) {
    // Giả sử batch update, hoặc loop call updateItem
    const promises = items.map(item => updateItem(item.id, { countedQuantity: item.countedQuantity, note: item.note }));
    await Promise.all(promises);
    return { message: 'Lưu tạm thành công' };
  },

  // Gợi ý serial (search)
  async suggestSerials(checkId, query) {
    const response = await api.get(`/api/inventories/${checkId}/serials/suggest`, { params: { q: query } });
    return response.data.result || [];
  },
};