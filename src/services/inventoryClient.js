// src/services/inventoryClient.js
import api from "./axios";

export const inventoryClient = {
  async scan(serial) {
    const { data } = await api.post("/api/inventory/scan", null, { params: { serial }});
    return data?.result ?? data; // ProductDetailResponseDto { id, serialNumber, status, productId, binId }
  },
  async move(serial, binId) {
    const { data } = await api.post("/api/inventory/move", null, { params: { serial, binId }});
    return data?.result ?? data;
  },
  async locate(serial) {
    const { data } = await api.get("/api/inventory/locate", { params: { serial }});
    return data?.result ?? data; // string path kho/khu/dãy/kệ/ngăn
  }
};
