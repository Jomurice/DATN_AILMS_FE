import api from "./axios";

export const passwordService = {
    async update(payload,token){
       return await api.post('api/change-password',payload,{
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
    }); 
    },
};