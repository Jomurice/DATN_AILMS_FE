import api from "../axios";

export const purchaseOrderItemService = {

  async addItem(orderId, payload) {
    const response = await api.post(`/api/purchase-orders-items/${orderId}`, payload);
    return response.data.result;
  },


  async removeItem(itemId) {
    const response = await api.delete(`/api/purchase-orders-items/${itemId}`);
    return response.data.result;
  },

  async scanSerial(itemId, serial, userId) {
    const response = await api.post(`/api/purchase-orders-items/${itemId}/scan`, null, {
      params: { serial, userId }
    });
    return response.data.result;
  }
};
