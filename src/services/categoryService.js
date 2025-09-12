// src/services/categoryService.js
import api from "./axios";

export const categoryService = {
  
  
  async getAll() {
      const response = await api.get("/api/category-brands");
      return response.data?.result;
  },

  async getById(id) {
    try {
      const { data } = await api.get(`/api/categories/${id}`);
      const item = data?.result ?? data;
      return item ? normalizeCategory(item) : null;
    } catch {
      return sampleCategories.find(c => String(c.id) === String(id)) ?? null;
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
