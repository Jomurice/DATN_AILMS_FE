
import api from "./axios";

export const categoryService = {

  async getAll(){
    const response = await api.get('/api/categories');
    return response.data?.result;
  },
 
async getById(id) {
    const response  = await api.get(`/api/categories/${id}`);
    return response.data?.result;
},

  async create(payload) {
      await api.post('/api/categories',payload);
      return;
  },

  async update(id, payload) {
    await api.put(`/api/categories/${id}`,payload);
    return;
  },

}
