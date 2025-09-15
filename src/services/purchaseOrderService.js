// src/services/purchaseOrderService.js
import api from "./axios";

// NOTE: Tạm mock. Sau này thay bằng API thật (vd: /api/purchase-orders, /api/purchase-orders/:id/items)
// Cấu trúc item cần có: productId, sku, name, categoryName, brandName, color, qty
let sampleOrders = [
  {
    id: "po-2025-001",
    code: "PO-2025-001",
    supplier: "Nhà phân phối A",
    status: "IN_PROGRESS",
    eta: "2025-09-20",
    items: [
      { productId: "f9a0d2d1-1111-4c11-a0c0-111111111111", sku: "iphone15prm", name: "iPhone 15 Pro Max",
        categoryName: "Điện thoại", brandName: "Apple", color: "Natural Titanium", qty: 10 },
      { productId: "379230b1-879e-4148-b5d3-285127d615de", sku: "dxps13",
        name: "Dell XPS 13", categoryName: "Laptop", brandName: "Dell", color: "Silver", qty: 5 },
    ]
  },
  {
    id: "po-2025-002",
    code: "PO-2025-002",
    supplier: "Nhà phân phối B",
    status: "UPCOMING",
    eta: "2025-09-25",
    items: [
      { productId: "a2b3c4d5-2222-4c22-a0c0-222222222222", sku: "mba15",
        name: "MacBook Air 15", categoryName: "Laptop", brandName: "Apple", color: "Midnight", qty: 3 },
    ]
  }
];

export const purchaseOrderService = {
  async list() {
    try {
      const { data } = await api.get("/api/purchase-orders");
      const out = Array.isArray(data?.result) ? data.result : data;
      if (out) return out;
    } catch {}
    return sampleOrders;
  },
  async getById(id) {
    try {
      const { data } = await api.get(`/api/purchase-orders/${encodeURIComponent(id)}`);
      return data?.result ?? data ?? sampleOrders.find(x => x.id === id);
    } catch {}
    return sampleOrders.find(x => x.id === id) ?? null;
  },
  // Sau này có API hoàn tất PO -> gọi ở đây
  async complete(id, payload) {
    // payload: { confirmedAt }
    try {
      const { data } = await api.post(`/api/purchase-orders/${encodeURIComponent(id)}/complete`, payload);
      return data?.result ?? data;
    } catch {
      sampleOrders = sampleOrders.map(x => x.id === id ? { ...x, status: "DONE" } : x);
      return true;
    }
  }
};
// purchaseOrderService.js
// import api from "./axios";
// const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

// export const purchaseOrderService = {
//   async list(params = {}) {
//     try {
//       const { data } = await api.get("/api/purchase-orders", { params });
//       const out = Array.isArray(data?.result) ? data.result : data;
//       return out ?? [];
//     } catch (e) {
//       if (USE_MOCK) return sampleOrders; // chỉ khi bạn bật mock
//       throw e;                            // mặc định: không fallback → luôn dữ liệu thật
//     }
//   },
//   async getById(id, params = {}) {
//     try {
//       const { data } = await api.get(`/api/purchase-orders/${encodeURIComponent(id)}`, { params });
//       return data?.result ?? data;
//     } catch (e) {
//       if (USE_MOCK) return sampleOrders.find(x => x.id === id) ?? null;
//       throw e;
//     }
//   },
//   async complete(id, payload) {
//     const { data } = await api.post(`/api/purchase-orders/${encodeURIComponent(id)}/complete`, payload);
//     return data?.result ?? data;
//   }
// };

