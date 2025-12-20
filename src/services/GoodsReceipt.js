import api from "./axios";

export default goodsReceiptService ={
    async getAll(){
        const response = await api.get("/");
    }
}