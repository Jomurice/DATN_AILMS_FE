<template>
  <div>

    <div class="d-flex mb-2 align-items-center justify-content-between ">

      <div class="col-md-3 p-0">
        <input v-model="payload.name" @change="load()" type="text" class="form-control" placeholder="Nhập tên nhân viên cần tìm" />
      </div>

      <h2>Nhân sự</h2>


      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng nhân viên: <span class="num">{{ users.length }}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Nhân viên nam: <span class="num">{{users.filter(user => user.gender ===
            true).length}}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Nhân viên nữ: <span class="num">{{users.filter(user => user.gender ===
            false).length}}</span></div>
        </div>
      </div>

    </div>


    <div class="d-flex gap-4">

      <aside class="card d-flex gap-3 border-0 p-2 shadow-sm rounded-3 side">

        <div class="asideChildren">
          <h5>Chức vụ</h5>
          <select v-model="payload.role" class="form-select">
            <option value=''>Tất cả</option>
            <option v-for="r in roles" :key="r.name" :value="r.name">{{ r.name }}</option>
          </select>
        </div>

        <div class="asideChildren " >
          <h5>Giới tính</h5>
          <button @click="selectGender('') " :class="{active: isGender === ''}">Tất cả</button>
          <button @click="selectGender(true) " :class="{active: isGender === true}">Nam</button>
          <button @click="selectGender(false) " :class="{active: isGender === false}">Nữ</button>
        </div>

        <div class="asideChildren " >
          <h5>Trạng thái</h5>
          <button @click="selectStatus('') " :class="{active: isStatus === ''}">Tất cả</button>
          <button @click="selectStatus(true) " :class="{active: isStatus === true}">Hoạt động</button>
          <button @click="selectStatus(false) " :class="{active: isStatus === false}">Khóa</button>
        </div>

        <div class=" asideChildren">
          <h5>Sắp xếp</h5>

          <select class=" form-select form-select-sm w-100">
            <optgroup label="Theo tên">
              <option value="name_asc">Tên A → Z</option>
              <option value="name_desc">Tên Z → A</option>
            </optgroup>
          </select>

        </div>

      </aside>


      <div class="card border-0 shadow-sm rounded-3 main">

        <div class="m-2 d-flex gap-3 justify-content-end">
          <button class="btn btn-success btn-sm col-md-1 " @click="$router.push('/admin/account/add')">+ Thêm</button>
          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center rounded-3 justify-content-end">
            Số mục
            <select v-model.number="payload.pageable.size" class="form-select mx-2 rounded-3">
              <option value="5">5</option>
              <option value="7">7</option>
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
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead >
              <tr class="text-uppercase table-primary small fw-bold">
                <th class="ps-4">Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Chức vụ</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td class="ps-4" :data-label="'Tên đăng nhập'">{{ u.username }}</td>
                <td :data-label="'Họ tên'">{{ u.name }}</td>
                <td :data-label="'Email'">{{ u.email }}</td>
                <td :data-label="'Giới tính'">{{ u.gender ? 'Nam' : 'Nữ' }}</td>
                <td :data-label="'Chức vụ'">
                  <span v-for="r in (u.roles || [])" :key="r" class="badge bg-info me-1">{{ r }}</span>
                </td>
                <td :data-label="'Trạng thái'">
                  <span :class="u.status ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ u.status ? 'Đang hoạt động' : 'Đã khoá' }}
                  </span>
                </td>
                <td class="text-center" :data-label="'Hành động'">
                  <div class="d-flex justify-content-center gap-2 flex-nowrap">
                    <button class="btn btn-sm btn-outline-info me-1"
                      @click="$router.push(`/admin/account/${u.id}/detail`)">Chi tiết
                    </button>
                    <button class="btn btn-outline-warning"
                      @click="$router.push(`/admin/account/${u.id}/edit`)">Sửa</button>
                    <button class="btn" :class="u.enabled ? 'btn-outline-danger' : 'btn-outline-success'"
                      @click="toggleEnable(u)">
                      {{ u.enabled ? 'Khoá' : 'Mở khoá' }}
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && users.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>
          
          

        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-dark" role="status"></div>
          <div class="small text-muted mt-2">Đang tải...</div>
        </div>

        <p v-if="error" class="text-danger small p-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'chart.js/helpers'
import { userService } from '../../services/userService'
import { roleService } from '../../services/RoleService'


const payload = ref({
  name: '',
  role: '',
  status: '',
  gender: '',
  pageable: {
    page: 0,
    size: 10,
    sort: [""]
  }
})

const users = ref([]);
const roles = ref([]);
const loading = ref(false);
const error = ref('');
const isGender = ref('');
const isStatus = ref('');


const filters = ref({ name: '', role: '' })
const applied = ref({ ...filters.value })
const sortKey = ref('name_asc')
const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

payload.value.name = unaccent(payload.value.name);

function selectGender(value) {
  isGender.value = value;       
  payload.value.gender = value; 
}

function selectStatus(value){
  isStatus.value = value;
  payload.value.status = value;
}

function applyFilters() {
  applied.value = { ...filters.value }
}
function resetFilters() {
  filters.value = { name: '', role: '' }
  applied.value = { ...filters.value }
  sortKey.value = 'name_asc'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await userService.getAllUsers(payload.value);
    users.value = response.data?.result?.content;
    roles.value = await roleService.getAll();
    console.log(payload.value);
  } catch (e) {
    error.value = e?.message || 'Lỗi tải danh sách.'
    console.log("error",e);
  } finally {
    loading.value = false
  }
}
async function toggleEnable(u) {
  try {
    await userService.enableUser(u.id)
    u.enabled = !u.enabled
  } catch (e) {

  }
}
const debouncedLoad = debounce(load,300) ;

onMounted(load)

watch(payload, () =>{
  debouncedLoad()
}, {deep: true});

</script>

<style scoped>
.page-tight {
  padding-top: 12px !important;
}


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

.asideChildren{
  min-width: 200px;
}
.asideChildren>h5{
  margin-bottom: 10px;
}

.asideChildren>button{
  padding-left: 10px;
  padding-right: 10px;
  margin: 4px;
  border-radius: 30px;
  background-color: white;
  min-width: 70px;
  border: 1px solid grey;
}

.asideChildren>button.active{
  background-color: blue;
  color: white;
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

.form-control {
  width: 270px;
  border: none;
  border-radius: 10px;
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

.btn-cta {
  padding: .55rem 1rem;
  font-weight: 600;
}

.table th,
.table td {
  min-width: fit-content;
  vertical-align: middle;
  white-space: nowrap;
}


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
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
  }

  .table td {
    border: none !important;
    border-bottom: 1px dashed #eee !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table td:last-child {
    border-bottom: none !important;
  }
}
</style>
