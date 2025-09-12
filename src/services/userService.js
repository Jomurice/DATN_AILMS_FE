import api from "./axios";


export const userService = {

    async getAllUsers(payload) {

        const params = {
            name: payload.name,
            role: payload.role,
            status: payload.status,
            gender: payload.gender,
            page: payload.pageable.page,
            size: payload.pageable.size
        };

        if (payload.pageable.sort && payload.pageable.sort.length > 0 && payload.pageable.sort[0] !== "") {
            params.sort = payload.pageable.sort;
        }

        Object.keys(params).forEach(
            key => (params[key] === '' || params[key] == null) && delete params[key]
        );

        return await api.get("/api/users", { params });
        
    },

    async getUserById(userId) {
        const response = await api.get(`/api/users/${userId}`);
        return response.data?.result;
    },

    async createUser(payload) {
        const response = await api.post("/api/users", payload);
        return response.data.result;
    },

    async updateUser(userId, payload) {
        const response = await api.put(`/api/users/${userId}`, payload);
        return response.data.result;
    },

    async enableUser(userId) {
        const response = await api.put(`/api/users/enable/${userId}`);
        return response.data.result;
    },
};