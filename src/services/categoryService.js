
import api from "./axios";

export const categoryService = {
  
  
  async getAll() {
      const response = await api.get("/api/categories");
      return response.data?.result;
  },

  async createCategoryBrand(payload){
    const response = await api.post('/api/category-brands',payload);
    return response.data?.result?.id;
  },

  async getById(id) {
    const response = await api.get(`/api/categories/${id}`);
    return response.data?.result;
  },

  async create(payload) {
   return await api.post('/api/categories',payload);
  },

  async update(id, payload) {
    return await api.put(`/api/categories/${id}`,payload);
  },
};
