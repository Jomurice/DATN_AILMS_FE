import api from "./axios";


export const productService = {
  async getAll() {
      const response = await api.get("/api/products");
      return response.data?.result;
  },

  async getById(id) {
      const response = await api.get(`/api/products/${id}`);
      return response.data?.result; 
  },


  async update(id, payload) {
    try {
      await api.put(`/api/products/${encodeURIComponent(id)}`, toPayload(payload)); // <-- đã sửa thêm '/'
    } catch {
      sampleProducts = sampleProducts.map(p => p.id === id ? { ...p, ...payload } : p);
    }
  },

  async removeProduct(id) {
    try {
      await api.delete(`/api/products/${encodeURIComponent(id)}`);
      return true;
    } catch {
      sampleProducts = sampleProducts.filter(p => p.id !== id);
      return true;
    }
  },
};
