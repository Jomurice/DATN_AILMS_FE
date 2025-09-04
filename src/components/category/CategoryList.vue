<template>
  <div class="container p-3">

    <div class="search row align-items-center justify-content-between rounded-3 p-2 mb-4">
      <h2 class="text-start fw-bold">Tìm kiếm</h2>
      <div class="col-md-6 d-flex gap-2">
        <div class="col-md-6">
          <label class="form-label fw-semibold text-dark">Tìm theo tên loại</label>
          <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên loại..." />
        </div>
        <div class="col-6">
          <label class="form-label fw-semibold text-dark">Sắp xếp</label>
          <select v-model="filters.sort" class="form-select">
            <option value="name_asc">Tên A → Z</option>
            <option value="name_desc">Tên Z → A</option>
          </select>
        </div>
      </div>

      <div class="col-md-4 d-flex justify-content-end gap-1">
        <button class="btn btn-outline-secondary " @click="resetFilters">Làm mới</button>
        <button class="btn btn-primary " @click="applyFilters">Tìm kiếm</button>
      </div>
    </div>

    <div class="card p-2 border-0 rounded-3">

      <div class="d-flex justify-content-between mb-2">
        <h2 class="fw-bold text-start">Danh sách</h2>
        <button class="btn btn-success mt-2" @click="$router.push('category/add')">+ Thêm loại</button>
      </div>
      <div class="w-100">
        <div class=" border-0 shadow-sm bg-white rounded-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase text-dark small fw-bold">
                  <th>Mã loại</th>
                  <th>Tên loại</th>
                  <th>Miêu tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in displayed" :key="c.id">
                  <td :data-label="'Mã loại'">{{ c.id }}</td>
                  <td :data-label="'Tên loại'">{{ c.name }}</td>
                  <td :data-label="'Miêu tả'">{{ c.description }}</td>
                  <td :data-label="'Hành động'" class="d-flex gap-2">
                    <button class="btn btn-outline-primary"
                      @click="$router.push(`/category/${c.id}/detail`)">Sửa</button>
                    <button class="btn btn-outline-danger" @click="remove(c.id)">Xoá</button>
                  </td>
                </tr>

                <tr v-if="isLoading && displayed.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>

            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-dark" role="status"></div>
              <div class="small text-muted mt-2">Đang tải...</div>
            </div>

            <p v-if="error" class="text-dark small p-3">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { categoryService } from '../../services/categoryService';

const router = useRouter();

const items = ref([]);
const brands = ref([]);
const isLoading = ref(false);
const categories = ref([]);
const error = ref("");

const filters = ref({ keyword: "", sort: "name_asc" });
const applied = ref({ ...filters.value });

const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");


const displayed = computed(() => {
  let list = [...categories.value];

  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase());
    list = list.filter((c) => unaccent((c.name || "").toLowerCase()).includes(kw));
  }

  switch (applied.value.sort) {
    case "name_asc": list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" })); break;
    case "name_desc": list.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi", { sensitivity: "base" })); break;
  }
  return list;
});


async function loading() {
  isLoading.value = true;
  try {
    categories.value = await categoryService.getAll();
  } catch (error) {
    console.log("error", error);
  } finally {
    isLoading.value = false;
  }
}

function applyFilters() { applied.value = { ...filters.value }; }
function resetFilters() { filters.value = { keyword: "", sort: "name_asc" }; applied.value = { ...filters.value }; }

function edit(id) { router.push({ name: "category-edit", params: { id } }); }
async function remove(id) {
  if (!confirm("Xoá loại này?")) return;
  await categoryService.remove(id);
  items.value = items.value.filter(c => c.id !== id);
}

onMounted(async () => {
  loading();
});
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
  padding-right: 20px;
  padding-left: 20px;
}

.card{
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.search {
  /* display: flex;
  align-items: center;
  justify-content: center; */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

button {
  max-height: 35px;
}


@media (max-width: 576px) {
  .row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .table-responsive {
    background: transparent;
  }

  .table {
    display: block;
    background: transparent;
  }

  .table thead {
    display: none;
  }

  .table tbody,
  .table tr {
    display: block;
    justify-content: space-between;
    width: 100%;
  }

  .table tr {
    background: #fff;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 1rem;
  }

  .table td {
    border: none !important;
    border-bottom: 1px dashed #e9ecef !important;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: end;
  }

.table td:last-child {
    border-bottom: none !important;
    padding-bottom: 0;
  }

  .table td::before {
    content: attr(data-label);
    display: flex;
    justify-content: flex-start;
    width: 100px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
  }
}
</style>
