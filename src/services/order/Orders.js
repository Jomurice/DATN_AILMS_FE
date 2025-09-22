import api from "../axios";

export const orderService = {
    async getAll(){
        try {
            const response = await api.get('/api/purchase-orders');
            return response.data?.result;
        } catch (error) {
            return error.data?.code;
        }
    },

    async getById(id){
        try {
            const response = await api.get(`/api/purchase-orders/${id}`);
            return response.data?.result;
        } catch (error) {
            return error.data?.code;
        }
    },

    async create(payload){
        try {
            return await api.post('/api/purchase',payload);
        } catch (error) {
            return error.data?.code;
        }
    }
}