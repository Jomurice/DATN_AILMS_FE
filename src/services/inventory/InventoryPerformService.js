// src/services/inventory/InventoryPerformService.js
import axios from 'axios';

const API_BASE_URL = '/api/inventories'; 

export const inventoryPerformService = {

    // 1. GET: Lấy danh sách tất cả phiếu kiểm kê (cho sidebar)
    // GET /api/inventories
    async getAllChecks() {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data.result || response.data;
        } catch (error) {
            console.error("Lỗi khi tải danh sách phiếu kiểm kê:", error);
            throw error;
        }
    },

    // 2. GET: Lấy chi tiết header phiếu kiểm kê
    // GET /api/inventories/{id}
    async getCheckById(checkId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/${checkId}`);
            return response.data.result;
        } catch (error) {
            console.error(`Lỗi khi tải phiếu ${checkId}:`, error);
            throw error;
        }
    },

    // 3. GET: Lấy danh sách items chi tiết trong phiếu (Item list)
    // GET /api/inventories/{id}/items
    async getItemsByCheckId(checkId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/${checkId}/items`);
            return response.data.result || response.data;
        } catch (error) {
            console.error(`Lỗi khi tải items của phiếu ${checkId}:`, error);
            throw error;
        }
    },

    // 4. POST: Bắt đầu kiểm kê (Chuyển trạng thái DRAFT -> IN_PROGRESS)
    // POST /api/inventories/{id}/start?checkedByUserId={userId}
    async startCheck(checkId, checkedByUserId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/${checkId}/start`, null, {
                params: {
                    checkedByUserId: checkedByUserId
                }
            });
            return response.data.result;
        } catch (error) {
            console.error("Lỗi khi bắt đầu kiểm kê:", error);
            throw error;
        }
    },

    // 5. PUT: Cập nhật thủ công SL đếm thực tế (Lưu tạm thời)
    // PUT /api/inventories/{checkId}/items/{itemId}
    async updateItemManual(checkId, itemId, payload) {
        // payload = { countedQuantity, note, ... }
        try {
            const response = await axios.put(`${API_BASE_URL}/${checkId}/items/${itemId}`, payload);
            return response.data.result;
        } catch (error) {
            console.error(`Lỗi khi cập nhật Item ${itemId}:`, error);
            throw error;
        }
    },

    // 6. POST: Hoàn tất kiểm kê
    // POST /api/inventories/{id}/complete
    async completeCheck(checkId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/${checkId}/complete`);
            return response.data.result;
        } catch (error) {
            console.error("Lỗi khi hoàn tất kiểm kê:", error);
            throw error;
        }
    },
    
    // 7. POST: Quét Serial (Quick Scan)
    // POST /api/inventories/{id}/scan?serialNumber={serial}&scannedByUserId={userId}
    async scanSerial(checkId, serialNumber, scannedByUserId) {
        try {
            const response = await axios.post(`${API_BASE_URL}/${checkId}/scan`, null, {
                params: {
                    serialNumber: serialNumber,
                    scannedByUserId: scannedByUserId
                }
            });
            return response.data.result;
        } catch (error) {
            console.error("Lỗi khi quét Serial:", error);
            throw error;
        }
    }
};