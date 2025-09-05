// src/services/BinService.js
import api from "./axios"

// ===== DỮ LIỆU MẪU (khớp sid = "s-01") =====
let sampleBins = [
  {
    id: "bin-01",
    name: "Bin A1-01",
    code: "BIN-A1-S1",
    capacity: 100,
    currentQty: 20,
    preferredProductId: null,
    shelf: { id: "01", name: "Shelf A1" }, // <— CHÚ Ý: s-01
    productDetails: [
      { id: "pd-1", serialNumber: "DXPS13-0001", status: "AVAILABLE", product: { sku: "SKU-DXPS13", name: "Dell XPS 13" } },
      { id: "pd-2", serialNumber: "DXPS13-0002", status: "RESERVED",  product: { sku: "SKU-DXPS13", name: "Dell XPS 13" } }
    ]
  },
  {
    id: "bin-02",
    name: "Bin A1-02",
    code: "BIN-A1-S2",
    capacity: 50,
    currentQty: 10,
    preferredProductId: null,
    shelf: { id: "01", name: "Shelf A1" },
    productDetails: []
  }
]

// Trạng thái tiếng Việt cho ProductDetail.status (nếu backend trả về)
export const viStatus = s =>
  ({ AVAILABLE: "Có sẵn", RESERVED: "Đã giữ", SOLD: "Đã bán", DEFECTIVE: "Lỗi" }[s] ?? s ?? "—")

export const binService = {
  // Lấy tất cả bin trong 1 shelf
  async list(shelfId) {
    try {
      const { data } = await api.get(`/api/shelves/${encodeURIComponent(shelfId)}/bins`)
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      // nếu backend trả rỗng → fallback vào mẫu theo shelf
      return out ?? sampleBins.filter(b => b.shelf?.id === shelfId)
    } catch {
      return sampleBins.filter(b => b.shelf?.id === shelfId)
    }
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/api/bins/${encodeURIComponent(id)}`)
      return data?.result ?? data ?? sampleBins.find(b => b.id === id) ?? null
    } catch {
      return sampleBins.find(b => b.id === id) ?? null
    }
  },

  // Tạo bin trong 1 shelf
  async create(shelfId, payload) {
    try {
      const { data } = await api.post(`/api/shelves/${encodeURIComponent(shelfId)}/bins`, payload)
      return data?.result ?? data
    } catch {
      const newItem = {
        id: (crypto.randomUUID?.() ?? Date.now().toString(16) + Math.random().toString(16).slice(2)),
        name: payload.name,
        code: payload.code,
        capacity: Number(payload.capacity) ?? 0,
        currentQty: Number(payload.currentQty) ?? 0,
        preferredProductId: payload.preferredProductId ?? null,
        shelf: { id: shelfId, name: "—" },
        productDetails: []
      }
      sampleBins = [newItem, ...sampleBins]
      return newItem
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/bins/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      sampleBins = sampleBins.map(b =>
        b.id === id
          ? {
              ...b,
              name: payload.name ?? b.name,
              code: payload.code ?? b.code,
              capacity: Number(payload.capacity ?? b.capacity),
              currentQty: Number(payload.currentQty ?? b.currentQty),
              preferredProductId: payload.preferredProductId ?? b.preferredProductId,
              shelf: payload.shelfId ? { id: payload.shelfId, name: b.shelf?.name ?? "—" } : b.shelf
            }
          : b
      )
      return sampleBins.find(b => b.id === id)
    }
  },

  async remove(id) {
    try {
      await api.delete(`/api/bins/${encodeURIComponent(id)}`)
      return true
    } catch {
      sampleBins = sampleBins.filter(b => b.id !== id)
      return true
    }
  }
}
