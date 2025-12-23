import api from "../axios";

export const productDetailsService = {

  async getAll() {
    const response = await api.get('/api/product-details');
    return response.data.result;
  },


  async getByProductId(productId) {
    const response = await api.get(`/api/product-details/${productId}`);
    return response.data.result;
  },


  async getBySerial(serial) {
    const response = await api.get(`/api/product-details/by-serial`, {
      params: { serial },
    });
    return response.data.result;
  },

async getByWarehouse(warehouseId) {
    if (!warehouseId) return [];
    const response = await api.get(`/api/inventories/products/by-warehouse/${
      warehouseId}/instock`);
    return response.data.result || []; 
  },

  async createSerial(payload) {
    const response = await api.post('/api/product-details/create-serial', payload);
    return response.data.result;
  },

  
  async createSerialBatch(payload, quantity) {
    const response = await api.post(`/api/product-details/create-serial-batch/${quantity}`, payload);
    return response.data.result;
  },

 
  async confirmScan(payload) {
    const response = await api.post('/api/product-details/confirm-scan', payload);
    return response.data.result;
  },


  async createSerialForPO(payload) {
    const response = await api.post('/api/product-details/create-serial-for-po', payload);
    return response.data.result;
  },
};
