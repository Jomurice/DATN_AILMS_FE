<!-- src/components/category/CategoryList.vue -->
<template>
  <div>

    <div class="d-flex align-items-center justify-content-between mb-2">
      <div class="search p-0">
        <input type="text" class="form-control" placeholder="Tìm theo tên loại hàng hóa">
      </div>

      <h2>Loại hàng hóa</h2>

      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng loại hàng hóa: <span class="num"></span></div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-4">

      <!-- LIST -->
      <div class="card border-0 shadow-sm rounded-3 main">

        <div class="m-2 d-flex gap-3 align-items-center justify-content-end">
          <button class="btn btn-success btn-sm col-md-1 " @click="$router.push('/category/add')">+ Thêm</button>
          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center rounded-3 justify-content-end">
            Số mục
            <select class="form-select mx-2 rounded-3">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr class="text-uppercase table-primary small fw-bold">
                <th @click="selectSort()" class="name">Tên loại
                  <i v-if="isSort" class="fa-solid fa-arrow-up ms-2"></i>
                  <i v-else class="fa-solid fa-arrow-down ms-2"></i>
                </th>
                <th>Mô tả</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in categories" :key="c.id">
                <td :data-label="'Tên loại'">{{ c.name }}</td>
                <td :data-label="'Mô tả'">{{ c.description || '—' }}</td>
                <td class="text-center" :data-label="'Hành động'">

                  <button class="btn btn-sm btn-outline-warning me-1" title="Sửa thông tin loại hàng"
                    @click="$router.push(`/category/${c.id}/detail`)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeItem(c.id)" title="Ẩn loại hàng ">
                    <i class="fas fa-eye-slash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="isLoading" class="text-center py-3">
                <td colspan="6">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="small mx-2 fs-5 text-primary mt-2">Đang tải...</div>
                </td>
              </tr>
              <tr v-if="!isLoading && categories.length === 0">
                <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <!-- page -->
          <div class="sizePage bg-danger-subtle p-2 d-flex align-items-center justify-content-end">
            <nav v-if="pages?.totalPages > 1" class="page d-flex fs-4 gap-2">
              <!-- Last -->
              <p class="fw-bold" :class="{ 'text-muted': pages.number === 0 }" @click="changePage(pages.number - 1)">
                &lt;
              </p>

              <nav class="d-flex gap-2">
                <p v-for="p in visiblePages" :key="p"
                  :class="[{ 'fw-bold text-primary': p !== '...' && pages.number === p - 1 }, p === '...' ? 'text-muted' : '']"
                  @click="p !== '...' && changePage(p - 1)" class="m-0">
                  <span class="fs-5">{{ p }}</span>
                </p>
              </nav>

              <!-- Next -->
              <p class="fw-bold" :class="{ 'text-muted': pages.number === pages.totalPages - 1 }"
                @click="changePage(pages.number + 1)">
                &gt;
              </p>
            </nav>
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
const isSort = ref(true);
const filters = ref({ keyword: '', sort: 'name_asc' })
const applied = ref({ ...filters.value })
const payload = ref({
  name: '',
  pageable: {
    page: 0,
    size: 10,
    sort: [""]
  }
});
const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')


function selectSort() {
  if (isSort.value) {
    isSort.value = false;
    payload.value.pageable.sort = 'name,desc';
  } else {
    isSort.value = true;
    payload.value.pageable.sort = 'name,asc';
  }
}

async function loadAll() {
  isLoading.value = true
  error.value = ''
  try { categories.value = await categoryService.getAll() }
  catch (e) { error.value = 'Lỗi tải danh mục.' }
  finally { isLoading.value = false }
}

async function removeItem(id) {
  if (!confirm('Xoá loại này?')) return
  await categoryService.remove(id)
  categories.value = categories.value.filter(c => String(c.id) !== String(id))
}

onMounted(loadAll)
</script>

<style scoped>
/* Kéo sát navbar (triệt padding của layout ngoài) */
.category-page {
  padding-top: 8px !important;
  margin-top: -150px;
}

:deep(.container-fluid.py-4) {
  padding-top: 0 !important;
}


.main {
  flex: 1 1 auto;
  min-width: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgba(0, 0, 0, 0.147);
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.search {
  flex: 0 0 18%;
}

.form-control {
  width: 100%;
  border: none;
  border-radius: 10px;
}

.name {
  cursor: pointer;
}

.asideChildren {
  min-width: 200px;
}

.asideChildren>h5 {
  margin-bottom: 10px;
}

.badge-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 8px 14px;
  max-width: 170px;
  max-height: 40px;
  text-align: center;
}

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
}

.sizePage {
  max-height: 650px;
}

.page>p {
  cursor: pointer;
  max-height: 10px;
}

.sizePage>.form-select {
  max-width: 70px;
}

/* Hai khối xếp dọc, rộng 100% */
.stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 90%;
}

/* Card trắng dùng chung */
.section-card {
  width: 100%;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, .03);
}

.section-card .card-body {
  padding: 16px 20px;
}

.table th,
.table td {
  vertical-align: middle;
}

/* Mobile: bảng thành thẻ */
@media (max-width: 576px) {
  .table thead {
    display: none;
  }

  .table,
  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }

  .table tr {
    background: #fff;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: .5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .05);
    padding: .75rem;
  }

  .table td {
    border: none !important;
    border-bottom: 1px dashed #e9ecef !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .5rem .25rem;
  }

  .table td:last-child {
    border-bottom: none !important;
  }

  .section-card .card-body {
    padding: 12px;
  }
}
</style>