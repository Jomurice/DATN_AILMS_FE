import api from "./axios";

// /* Đọc mảng từ nhiều kiểu response khác nhau */
// function extractArray(payload) {
//   if (Array.isArray(payload?.result)) return payload.result;
//   if (Array.isArray(payload?.data))   return payload.data;
//   if (Array.isArray(payload?.content))return payload.content;
//   if (Array.isArray(payload))         return payload;
//   return null;
// }

/* Chuẩn hoá một product để FE dùng thống nhất */
// function normalize(p) {
//   if (!p) return p;
//   // brand có thể là object {name}, hoặc string
//   const brand =
//     typeof p.brand === "string" ? p.brand
//     : (p.brand?.name ?? p.brandName ?? "");
//   // category có thể là object {id}, hoặc id rời
//   const categoryId = String(p.category?.id ?? p.categoryId ?? "");
//   return {
//     images: [],
//     sku: "", name: "", color: "", storage: "", // default
//     ...p,
//     brand,
//     categoryId,
//   };
// }

/* Tạo payload gửi lên BE */
// function toPayload(p) {
//   const out = { ...p };
//   // nhiều BE cần object category
//   if (!out.category && p.categoryId) out.category = { id: p.categoryId };
//   return out;
// }

export const productService = {
  async getAll() {
      const response = await api.get("/api/products");
      return response.data?.result;
  },

  async getById(id) {
      const response = await api.get(`/api/products/${id}`);
      return response.data?.result; 
  },

  async create(payload) {
    try {
      await api.post("/api/products", toPayload(payload));
    } catch {
      // thêm vào mock để UI vẫn chạy
      sampleProducts = [{ id: crypto.randomUUID?.() ?? Date.now().toString(16), ...payload }, ...sampleProducts];
    }
  },

  async update(id, payload) {
    try {
      await api.put(`/api/products/${encodeURIComponent(id)}`, toPayload(payload)); // <-- đã sửa thêm '/'
    } catch {
      sampleProducts = sampleProducts.map(p => p.id === id ? { ...p, ...payload } : p);
    }
  },

  async removeProduct(id) {
    try {
      await api.delete(`/api/products/${encodeURIComponent(id)}`);
      return true;
    } catch {
      sampleProducts = sampleProducts.filter(p => p.id !== id);
      return true;
    }
  },
};
