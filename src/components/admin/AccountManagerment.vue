
<template>
  <div class="container-fluid page-tight">
    <div class="stack-vertical">
      <div class="card border-0 shadow-sm rounded-3 mb-3 w-100">
        <div class="card-body py-3">
          <div class="row g-3 align-items-end">
            
            <div class="col-lg-4 col-md-6">
              <label class="form-label fw-semibold">Tìm theo tên</label>
              <input v-model="filters.name" class="form-control" placeholder="Nhập tên cần tìm..." />
            </div>

            <div class="col-lg-3 col-md-4">
              <label class="form-label fw-semibold">Chức vụ</label>
              <select v-model="filters.role" class="form-select">
                <option value="">-- Tất cả --</option>
                <option v-for="r in roleOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            
            <div class="col-lg-5 col-md-12">
              <div class="d-flex gap-2 flex-wrap justify-content-lg-end">
                <div class="badge-card">
                  <div class="text-muted small">Tổng NV</div>
                  <div class="num">{{ displayed.length }}</div>
                </div>
                <div class="badge-card">
                  <div class="text-muted small">Nam</div>
                  <div class="num">{{ displayed.filter(u => u.gender===true).length }}</div>
                </div>
                <div class="badge-card">
                  <div class="text-muted small">Nữ</div>
                  <div class="num">{{ displayed.filter(u => u.gender===false).length }}</div>
                </div>
              </div>
            </div>

            
            <div class="col-12 d-flex flex-wrap gap-2 justify-content-end mt-2">
              <button class="btn btn-secondary btn-cta" @click="resetFilters">
                <i class="fa-solid fa-rotate me-1"></i> Làm mới
              </button>
              <button class="btn btn-primary btn-cta" @click="applyFilters">
                <i class="fa-solid fa-magnifying-glass me-1"></i> Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

     
      <div class="card border-0 shadow-sm rounded-3 w-100">
        <div class="d-flex align-items-center justify-content-between px-4 pt-4 flex-wrap gap-2">
          <h4 class="fw-bold mb-0">Danh sách</h4>
          <div class="d-flex align-items-center gap-2">
            
            <select v-model="sortKey" class="form-select w-auto">
              <optgroup label="Theo tên">
                <option value="name_asc">Tên A → Z</option>
                <option value="name_desc">Tên Z → A</option>
              </optgroup>
              <optgroup label="Theo ID">
                <option value="id_asc">ID ↑</option>
                <option value="id_desc">ID ↓</option>
              </optgroup>
            </select>
            <button class="btn btn-success btn-cta" @click="$router.push('/admin/account/add')">
              + Thêm
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr class="text-uppercase small fw-bold">
                
                <th class="ps-4">Tên tài khoản</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Chức vụ</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="u in displayed" :key="u.id">
                <td class="ps-4" :data-label="'Tên tài khoản'">{{ u.username }}</td>
                <td :data-label="'Họ tên'">{{ u.name }}</td>
                <td :data-label="'Email'">{{ u.email }}</td>
                <td :data-label="'Giới tính'">{{ u.gender ? 'Nam' : 'Nữ' }}</td>
                <td :data-label="'Chức vụ'">
                  <span v-for="r in (u.roles || [])" :key="r" class="badge bg-info me-1">{{ r }}</span>
                </td>
                <td :data-label="'Trạng thái'">
                  <span :class="u.enabled ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ u.enabled ? 'Đang hoạt động' : 'Đã khoá' }}
                  </span>
                </td>
                <td class="text-center" :data-label="'Hành động'">
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-sm btn-outline-info"
                            @click="$router.push(`/admin/account/${u.id}/detail`)">
                      Chi tiết
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            @click="$router.push(`/admin/account/${u.id}/edit`)">
                      Sửa
                    </button>
                    <button
                      class="btn btn-sm"
                      :class="u.enabled ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="toggleEnable(u)"
                    >
                      {{ u.enabled ? 'Khoá' : 'Mở khoá' }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && displayed.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <div v-if="loading" class="text-center py-5">
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

import { userService } from '../../services/userService'

const users = ref([])
const loading = ref(false)
const error = ref('')

const roleOptions = ['ADMIN', 'USER'] 


const filters = ref({ name: '', role: '' })
const applied = ref({ ...filters.value })


const sortKey = ref('name_asc')

const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const displayed = computed(() => {
  let list = [...users.value]

 
  if (applied.value.name.trim()) {
    const kw = unaccent(applied.value.name.trim().toLowerCase())
    list = list.filter(u => unaccent((u.name || '').toLowerCase()).includes(kw))
  }
  if (applied.value.role) {
    const r = applied.value.role.toLowerCase()
    list = list.filter(u => (u.roles || []).some(x => String(x).toLowerCase() === r))
  }

  
  switch (sortKey.value) {
    case 'name_asc':  list.sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi',{sensitivity:'base'})); break
    case 'name_desc': list.sort((a,b)=>(b.name||'').localeCompare(a.name||'','vi',{sensitivity:'base'})); break
    case 'id_asc':    list.sort((a,b)=>String(a.id||'').localeCompare(String(b.id||''))); break
    case 'id_desc':   list.sort((a,b)=>String(b.id||'').localeCompare(String(a.id||''))); break
  }
  return list
})

function applyFilters () {
  applied.value = { ...filters.value }
}
function resetFilters () {
  filters.value = { name: '', role: '' }
  applied.value = { ...filters.value }
  sortKey.value = 'name_asc'
}

async function load () {
  loading.value = true
  error.value = ''
  try {
    users.value = await userService.getAllUsers()
  } catch (e) {
    error.value = e?.message || 'Lỗi tải danh sách.'
  } finally {
    loading.value = false
  }
}
async function toggleEnable (u) {
  try {
    await userService.enableUser(u.id)
    u.enabled = !u.enabled
  } catch (e) {
  
  }
}

onMounted(load)
</script>

<style scoped>

.page-tight { padding-top: 12px !important; }


.stack-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.stack-vertical > .card { width: 100%; }

.badge-card{
  background:#fff;
  border:1px solid #eef2f7;
  border-radius:10px;
  padding:8px 14px;
  min-width:120px;
  text-align:center;
}
.badge-card .num{ font-weight:700; color:#1f2937; }


.btn-cta{ padding:.55rem 1rem; font-weight:600; }

.table th,.table td{ vertical-align: middle; }


@media (max-width: 576px){
  .table thead{ display:none; }
  .table, .table tbody, .table tr, .table td{ display:block; width:100%; }
  .table tr{
    background:#fff; margin-bottom:12px; border:1px solid #e5e7eb;
    border-radius:8px; padding:10px 12px;
  }
  .table td{
    border:none !important; border-bottom:1px dashed #eee !important;
    display:flex; justify-content:space-between; align-items:center;
  }
  .table td:last-child{ border-bottom:none !important; }
}
</style>
