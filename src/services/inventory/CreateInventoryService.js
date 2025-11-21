// src/services/inventory/CreateInventoryService.js
import axios from 'axios';
// import router from '@/router'; // Import router nếu cần xử lý lỗi 401/logout

// Đảm bảo BASE_URL đã được cấu hình toàn cục trong axios, 
// và Axios Interceptor tự động thêm JWT Token vào Header.

const API_INVENTORIES = '/api/inventories';     
const API_WAREHOUSES = '/api/warehouses';       
const API_PRODUCT_DETAILS = '/api/product-details'; 

// Hàm gọi API cơ bản (sử dụng cấu trúc ApiResp<T> của BE)
async function apiCall(method, url, data = null) {
    try {
        const response = await axios({ method, url, data });
        
        // Kiểm tra format response chuẩn của BE (ApiResp<T>)
        if (response.data && response.data.code !== 1000) {
             // BE trả lỗi nghiệp vụ (ví dụ: User not found, Serial existed)
             throw new Error(response.data.message || 'Lỗi nghiệp vụ từ Server.');
        }
        return response.data.result;
    } catch (error) {
        // Xử lý lỗi HTTP (Ví dụ: 401, 403, 404, 500)
        // Nếu bạn muốn xử lý lỗi 401 để logout, hãy thêm logic ở đây
        throw error; 
    }
}

export const inventoryCheckService = {

    // 1. Lấy danh sách Kho
    async getWarehouses() {
        // ✅ [FIX] BE dùng GET /api/warehouses
        return apiCall('GET', API_WAREHOUSES); 
    },
    
    // 2. Lấy danh sách Serial tồn kho theo Kho ID (CẦN API MỚI TRÊN BE)
    async getProductsByWarehouse(warehouseId) {
        if (!warehouseId) return [];

        // ✅ [NEW API] GIẢ ĐỊNH API MỚI TRÊN BE: GET /api/product-details/by-warehouse/{warehouseId}/instock
        // API này phải trả về danh sách Serial có trạng thái IN_WAREHOUSE
        const endpoint = `${API_PRODUCT_DETAILS}/by-warehouse/${warehouseId}/instock`; 

        try {
            const data = await apiCall('GET', endpoint);
            // Data trả về phải là List<ProductDetailResponseDto> (hoặc DTO mở rộng)
            return data;
        } catch (error) {
            console.error("Lỗi tải Serial tồn kho:", error);
            throw error; 
        }
    },

    // 3. Tạo Phiếu Kiểm Kê (POST /api/inventories)
    async createCheck(payload) {
        return apiCall('POST', API_INVENTORIES, payload);
    },

    // 4. Thêm Item thủ công vào Phiếu (POST /api/inventories/{id}/items)
    async addItemManual(checkId, itemPayload) {
        const url = `${API_INVENTORIES}/${checkId}/items`;
        return apiCall('POST', url, itemPayload);
    },
};