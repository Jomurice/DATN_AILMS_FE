import api from './axios';

export const warehouseService = {

  async getAllWarehouses() {
    const response = await api.get('/api/warehouses');
    return response.data.result;
  },

  async getTreeByLocation(locationId) {
    const response = await api.get(`/api/warehouses/tree/location/${locationId}`);
    return response.data.result;
  },

 
  async getWarehouseById(warehouseId) {
    const response = await api.get(`/api/warehouses/${warehouseId}`);
    return response.data.result;
  },


  async createWarehouse(payload) {
    const response = await api.post('/api/warehouses', payload);
    return response.data.result;
  },


  async updateWarehouse(warehouseId, payload) {
    const response = await api.put(`/api/warehouses/${warehouseId}`, payload);
    return response.data.result;
  },
};