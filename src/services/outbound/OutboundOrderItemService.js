import api from "../axios";

export const outboundItemService = {
    async addItem(payload, id){
        const response = await api.put(`/api/outbound/${id}/items`,payload);
        return response.data?.result;

    },

    async deleteItem(orderId, productId){
        const response = await api.delete(`/api/outbound/${orderId}/item/${productId}`);
        return response.data?.result;
    },



}