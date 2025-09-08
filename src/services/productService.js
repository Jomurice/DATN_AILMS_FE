import api from "./axios";

/* ===== Mock dùng khi API lỗi/đang dev ===== */
let sampleProducts = [
  // Điện thoại
  { id: "p-ip11", sku: "IP11",  name: "iPhone 11",      brand: "Apple",   color:"Đen",  storage:"64GB",  categoryId: "cat-phone" },
  { id: "p-ip12", sku: "IP12",  name: "iPhone 12",      brand: "Apple",   color:"Trắng",storage:"128GB", categoryId: "cat-phone" },
  { id: "p-s21",  sku: "SS21",  name: "Galaxy S21",     brand: "Samsung", color:"Tím",  storage:"128GB", categoryId: "cat-phone" },
  { id: "p-a78",  sku: "OP78",  name: "OPPO A78",       brand: "OPPO",    color:"Xanh", storage:"256GB", categoryId: "cat-phone" },
  // Laptop
  { id: "p-mba",  sku: "MBA",   name: "MacBook Air 13", brand: "Apple",   color:"Bạc",  storage:"256GB", categoryId: "cat-laptop" },
  { id: "p-xps",  sku: "DXPS",  name: "Dell XPS 13",    brand: "Dell",    color:"Bạc",  storage:"512GB", categoryId: "cat-laptop" },
];

/* Đọc mảng từ nhiều kiểu response khác nhau */
function extractArray(payload) {
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data))   return payload.data;
  if (Array.isArray(payload?.content))return payload.content;
  if (Array.isArray(payload))         return payload;
  return null;
}

/* Chuẩn hoá một product để FE dùng thống nhất */
function normalize(p) {
  if (!p) return p;
  // brand có thể là object {name}, hoặc string
  const brand =
    typeof p.brand === "string" ? p.brand
    : (p.brand?.name ?? p.brandName ?? "");
  // category có thể là object {id}, hoặc id rời
  const categoryId = String(p.category?.id ?? p.categoryId ?? "");
  return {
    images: [],
    sku: "", name: "", color: "", storage: "", // default
    ...p,
    brand,
    categoryId,
  };
}

/* Tạo payload gửi lên BE */
function toPayload(p) {
  const out = { ...p };
  // nhiều BE cần object category
  if (!out.category && p.categoryId) out.category = { id: p.categoryId };
  return out;
}

export const productService = {
 
  // giữ nguyên khi category bên BE có dữ liệu và khi có dữ liệu thì xóa hoặc comment getAll bên dưới 

  async getAll() {
    try {
      const { data } = await api.get("/api/products");
      const arr = extractArray(data);
      if (!arr) throw new Error("Bad product shape");
      return arr.map(normalize);
    } catch (e) {
      // fallback mock
      return sampleProducts.map(normalize);
    }
  },
//     async getAll() {
//   try {
//     const { data } = await api.get("/api/products");
//     const arr = extractArray(data);
//     const base = (arr && arr.length ? arr : sampleProducts); // ← dùng sample nếu rỗng
//     return base.map(normalize);
//   } catch {
//     return sampleProducts.map(normalize);
//   }
// },
  async getById(id) {
    try {
      const { data } = await api.get(`/api/products/${encodeURIComponent(id)}`);
      const item = data?.result ?? data;
      if (!item?.id) throw new Error("Not found");
      return normalize(item);
    } catch (e) {
      return normalize(sampleProducts.find(p => p.id === id));
    }
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
