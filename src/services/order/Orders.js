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
        const response = await api.get(`/api/purchase-orders/${id}`);
        return response.data?.result;
    },

    async create(payload){
         await api.post('/api/purchase-orders',payload);
    }
}