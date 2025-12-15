import api from "../axios";

export const customerService = {
    async getAll(params = {}) {
        const response = await api.get("api/customer", { params });
        return response.data?.result;
    },

    async getById(id) {
        const response = await api.get(`/api/customer/${id}`);
        return response.data?.result;
    },

    async create(payload) {
        const response = await api.post('api/customer', payload);
        return response.data?.result;
    },

    async update(id, payload) {
        const response = await api.put(`/api/customer/${id}`, payload);
        return response.data?.result;
    },

    async delete(id) {
        const response = await api.delete(`/api/customer/${id}`);
        return response.data?.result;
    },

    async active(id) {
        const response = await api.patch(`/api/customer/${id}/active`);
        return response.data?.result;
    }
}