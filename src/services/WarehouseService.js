import axios from "axios";

export const warehouseService = {
    async getAll() {
        const response = await axios.get("/api/warehouses");
        return response.data.result;
    },

    async getWarehouseById(warehouseId) {
        const response = await axios.get(`/api/warehouses/${warehouseId}`);
        return response.data.result;
    },

    async createWarehouse(warehouseData) {
        const response = await axios.post("/api/warehouses", warehouseData);
        return response.data.result;
    },

    async updateWarehouse(warehouseId, warehouseData) {
        const response = await axios.put(`/api/warehouses/${warehouseId}`, warehouseData);
        return response.data.result;
    },

    async enableWarehouse(warehouseId) {
        const response = await axios.put(`/api/warehouses/enable/${warehouseId}`);
        return response.data.result;
    }
}