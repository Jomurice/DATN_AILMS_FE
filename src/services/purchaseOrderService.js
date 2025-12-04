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
  /** List purchase orders */
  async list(params = {}) { //async getAll(params = {}) {
    try {
      const { data } = await api.get("/api/purchase-orders", { params });
      const out = Array.isArray(data?.result) ? data.result : data;
      return out ?? [];
    } catch (e) {
      console.warn("[PO] list fail -> mock", e);
      if (params?.userId) return sampleOrders.filter(o => String(o.userId) === String(params.userId));
      return sampleOrders;
    }
  },

  /** Get detail (include items) */
  async getById(id, params = {}) {
    try {
      const { data } = await api.get(`/api/purchase-orders/${encodeURIComponent(id)}`, { params });
      return data?.result ?? data;
    } catch (e) {
      console.warn("[PO] getById fail -> mock", e);
      return sampleOrders.find(x => x.id === id) ?? null;
    }
  },

  /** Create order (header + items) */
  async create(payload) {
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
        items: (payload.items || []).map((it,i)=>({
          id: `itm-${Date.now()}-${i}`,
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
      sampleOrders.push(mock);
      return mock;
    }
  },

  /** Add item (BE: POST /api/purchase-orders-items/{orderId}) */
  async addItem(orderId, { productId, orderQuantity }) {
    try {
      const { data } = await api.post(
        `/api/purchase-orders-items/${encodeURIComponent(orderId)}`,
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
          sku: (productId || "").slice(0, 8),
          name: "Unknown",
          status:'PENDING',
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

/** Scan 1 serial for a PO item (BE: POST /api/purchase-orders-items/{itemId}/scan?serial=...) */
async scanItem(purchaseOrderItemId, serial, userId) {
  const path = `/api/purchase-orders-items/${encodeURIComponent(purchaseOrderItemId)}/scan`;
  try {
    const { data } = await api.post(path, null, { 
      params: { 
        serial, 
        userId // thêm userId vào query params
      } 
    });
    return data?.result ?? data;
  } catch (e1) {
    console.warn("[PO] scanItem(serial) failed, try serialNumber", e1);
    const { data } = await api.post(path, null, { 
      params: { 
        serialNumber: serial, 
        userId // thêm userId ở fallback luôn
      } 
    });
    return data?.result ?? data;
  }
},

  /** Complete order (prefer POST /complete, fallback PUT status) */
  async complete(id, payload = {}) {
    try {
      const { data } = await api.post(`/api/purchase-orders/${encodeURIComponent(id)}/complete`, payload);
      const res = data?.result ?? data;
      fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
      return res;
    } catch (e) {
      console.warn("[PO] complete fail -> fallback PUT status=COMPLETED", e);
      try {
        const { data } = await api.put(`/api/purchase-orders/${encodeURIComponent(id)}`, { status: "COMPLETED" });
        fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
        return data?.result ?? data;
      } catch (e2) {
        console.warn("[PO] fallback PUT fail -> mock COMPLETED", e2);
        sampleOrders = sampleOrders.map(x =>
          x.id === id ? { ...x, status: "COMPLETED", updatedAt: new Date().toISOString() } : x
        );
        fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
        return true;
      }
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
  /** Update header */
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

  /** Products list (for selectors) */
  async listProducts() {
    try {
      const { data } = await api.get("/api/products");
      return data?.result ?? data ?? [];
    } catch (e) {
      console.warn("[PO] listProducts fail -> []", e);
      return [];
    }
  },
};
