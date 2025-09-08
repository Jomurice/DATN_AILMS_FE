<!-- src/components/category/CategoryList.vue -->
<template>
  <div class="container-fluid category-page">
    <div class="stack">
      <!-- FILTER -->
      <div class="card section-card">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-xl-6 col-lg-6 col-md-7">
              <label class="form-label fw-semibold text-dark">Tìm theo tên loại</label>
              <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên loại..." />
            </div>

            <div class="col-xl-3 col-lg-3 col-md-5">
              <label class="form-label fw-semibold text-dark">Sắp xếp</label>
              <select v-model="filters.sort" class="form-select">
                <option value="name_asc">Tên A → Z</option>
                <option value="name_desc">Tên Z → A</option>
              </select>
            </div>

            <div class="col-xl-3 col-lg-3 col-md-12 d-flex justify-content-xl-end justify-content-lg-end gap-2">
              <button class="btn btn-sm btn-secondary" @click="resetFilters">
                <i class="fa-solid fa-rotate me-1"></i> Làm mới
              </button>

              <button class="btn btn-primary" @click="applyFilters">
                <i class="fa-solid fa-magnifying-glass me-1"></i> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- LIST -->
      <div class="card section-card">
        <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
          <h4 class="fw-bold mb-0">Danh sách loại</h4>
          <button class="btn btn-success btn-sm" @click="$router.push('/category/add')">+ Thêm loại</button>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr class="text-uppercase text-dark small fw-bold">
                <th class="ps-3">Mã loại</th>
                <th>Tên loại</th>
                <th>Mô tả</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in displayed" :key="c.id">
                <td class="ps-3" :data-label="'Mã loại'">{{ c.id }}</td>
                <td :data-label="'Tên loại'">{{ c.name }}</td>
                <td :data-label="'Mô tả'">{{ c.description || '—' }}</td>
                <td class="text-center" :data-label="'Hành động'">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="$router.push(`/category/${c.id}/detail`)">Sửa</button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeItem(c.id)">Xoá</button>
                </td>
              </tr>
              <tr v-if="!isLoading && displayed.length === 0">
                <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status"></div>
            <div class="small text-muted mt-2">Đang tải...</div>
          </div>

          <p v-if="error" class="text-danger small p-3">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { categoryService } from '../../services/categoryService'

const categories = ref([])
const isLoading = ref(false)
const error = ref('')

const filters = ref({ keyword: '', sort: 'name_asc' })
const applied  = ref({ ...filters.value })

const unaccent = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')

const displayed = computed(() => {
  let list = [...categories.value]
  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase())
    list = list.filter(c => unaccent((c.name || '').toLowerCase()).includes(kw))
  }
  switch (applied.value.sort) {
    case 'name_asc':  list.sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi',{sensitivity:'base'})); break
    case 'name_desc': list.sort((a,b)=>(b.name||'').localeCompare(a.name||'','vi',{sensitivity:'base'})); break
  }
  return list
})

async function loadAll(){
  isLoading.value = true
  error.value = ''
  try { categories.value = await categoryService.getAll() }
  catch(e){ error.value = e?.message || 'Lỗi tải danh mục.' }
  finally { isLoading.value = false }
}

function applyFilters(){ applied.value = { ...filters.value } }
function resetFilters(){ filters.value = { keyword:'', sort:'name_asc' }; applied.value = { ...filters.value } }

async function removeItem(id){
  if (!confirm('Xoá loại này?')) return
  await categoryService.remove(id)
  categories.value = categories.value.filter(c => String(c.id) !== String(id))
}

onMounted(loadAll)
</script>

<style scoped>
/* Kéo sát navbar (triệt padding của layout ngoài) */
.category-page{ padding-top:8px !important; margin-top:-150px; }
:deep(.container-fluid.py-4){ padding-top:0 !important; }

/* Hai khối xếp dọc, rộng 100% */
.stack{ display:flex; flex-direction:column; gap:14px; width:90%; }

/* Card trắng dùng chung */
.section-card{
  width:100%;
  background:#fff;
  border:1px solid #eef2f7;
  border-radius:12px;
  box-shadow:0 1px 2px rgba(0,0,0,.03);
}
.section-card .card-body{ padding:16px 20px; }

.table th, .table td { vertical-align:middle; }

/* Mobile: bảng thành thẻ */
@media (max-width: 576px){
  .table thead{ display:none; }
  .table, .table tbody, .table tr, .table td{ display:block; width:100%; }
  .table tr{
    background:#fff; margin-bottom:1rem; border:1px solid #e9ecef;
    border-radius:.5rem; box-shadow:0 2px 4px rgba(0,0,0,.05); padding:.75rem;
  }
  .table td{
    border:none !important; border-bottom:1px dashed #e9ecef !important;
    display:flex; justify-content:space-between; align-items:center; padding:.5rem .25rem;
  }
  .table td:last-child{ border-bottom:none !important; }
  .section-card .card-body{ padding:12px; }
}
</style>
