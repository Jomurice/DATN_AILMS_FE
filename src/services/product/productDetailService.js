import api from "../axios";

export const productDetailService = {
  async getByProductId(id){
    const response = await api.get(`/api/product-details/${id}`);
    return response.data?.result;
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
