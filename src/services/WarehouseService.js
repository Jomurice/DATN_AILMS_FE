import api from "./axios";

export const warehouseService = {
    async getAll() {
        const response = await api.get("/api/warehouses");
        return response.data.result;
    },

    async getWarehouseById(warehouseId) {
        const response = await api.get(`/api/warehouses/${warehouseId}`);
        return response.data.result;
    },

    async createWarehouse(warehouseData) {
        const response = await api.post("/api/warehouses", warehouseData);
        return response.data.result;
    },

    async updateWarehouse(warehouseId, warehouseData) {
        const response = await api.put(`/api/warehouses/${warehouseId}`, warehouseData);
        return response.data.result;
    },

    async enbleWarehouse(warehouseId) {
        const response = await api.put(`/api/warehouses/enable/${warehouseId}`);
        return response.data.result;
    }
}