import api from "./axios";

export const stockService = {
    async getStocks(payload){
        const response = await api.get('/api/stock',{ params: payload });
        return response?.data;
    },
}