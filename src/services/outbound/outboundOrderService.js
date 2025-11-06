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

  async getByOutboundId(id) {
    const response = await api.get(`/api/outbound-orders/${id}`);
    return response.data?.result;
  },

  async updateStatus(id, payload) {
    const response = await api.patch(`/api/outbound-orders/${id}/confirm`, payload);
    fire(EVENTS.OUTBOUND_ORDER_STATUS_UPDATED, { id, payload });
    return response.data?.result;
  },

};  
