import api from "./axios";

export const menuService = {

    async getAllMenu() {
        try {
            const response = await api.get('/api/menus');
            return response.data?.result?.[0]
        } catch (error) {
            getError(error);
        }

    },

    async getAllMenuTree() {
        const response = await api.get('/api/menus/tree');
        return response.data?.result?.[0]
    },

    async update(payload, id) {
        const response = await api.put(`/api/menus/${id}`, payload);
        return response.data?.result?.[0]

    },

    async create(payload) {
        return await api.post('/api/menus', payload);
    },



}

function getError(value) {
    if(value.code === 1000){
        console.log('Thanh cong');
    }
}