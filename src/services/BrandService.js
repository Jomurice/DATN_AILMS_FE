import api from "./axios";

export const brandService = {
  async getAllBrand() {
    try {
      const response = await api.get("/api/brands");
      return response.data?.result;
    } catch (error) {
      getError(error);
    }
  },
  async getById(id) {
    const response = await api.get(`/api/brands/${id}`);
    return response.data.result;
  },

  async create(payload) {
    const response = await api.post("/api/brands", payload);
    return response.data.result;
  },

  async update(id, payload) {
    const response = await api.put(`/api/brands/${id}`, payload);
    return response.data.result;
  },

  async delete(id) {
    const response = await api.delete(`/api/brands/${id}`);
    return response.data.result;
  },
};

function getError(value) {
  if (value.code === 1000) {
    console.log("Thanh cong");
  }
}
