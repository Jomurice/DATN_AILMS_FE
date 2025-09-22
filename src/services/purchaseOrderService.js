// src/services/purchaseOrderService.js
import api from "./axios";
import { fire, EVENTS } from "./eventBus";

// ---- MOCK DATA (fallback) ----
let sampleOrders = [
  {
    id: "po-2025-001",
    code: "PO-2025-001",
    supplier: "Nhà phân phối A",
    status: "IN_PROGRESS",
    createdAt: "2025-09-20",
    updatedAt: "2025-09-21T08:15:00Z",
    userId: "user-a",
    items: [
      {
        id: "item-1",
        productId: "f9a0d2d1-1111-4c11-a0c0-111111111111",
        sku: "iphone15prm",
        name: "iPhone 15 Pro Max",
        categoryName: "Điện thoại",
        brandName: "Apple",
        color: "Natural Titanium",
        orderQuantity: 10,
        scannedQuantity: 4
      },
      {
        id: "item-2",
        productId: "379230b1-879e-4148-b5d3-285127d615de",
        sku: "dxps13",
        name: "Dell XPS 13",
        categoryName: "Laptop",
        brandName: "Dell",
        color: "Silver",
        orderQuantity: 5,
        scannedQuantity: 0
      },
    ]
  },
  {
    id: "po-2025-002",
    code: "PO-2025-002",
    supplier: "Nhà phân phối B",
    status: "PENDING",
    createdAt: "2025-09-25",
    updatedAt: null,
    userId: "user-a",
    items: []
  }
];

export const purchaseOrderService = {
  /** List PO (có thể filter theo userId) */
  async list(params = {}) {
    try {
      const { data } = await api.get("/api/purchase-orders", { params });
      const out = Array.isArray(data?.result) ? data.result : data;
      return out ?? [];
    } catch (e) {
      console.warn("[PO] list fail -> use mock", e);
      if (params?.userId) {
        return sampleOrders.filter(o => String(o.userId) === String(params.userId));
      }
      return sampleOrders;
    }
  },

  /** Lấy chi tiết PO (bao gồm items/purchase_order_detail) */
  async getById(id, params = {}) {
    try {
      const { data } = await api.get(`/api/purchase-orders/${encodeURIComponent(id)}`, { params });
      return data?.result ?? data;
    } catch (e) {
      console.warn("[PO] getById fail -> use mock", e);
      return sampleOrders.find(x => x.id === id) ?? null;
    }
  },

  /** Tạo purchase_order (HEADER ONLY) – chưa có items */
  async create(payload) {
    // payload: { code, supplier, status, createdAt, userId }
    try {
      const { data } = await api.post("/api/purchase-orders", payload);
      return data?.result ?? data;
    } catch (e) {
      console.warn("[PO] create fail -> mock append", e);
      const mock = {
        id: `po-mock-${Date.now()}`,
        code: payload.code || `PO-${Date.now()}`,
        supplier: payload.supplier || "N/A",
        status: payload.status || "PENDING",
        createdAt: payload.createdAt || new Date().toISOString().slice(0,10),
        updatedAt: null,
        userId: payload.userId || "mock-user",
        items: []
      };
      sampleOrders.push(mock);
      return mock;
    }
  },

  /** Thêm 1 item vào PO (tạo purchase_order_detail) */
  async addItem(orderId, { productId, orderQuantity }) {
    try {
      const { data } = await api.post(
        `/api/purchase-orders/${encodeURIComponent(orderId)}/items`,
        { productId, orderQuantity }
      );
      return data?.result ?? data;
    } catch (e) {
      console.warn("[PO] addItem fail -> mock", e);
      sampleOrders = sampleOrders.map(po => {
        if (po.id !== orderId) return po;
        const next = { ...po };
        next.items = next.items || [];
        next.items.push({
          id: `itm-${Date.now()}`,
          productId,
          sku: (productId || "").slice(0, 8), // mock
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

  /** Hoàn tất PO */
  async complete(id, payload = {}) {
    try {
      const { data } = await api.post(`/api/purchase-orders/${encodeURIComponent(id)}/complete`, payload);
      const res = data?.result ?? data;
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return res;
    } catch (e) {
      console.warn("[PO] complete fail -> mock DONE", e);
      sampleOrders = sampleOrders.map(x =>
        x.id === id ? { ...x, status: "COMPLETED", updatedAt: new Date().toISOString() } : x
      );
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return true;
    }
  },
//   async complete(id, payload) {
//   try {
//     const { data } = await api.post(`/api/purchase-orders/${encodeURIComponent(id)}/complete`, payload);
//     const res = data?.result ?? data;
//     fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
//     return res;
//   } catch (e) {
//     console.warn("[PO] complete fail -> try PUT status=COMPLETED", e);
//     try {
//       const { data } = await api.put(`/api/purchase-orders/${encodeURIComponent(id)}`, { status: "COMPLETED" });
//       const res = data?.result ?? data;
//       fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
//       return res;
//     } catch (e2) {
//       console.warn("[PO] PUT status=COMPLETED fail -> update mock", e2);
//       sampleOrders = sampleOrders.map(x => x.id === id ? { ...x, status: "DONE" } : x);
//       fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
//       return true;
//     }
//   }
// }
  /** (Optional) update header */
  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/purchase-orders/${encodeURIComponent(id)}`, payload);
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return data?.result ?? data;
    } catch (e) {
      console.warn("[PO] update fail -> mock", e);
      sampleOrders = sampleOrders.map(x => (x.id === id ? { ...x, ...payload, updatedAt: new Date().toISOString() } : x));
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return sampleOrders.find(x => x.id === id) ?? null;
    }
  },

  /** Lấy list sản phẩm để chọn */
  async listProducts() {
    try {
      const { data } = await api.get("/api/products");
      return data?.result ?? data ?? [];
    } catch (e) {
      console.warn("[PO] listProducts fail -> mock empty", e);
      return [];
    }
  },
};
