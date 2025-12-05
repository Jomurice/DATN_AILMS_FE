import api from "./axios";

export const stockService = {
    async getStocks(productId){
        const response = await api.get(`/api/stock/${productId}`);
        return response?.data;
    },
}