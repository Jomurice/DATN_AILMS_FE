import api from "../axios";

export const orderDetailService = {
    async create(payload){
        try {
            const response = await api.post(`/api/purchase-orders-items/${id}`,payload);
            return response.data?.result;
        } catch (error) {
            return error.data?.code;
        }
    },
}