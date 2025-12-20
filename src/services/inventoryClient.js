// src/services/inventoryClient.js
import api from "./axios";
import { fire, EVENTS } from "./eventBus";

export const inventoryClient = {
  async scan(serial) {
    const { data } = await api.post("/api/inventory/scan", null, { params: { serial }});
    const detail = data?.result ?? data; // { id, serialNumber, status, productId, binId }
    // 🔔 cho Dashboard/Product/list detail biết để tự reload
    fire(EVENTS.INBOUND_SCANNED, {
      serial: detail?.serialNumber ?? serial,
      productId: detail?.productId ?? null,
      binId: detail?.binId ?? null,
    });
    return detail;
  },

  async move(serial, binId) {
    const { data } = await api.post("/api/inventory/move", null, { params: { serial, binId }});
    const detail = data?.result ?? data;
    fire(EVENTS.PRODUCT_DETAIL_CHANGED, {
      serial,
      binId,
      productId: detail?.productId ?? null,
    });
    fire(EVENTS.DASHBOARD_SHOULD_REFRESH);
    return detail;
  },

  async locate(serial) {
    const { data } = await api.get("/api/inventory/locate", { params: { serial }});
    return data?.result ?? data; // string path kho/khu/dãy/kệ/ngăn
  }
};
