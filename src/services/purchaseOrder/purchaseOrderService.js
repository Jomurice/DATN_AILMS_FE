import api from "../axios";

export const purchaseOrderService = {


  async getAllPurchaseOrders() {
    const response = await api.get('/api/purchase-orders');
    return response.data.result;
  },

  async getPurchaseOrderById(orderId, params = {}) {
    const response = await api.get(`/api/purchase-orders/${orderId}`, { params });
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
  },


  async searchPurchaseOrders({ page = 0, size = 10, status = null, keyword = null }) {
    const response = await api.get('/api/purchase-orders/search-po', {
      params: { page, size, status, keyword }
    });
    return response.data.result;
  },

  
  async downloadQrCodes(orderId) {
    const response = await api.get(`/api/purchase-orders/${orderId}/qrcodes`, {
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcodes.zip";
    a.click();

    window.URL.revokeObjectURL(url);
  }
};