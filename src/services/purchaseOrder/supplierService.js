import api from "../axios";

export const supplierService = {


  async getSuppliers(params = {}) {
    const response = await api.get("/api/suppliers", { params });
    return response.data.result;
  },

  
  async getSupplierById(supplierId) {
    const response = await api.get(`/api/suppliers/${supplierId}`);
    return response.data.result;
  },


  async createSupplier(payload) {
    const response = await api.post("/api/suppliers", payload);
    return response.data.result;
  },


  async updateSupplier(supplierId, payload) {
    const response = await api.put(`/api/suppliers/${supplierId}`, payload);
    return response.data.result;
  },

  
  async deleteSupplier(supplierId) {
    const response = await api.delete(`/api/suppliers/${supplierId}`);
    return response.data.result;
  },

  
  async toggleStatus(supplierId) {
    const response = await api.patch(`/api/suppliers/${supplierId}/toggle-status`);
    return response.data.result;
  }
};
