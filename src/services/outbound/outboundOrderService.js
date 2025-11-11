// src/services/outboundOrderService.js
import api from "../axios";
import { fire, EVENTS } from "../eventBus";



export const outboundOrderService = {

  async getAll() {
    const response = await api.get('api/outbound-orders');
    return response.data?.result;
  },

  async create(payload) {
    const response = await api.post('api/outbound-orders', payload);
    return response.data?.result;
  },

  async getById(id) {
    const response = await api.get(`/api/outbound-orders/${id}`);
    return response.data?.result;
  },

  async getSerials(orderId, sku) {
    const response = await api.get(`/api/outbound-orders/${orderId}/serials`, {
      params: { sku }
    });
    return response.data?.result;
  },

  async scanned(orderId, payload) {
    const response = await api.post(`/api/outbound-orders/${orderId}/scanned`, payload);
    return response.data?.result;
  },

  async updateStatus(id, payload) {
    const response = await api.patch(`/api/outbound-orders/${id}/confirm`, payload);
    return response.data?.result;
  },

  async confirmExport(orderId, payload) {
    const response = await api.post(`/api/outbound-orders/${orderId}/confirm-export`, payload);
    return response.data?.result;
  }
};  
