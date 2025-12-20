import api from "./axios";

export const brandService = {
  async getAll() {
    const res = await api.get("/api/brands");
    return res.data?.result || res.data; 
  },
  async create(data) {
    return (await api.post("/api/brands", data)).data?.result;
  },
  async update(id, data) {
    return (await api.put(`/api/brands/${id}`, data)).data?.result;
  },
  async delete(id) {
    return await api.delete(`/api/brands/${id}`);
  }
};