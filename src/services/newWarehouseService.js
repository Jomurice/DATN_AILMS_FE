import api from "./axios";

export const newWarehouseService = {
  async getTreeByLocation(locationId) {
    
    const response = await api.get(`/api/warehouses/tree/location/${locationId}`);
    return response.data?.result || [];
  },
  async getByLocation(locationId) {
  const response = await api.get(`/api/warehouses/location/${locationId}`);
  return response.data?.result || [];
},

  async getAll() {
    const response = await api.get("/api/warehouses");
    return response.data?.result || [];
  },

  async getById(id) {
    const response = await api.get(`/api/warehouses/${id}`);
    return response.data?.result;
  },

  async create(payload) {
    const response = await api.post("/api/warehouses", payload);
    return response.data?.result;
  },

  async update(id, payload) {
    const response = await api.put(`/api/warehouses/${id}`, payload);
    return response.data?.result;
  },
};
