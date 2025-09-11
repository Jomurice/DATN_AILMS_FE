import api from "./axios";

export const brandService = {
    async getAllBrand(){
        try {
            const response = await api.get('/api/brands');
            return response.data?.result;
        } catch (error) {
            getError(error);
        }
    }
}

function getError(value) {
    if(value.code === 1000){
        console.log('Thanh cong');
    }
}