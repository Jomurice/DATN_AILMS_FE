
<template>
  <div class="container py-5">

    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <h4 class="fw-bold text-dark mb-0">Danh sách loại hàng</h4>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="$router.push({ name: 'category-add' })">+ Thêm loại</button>
      </div>
    </div>

    
    <div class="card border-0 shadow-sm bg-white rounded-3 p-4 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-4 col-12">
          <label class="form-label fw-semibold text-dark">Tìm theo tên loại</label>
          <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên loại..." />
        </div>
        <div class="col-md-4 col-12">
          <label class="form-label fw-semibold text-dark">Sắp xếp</label>
          <select v-model="filters.sort" class="form-select">
            <option value="name_asc">Tên A → Z</option>
            <option value="name_desc">Tên Z → A</option>
          </select>
        </div>
        <div class="col-md-4 col-12 d-flex gap-2">
          <button class="btn btn-outline-secondary w-100" @click="resetFilters">Làm mới</button>
          <button class="btn btn-primary w-100" @click="applyFilters">Tìm kiếm</button>
        </div>
      </div>
    </div>

    <div class="row g-4">
      
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase text-dark small fw-bold">
                  <th class="ps-4">Tên loại</th>
                  <th>Mô tả</th>
                  <th class="text-end">Số sản phẩm</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in displayed" :key="c.id">
                  <td class="ps-4" :data-label="'Tên loại'">
  <a
    href="#"
    class="text-decoration-none fw-semibold"
    @click.prevent="$router.push({ name:'products', query: { categoryId: c.id } })"
  >{{ c.name }}</a>
</td>

                  <td :data-label="'Mô tả'">{{ c.description || '—' }}</td>
                  <td :data-label="'Số sản phẩm'" class="text-end">{{ c.productCount ?? 0 }}</td>
                  <td :data-label="'Hành động'" class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="edit(c.id)">Sửa</button>
                    <button class="btn btn-sm btn-outline-danger" @click="remove(c.id)">Xoá</button>
                  </td>
                </tr>

                <tr v-if="!loading && displayed.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-dark" role="status"></div>
              <div class="small text-muted mt-2">Đang tải...</div>
            </div>

            <p v-if="error" class="text-dark small p-3">{{ error }}</p>
          </div>
        </div>
      </div>

      
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body">
            <h6 class="fw-bold mb-3">Danh sách thương hiệu</h6>
            <ul class="list-group">
              <li
  v-for="b in brands"
  :key="b.id"
  class="list-group-item d-flex justify-content-between align-items-center"
>
  <a
    href="#"
    class="text-decoration-none"
    @click.prevent="$router.push({ name:'products', query: { brandId: b.id } })"
  >{{ b.name }}</a>
  <span class="badge bg-light text-dark border">{{ b.count }}</span>
</li>

            </ul>
            <div v-if="brands.length === 0" class="text-muted small">Chưa có dữ liệu.</div>
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
const loading = ref(true);
const error = ref("");

const filters = ref({ keyword: "", sort: "name_asc" });
const applied = ref({ ...filters.value });

const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");


const displayed = computed(() => {
  let list = [...items.value];

  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase());
    list = list.filter((c) => unaccent((c.name || "").toLowerCase()).includes(kw));
  }

  switch (applied.value.sort) {
    case "name_asc":  list.sort((a,b)=> (a.name||"").localeCompare(b.name||"","vi",{sensitivity:"base"})); break;
    case "name_desc": list.sort((a,b)=> (b.name||"").localeCompare(a.name||"","vi",{sensitivity:"base"})); break;
  }
  return list;
});

function applyFilters(){ applied.value = { ...filters.value }; }
function resetFilters(){ filters.value = { keyword: "", sort: "name_asc" }; applied.value = { ...filters.value }; }

function edit(id){ router.push({ name: "category-edit", params: { id } }); }
async function remove(id){
  if (!confirm("Xoá loại này?")) return;
  await categoryService.remove(id);
  items.value = items.value.filter(c => c.id !== id);
}

onMounted(async () => {
  try {
    loading.value = true;
    const [cats, brandList] = await Promise.all([
      categoryService.list(),
      categoryService.brands()
    ]);
    items.value = cats;
    brands.value = brandList;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "Tải dữ liệu thất bại";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.table th, .table td { vertical-align: middle; }


@media (max-width: 576px) {
  .table-responsive { background: transparent; }
  .table { display: block; background: transparent; }
  .table thead { display: none; }
  .table tbody, .table tr, .table td { display: block; width: 100%; }
  .table tr {
    background: #fff; margin-bottom: 1rem; border: 1px solid #e9ecef;
    border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 1rem;
  }
  .table td {
    border: none !important; border-bottom: 1px dashed #e9ecef !important;
    position: relative; padding-left: 120px !important;
    padding-right: 1rem !important; padding-top: .75rem !important; padding-bottom: .75rem !important;
    display: flex; align-items: center;
  }
  .table td:last-child { border-bottom: none !important; }
  .table td::before {
    content: attr(data-label); position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
    width: 100px; font-weight: 600; color: #6c757d; white-space: nowrap;
  }
  .table td.text-end::before { top: .75rem; transform: none; }
  .table td.text-center { justify-content: center; padding-left: 1rem !important; }
  .table td.text-center::before { display: none; }
}
</style>
