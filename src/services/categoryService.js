// src/services/categoryService.js
import api from "./axios";

/* Mock khi API lỗi */
let sampleCategories = [
  { id: "cat-phone",  name: "Điện thoại", description: "" },
  { id: "cat-laptop", name: "Laptop",     description: "" },
  { id: "cat-maylanh", name: "Máy lạnh",     description: "" },
  { id: "cat-tivi", name: "Tivi",     description: "" },
  { id: "cat-maygiat", name: "Máy giặt",     description: "" },
];

const normalizeCategory = (c) => ({
  id: String(c.id),
  name: (c.name ?? "").trim(),
  description: c.description ?? "",
});

const extractArray = (payload) => {
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data))   return payload.data;
  if (Array.isArray(payload?.content))return payload.content;
  if (Array.isArray(payload))         return payload;
  return null;
};

export const categoryService = {
  
  // giữ nguyên khi category bên BE có dữ liệu và khi có dữ liệu thì xóa hoặc comment getAll bên dưới

  // async getAll() {
  //   try {
  //     const { data } = await api.get("/api/categories");
  //     const arr = extractArray(data) ?? [];
  //     return arr.map(normalizeCategory);
  //   } catch {
  //     return sampleCategories.map(normalizeCategory);
  //   }
  // },
  async getAll(){
  try {
    const { data } = await api.get('/api/categories');
    const arr = extractArray(data);
    const base = (arr && arr.length ? arr : sampleCategories); // ← dùng sample nếu rỗng
    return base.map(c => ({ ...c, id: String(c.id) }));
  } catch {
    return sampleCategories;
  }
},

  async getById(id) {
    try {
      const { data } = await api.get(`/api/categories/${encodeURIComponent(id)}`);
      const item = data?.result ?? data;
      return item ? normalizeCategory(item) : null;
    } catch {
      return sampleCategories.find(c => String(c.id) === String(id)) ?? null;
    }
  },

  async create(payload) {
    try {
      const { data } = await api.post("/api/categories", payload);
      const created = data?.result ?? data;
      return created ? normalizeCategory(created) : null;
    } catch {
      const created = normalizeCategory({
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        ...payload,
      });
      sampleCategories = [created, ...sampleCategories];
      return created;
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/categories/${encodeURIComponent(id)}`, payload);
      const updated = data?.result ?? data;
      return updated ? normalizeCategory(updated) : null;
    } catch {
      sampleCategories = sampleCategories.map(c =>
        String(c.id) === String(id) ? normalizeCategory({ ...c, ...payload, id }) : c
      );
      return sampleCategories.find(c => String(c.id) === String(id)) ?? null;
    }
  },

  async remove(id) {
    try {
      await api.delete(`/api/categories/${encodeURIComponent(id)}`);
      return true;
    } catch {
      sampleCategories = sampleCategories.filter(c => String(c.id) !== String(id));
      return true;
    }
  },
};
