// src/services/outboundOrderService.js
import api from "./axios";
import { fire, EVENTS } from "./eventBus";

// ---- MOCK DATA (fallback) ----
let sampleOutbound = [
  {
    id: "so-2025-001",
    code: "SO-2025-001",
    customer: "Khách hàng A",
    status: "IN_PROGRESS",
    createdAt: "2025-09-26",
    updatedAt: "2025-09-27T08:15:00Z",
    userId: "user-a",
    items: [
      {
        id: "soi-1",
        productId: "f9a0d2d1-1111-4c11-a0c0-111111111111",
        sku: "iphone15prm",
        name: "iPhone 15 Pro Max",
        categoryName: "Điện thoại",
        brandName: "Apple",
        color: "Natural Titanium",
        orderQuantity: 3,
        scannedQuantity: 1
      }
    ]
  }
];

export const outboundOrderService = {
  async list(params = {}) {
    try {
      const { data } = await api.get("/api/outbound-orders", { params });
      const out = Array.isArray(data?.result) ? data.result : data;
      return out ?? [];
    } catch (e) {
      console.warn("[SO] list fail -> use mock", e);
      if (params?.userId) return sampleOutbound.filter(o => String(o.userId) === String(params.userId));
      return sampleOutbound;
    }
  },

  async getById(id, params = {}) {
    try {
      const { data } = await api.get(`/api/outbound-orders/${encodeURIComponent(id)}`, { params });
      return data?.result ?? data;
    } catch (e) {
      console.warn("[SO] getById fail -> use mock", e);
      return sampleOutbound.find(x => x.id === id) ?? null;
    }
  },

  async create(payload) {
    try {
      const { data } = await api.post("/api/outbound-orders", payload);
      return data?.result ?? data;
    } catch (e) {
      console.warn("[SO] create fail -> mock append", e);
      const mock = {
        id: `so-mock-${Date.now()}`,
        code: payload.code || `SO-${Date.now()}`,
        customer: payload.customer || "N/A",
        status: payload.status || "PENDING",
        createdAt: payload.createdAt || new Date().toISOString().slice(0,10),
        updatedAt: null,
        userId: payload.userId || "mock-user",
        items: (payload.items || []).map((it,i)=>({
          id: `soi-${Date.now()}-${i}`,
          productId: it.productId,
          sku: String(it.productId).slice(0,8),
          name: "Unknown",
          categoryName: "",
          brandName: "",
          color: "",
          orderQuantity: Number(it.orderQuantity || 0),
          scannedQuantity: 0
        }))
      };
      sampleOutbound.push(mock);
      return mock;
    }
  },

  async addItem(orderId, { productId, orderQuantity }) {
    try {
      const { data } = await api.post(
        `/api/outbound-orders/${encodeURIComponent(orderId)}/items`,
        { productId, orderQuantity }
      );
      return data?.result ?? data;
    } catch (e) {
      console.warn("[SO] addItem fail -> mock", e);
      sampleOutbound = sampleOutbound.map(so => {
        if (so.id !== orderId) return so;
        const next = { ...so };
        next.items = next.items || [];
        next.items.push({
          id: `soi-${Date.now()}`,
          productId,
          sku: (productId || "").slice(0,8),
          name: "Unknown",
          categoryName: "",
          brandName: "",
          color: "",
          orderQuantity: Number(orderQuantity || 0),
          scannedQuantity: 0
        });
        next.updatedAt = new Date().toISOString();
        return next;
      });
      return true;
    }
  },

  /** DELETE 1 dòng phiếu xuất */
  async removeItem(outboundOrderItemId) {
    try {
      await api.delete(`/api/outbound-orders-items/${encodeURIComponent(outboundOrderItemId)}`);
      return true;
    } catch (e) {
      console.warn("[SO] removeItem fail -> mock remove", e);
      sampleOutbound = sampleOutbound.map(so => ({
        ...so,
        items: (so.items || []).filter(x => x.id !== outboundOrderItemId),
      }));
      return true;
    }
  },

  /** Quét serial cho 1 dòng phiếu xuất */
  async scanItem(outboundOrderItemId, serial, userId) {
    try {
      const { data } = await api.post(
        `/api/outbound-orders-items/${encodeURIComponent(outboundOrderItemId)}/scan`,
        null,
        { params: { serial, userId } }
      );
      return data?.result ?? data;
    } catch (e) {
      console.warn("[SO] scanItem fail -> try serialNumber", e);
      const { data } = await api.post(
        `/api/outbound-orders-items/${encodeURIComponent(outboundOrderItemId)}/scan`,
        null,
        { params: { serialNumber: serial, userId } }
      );
      return data?.result ?? data;
    }
  },

  async complete(id, payload = {}) {
    try {
      const { data } = await api.post(`/api/outbound-orders/${encodeURIComponent(id)}/complete`, payload);
      const res = data?.result ?? data;
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return res;
    } catch (e) {
      console.warn("[SO] complete fail -> mock COMPLETED", e);
      sampleOutbound = sampleOutbound.map(x =>
        x.id === id ? { ...x, status: "COMPLETED", updatedAt: new Date().toISOString() } : x
      );
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return true;
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/outbound-orders/${encodeURIComponent(id)}`, payload);
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return data?.result ?? data;
    } catch (e) {
      console.warn("[SO] update fail -> mock", e);
      sampleOutbound = sampleOutbound.map(x => (x.id === id ? { ...x, ...payload, updatedAt: new Date().toISOString() } : x));
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return sampleOutbound.find(x => x.id === id) ?? null;
    }
  },

  async listProducts() {
    try {
      const { data } = await api.get("/api/products");
      return data?.result ?? data ?? [];
    } catch (e) {
      console.warn("[SO] listProducts fail -> mock empty", e);
      return [];
    }
  },
};
