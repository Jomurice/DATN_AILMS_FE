
<template>
  <div class="">

    <div class="d-flex align-items-center justify-content-between mb-2">
      <div>
        <input type="text" class="form-control" placeholder="Tìm theo mã đơn hàng">
      </div>

      <h2>Xuất hàng</h2>

      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng loại hàng hóa: <span class="num"></span></div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-4">

      <aside class="card d-flex gap-3 border-0 p-2 shadow-sm rounded-3 side ">
            <div class="asideChildren">
              <label class="form-label fw-semibold text-dark">Danh sách đơn hàng</label>
              
            </div>

      </aside>

      <!-- LIST -->
      <div class="card border-0 shadow-sm rounded-3 main">
        <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr class="text-uppercase table-primary small fw-bold">
                <th class="ps-3">Mã đơn hàng</th>
                <th>Tên hàng hóa</th>
                <th>Loại hàng hóa</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in displayed" :key="c.id">
                <td class="ps-3" :data-label="'Mã đơn hàng'">{{ c.id }}</td>
                <td :data-label="'Tên hàng hóa'">{{ c.name }}</td>
                <td :data-label="'Loại hàng hóa'">{{ c.description || '—' }}</td>
                <td class="text-center" :data-label="'Số lượng'"></td>
              </tr>
              <tr v-if="!isLoading && displayed.length === 0">
                <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center justify-content-end">
            Số mục
            <select class="form-select mx-2 rounded-3">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>

            <nav class="page d-flex fs-4 gap-2">
              <p class="fw-bold"> &lt; </p>
              <p>1</p>
              <p class="fw-bold"> &gt; </p>
            </nav>
          </div>

           <div class="d-flex justify-content-end m-3" >
            <button class="btn btn-success">Nhập hàng</button>
          </div>

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

.side {
  width: 18%;
  height: calc(100vh - 200px);
  overflow: auto;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  height: calc(100vh - 200px);
  overflow: auto;
}

.form-control {
  width: 270px;
  border: none;
  border-radius: 10px;
}

.asideChildren{
  min-width: 200px;
}
.asideChildren>h5{
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

.sizePage{
  background-color: #f9e7e7;
}

.page>p{
  margin: 0;
  cursor: pointer;
}

.sizePage>.form-select{
  max-width: 70px;
}

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

.table th, .table td { 
  vertical-align:middle; 
}

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
