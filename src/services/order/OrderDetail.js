import api from "../axios";

export const orderDetailService = {
    async create(payload, id){
        const response = await api.post(`/api/purchase-orders-items/${id}`,payload);
        return response.data?.result;

    },

    async remove(id){
        const response = await api.delete(`/api/purchase-orders-items/${id}`);
        return response.data?.result;
    }
}