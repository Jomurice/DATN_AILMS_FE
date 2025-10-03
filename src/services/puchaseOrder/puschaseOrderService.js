import api from "../axios";

export const purchaseOrderService = {


  async getAllPurchaseOrders() {
    const response = await api.get('/api/purchase-orders');
    return response.data.result;
  },

  async getPurchaseOrderById(orderId) {
    const response = await api.get(`/api/purchase-orders/${orderId}`);
    return response.data.result;
  },


  async createPurchaseOrder(payload) {
    const response = await api.post('/api/purchase-orders', payload);
    return response.data.result;
  },

  async updatePurchaseOrder(orderId, payload) {
    const response = await api.put(`/api/purchase-orders/${orderId}`, payload);
    return response.data.result;
  },

  async deletePurchaseOrder(orderId) {
    const response = await api.delete(`/api/purchase-orders/${orderId}`);
    return response.data.result;
  },


  async completePurchaseOrder(orderId, userId) {
    const response = await api.post(`/api/purchase-orders/${orderId}/complete`, null, {
      params: { userId }
    });
    return response.data.result;
  },

  
  async getSerials(orderId, sku = null) {
    const response = await api.get(`/api/purchase-orders/${orderId}/serials`, {
      params: sku ? { sku } : {}
    });
    return response.data.result;
  }
};