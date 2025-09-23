import api from "../axios";


export const productService = {
  async getAll() {
    const response = await api.get("/api/products");
    return response.data?.result;
  },

  async getById(id) {
    const response = await api.get(`/api/products/${id}`);
    return response.data?.result;
  },

  async create(payload) {
    const response = await api.post('/api/products', payload);
    return response.data;
  },


  async update(id, payload) {
   const response = await api.put(`/api/products/${id}`, payload);
   return response.data;
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
  async findBySkuLocal(products, sku) {
    if (!sku) return null;
    return (products || []).find(p => String(p.sku).toLowerCase() === String(sku).toLowerCase()) || null;
  },
  searchByNameLocal(products, q) {
    if (!q) return products || [];
    const s = q.toLowerCase();
    return (products || []).filter(p =>
      String(p.name).toLowerCase().includes(s) ||
      String(p.sku).toLowerCase().includes(s)
    );
  }
};
