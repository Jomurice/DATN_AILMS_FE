// src/services/productDetailService.js
import api from "./axios"

// ===== SAMPLE (fallback khi BE chưa có dữ liệu) =====
// key = productId -> mảng productDetails
let sampleDetailsByProduct = {
  "379230b1-879e-4148-b5d3-285127d615de": [
    { id: "pd-1", serialNumber: "DXPS13-0001", status: "AVAILABLE", bin: { id: "bin-01", name: "A1-01" }, productId: "379230b1-879e-4148-b5d3-285127d615de" },
    { id: "pd-2", serialNumber: "DXPS13-0002", status: "RESERVED",  bin: { id: "bin-02", name: "A1-02" }, productId: "379230b1-879e-4148-b5d3-285127d615de" },
  ],
  "f9a0d2d1-1111-4c11-a0c0-111111111111": [
    { id: "pd-3", serialNumber: "MBA15-0001", status: "AVAILABLE", bin: { id: "bin-03", name: "B2-10" }, productId: "f9a0d2d1-1111-4c11-a0c0-111111111111" },
  ],
  "a2b3c4d5-2222-4c22-a0c0-222222222222": [],
}

// Hợp lệ trạng thái
export const PRODUCT_DETAIL_STATUSES = ["AVAILABLE","RESERVED","SOLD","DEFECTIVE"]

export const productDetailService = {
  // LIST by productId
  async listByProduct(productId) {
    try {
      const { data } = await api.get("/api/product-details", { params: { productId } })
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      return out ?? (sampleDetailsByProduct[productId] || [])
    } catch {
      return sampleDetailsByProduct[productId] || []
    }
  },

  // GET by id
  async getById(id) {
    try {
      const { data } = await api.get(`/api/product-details/${encodeURIComponent(id)}`)
      const item = data?.result ?? data
      if (item?.id) return item
      // fallback: tìm trong sample
      for (const arr of Object.values(sampleDetailsByProduct)) {
        const found = arr.find(x => x.id === id)
        if (found) return found
      }
      return null
    } catch {
      for (const arr of Object.values(sampleDetailsByProduct)) {
        const found = arr.find(x => x.id === id)
        if (found) return found
      }
      return null
    }
  },

  // CREATE
  async create(payload) {
    // payload: { productId, serialNumber, status, binId, binName? }
    try {
      const { data } = await api.post("/api/product-details", payload)
      return data?.result ?? data
    } catch {
      const newItem = {
        id: (crypto.randomUUID?.() ?? Date.now().toString(16) + Math.random().toString(16).slice(2)),
        productId: payload.productId,
        serialNumber: payload.serialNumber,
        status: payload.status || "AVAILABLE",
        bin: payload.binId ? { id: payload.binId, name: payload.binName ?? "—" } : null,
      }
      if (!sampleDetailsByProduct[payload.productId]) sampleDetailsByProduct[payload.productId] = []
      sampleDetailsByProduct[payload.productId] = [newItem, ...(sampleDetailsByProduct[payload.productId] || [])]
      return newItem
    }
  },

  // UPDATE
  async update(id, payload) {
    // payload: { serialNumber?, status?, binId?, binName? }
    try {
      const { data } = await api.put(`/api/product-details/${encodeURIComponent(id)}`, payload)
      return data?.result ?? data
    } catch {
      for (const pid of Object.keys(sampleDetailsByProduct)) {
        sampleDetailsByProduct[pid] = (sampleDetailsByProduct[pid] || []).map(d => {
          if (d.id !== id) return d
          return {
            ...d,
            serialNumber: payload.serialNumber ?? d.serialNumber,
            status: payload.status ?? d.status,
            bin: payload.binId ? { id: payload.binId, name: payload.binName ?? d.bin?.name ?? "—" } : d.bin,
          }
        })
      }
      // return kết quả mới
      for (const arr of Object.values(sampleDetailsByProduct)) {
        const found = arr.find(x => x.id === id)
        if (found) return found
      }
      return null
    }
  },

  // DELETE
  async remove(id) {
    try {
      await api.delete(`/api/product-details/${encodeURIComponent(id)}`)
      return true
    } catch {
      for (const pid of Object.keys(sampleDetailsByProduct)) {
        sampleDetailsByProduct[pid] = (sampleDetailsByProduct[pid] || []).filter(d => d.id !== id)
      }
      return true
    }
  },
}
