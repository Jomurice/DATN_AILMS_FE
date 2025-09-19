<template>
  <div>

    <div class="d-flex mb-2 align-items-center justify-content-between ">

      <div class="search p-0">
        <input v-model="payload.name" @change="load()" type="text" class="form-control"
          placeholder="Nhập tên nhân viên cần tìm" />
      </div>

      <h2>Nhân sự</h2>


      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng nhân viên: <span class="num">{{ totalUser.totalUsers }}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Nhân viên nam: <span class="num">{{ totalUser.totalMales }}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Nhân viên nữ: <span class="num">{{ totalUser.totalFemales }}</span></div>
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

        <div class="asideChildren ">
          <h5>Giới tính</h5>
          <button @click="selectGender('')" :class="{ active: isGender === '' }">Tất cả</button>
          <button @click="selectGender(true)" :class="{ active: isGender === true }">Nam</button>
          <button @click="selectGender(false)" :class="{ active: isGender === false }">Nữ</button>
        </div>

        <div class="asideChildren ">
          <h5>Trạng thái</h5>
          <button @click="selectStatus('')" :class="{ active: isStatus === '' }">Tất cả</button>
          <button @click="selectStatus(true)" :class="{ active: isStatus === true }">Hoạt động</button>
          <button @click="selectStatus(false)" :class="{ active: isStatus === false }">Khóa</button>
        </div>

        <div class=" asideChildren">
          <h5>Sắp xếp</h5>

          <select v-model.trim="payload.pageable.sort" class=" form-select form-select-sm w-100">
            <optgroup label="Theo tên">
              <option value="name,asc">Tên A → Z</option>
              <option value="name,desc">Tên Z → A</option>
            </optgroup>
          </select>

        </div>

      </aside>


      <div class="card border-0 shadow-sm rounded-3 main">

        <div class="m-2 d-flex gap-3 align-items-center justify-content-end">
          <button class="btn btn-success col-md-1 " @click="$router.push('/admin/account/add')">+ Thêm</button>
          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center rounded-3 justify-content-end">
            <span>Số mục</span>
            <select v-model.number="payload.pageable.size" class="form-select mx-2 rounded-3">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="content">

          <div class="table-wrapper">
            <table class="table table-hover mb-0">
              <thead class="scroll-body">
                <tr class="text-uppercase table-primary small fw-bold">
                  <th>STT</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Giới tính</th>
                  <th>Chức vụ</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
            </table>

            <table class="table table-hover mb-0">
              <colgroup></colgroup>
              <tbody>
                <tr v-for="(u, index) in users" :key="u.id">
                  <td class="ps-4" :data-label="'STT'">{{ payload.pageable.page * payload.pageable.size + index + 1 }}
                  </td>
                  <td :data-label="'Tên đăng nhập'">{{ u.username }}</td>
                  <td :data-label="'Họ và tên'">{{ u.name }}</td>
                  <td :data-label="'Email'" :title="u.email">{{ u.email }}</td>
                  <td :data-label="'Giới tính'">{{ u.gender ? 'Nam' : 'Nữ' }}</td>
                  <td :data-label="'Chức vụ'">
                    <span v-for="r in (u.roles || [])" :key="r" class="ps-2">{{ r }}</span>
                  </td>
                  <td :data-label="'Trạng thái'">
                    <span :class="u.status ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ u.status ? 'Đang hoạt động' : 'Đã khoá' }}
                    </span>
                  </td>
                  <td :data-label="'Hành động'">
                    <div class="d-flex justify-content-center gap-2 flex-nowrap">
                      <button class="btn btn-sm btn-outline-info me-1" title="Chi tiết"
                        @click="$router.push(`/admin/account/${u.id}/detail`)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning" title="Sửa thông tin"
                        @click="$router.push(`/admin/account/${u.id}/edit`)">
                        <i class="fa-solid fa-user-pen"></i>
                      </button>
                      <button class="btn" :class="u.status ? 'btn-outline-danger' : 'btn-outline-success'"
                        :title="u.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản'" @click="changeStatus(u)" @load="">
                        <i v-if="u.status" class="fas fa-user-slash"></i>
                        <i v-else class="fas fa-user-check"></i>
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

          <div class="page bg-danger-subtle p-2 d-flex align-items-center justify-content-end">
            <nav class="d-flex fs-4 gap-2 align-items-center">
              <span class="fs-5">Trang</span>

              <input type="text" v-model.number="currentPageInput" @keyup.enter="goToPage" min="1"
                :max="pages.totalPages" class=" rounded-3">

              <button class="btn btn-sm fw-bold " :disabled="pages.number === 0"
                @click="changePage(pages.number - 1)">
                &lt;
              </button>

              <span class="fs-5">{{ pages.number + 1 }} / {{ pages.totalPages }}</span>

              <button class="btn btn-sm fw-bold" :disabled="pages.number === pages.totalPages - 1"
                @click="changePage(pages.number + 1)">
                &gt;
              </button>
            </nav>
          </div>


          <p v-if="error" class="text-danger small p-3">{{ error }}</p>
        </div>

      </div>


      <!-- Modal xác nhận -->
      <div class="modal fade" id="confirmModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body text-center">
              <p class="mb-4">{{ confirmMessage }}</p>
              <div class="d-flex justify-content-center gap-3">
                <button class="btn btn-secondary" @click="cancelConfirm">Hủy</button>
                <button class="btn btn-success" @click="confirmAction">Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="modal-overlay text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <div class="small mx-2 fs-5 text-info mt-2">Đang tải...</div>
      </div>

    </div>
  </div>
</template>

<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'chart.js/helpers'
import { userService } from '../../services/UserService'
import { roleService } from '../../services/RoleService'


const payload = ref({
  name: '',
  role: '',
  status: '',
  gender: '',
  pageable: {
    page: 0,
    size: 10,
    sort: "name,asc"
  }
});

const pages = ref({
  number: 0,
  totalPages: 10,
  content: []
})

const totalUser = ref([]);

const users = ref([]);
const user = ref();
const roles = ref([]);
const loading = ref(false);
const error = ref('');
const isGender = ref('');
const isStatus = ref('');
const confirmMessage = ref('')
let confirmCallback = null


const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

payload.value.name = unaccent(payload.value.name);

function selectGender(value) {
  isGender.value = value;
  payload.value.gender = value;
}

function selectStatus(value) {
  isStatus.value = value;
  payload.value.status = value;
}



// Input số trang
const currentPageInput = ref(1)

// Khi người dùng nhập số trang
function goToPage() {
  let newPage = currentPageInput.value - 1
  if (newPage < 0) newPage = 0
  if (newPage >= pages.value.totalPages) newPage = pages.value.totalPages - 1
  changePage(newPage)
}

// Thay đổi trang bằng nút Previous/Next
function changePage(newPage) {
  if (newPage < 0 || newPage >= pages.value.totalPages) return
  payload.value.pageable.page = newPage
  pages.value.number = newPage
  currentPageInput.value = newPage + 1
  // TODO: gọi API fetch dữ liệu mới ở đây
}



function showConfirm(message, callback) {
  confirmMessage.value = message
  confirmCallback = callback
  const modal = new bootstrap.Modal(document.getElementById('confirmModal'))
  modal.show()
}

function confirmAction() {
  if (confirmCallback) confirmCallback()
  const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'))
  modal.hide()
}

function cancelConfirm() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'))
  modal.hide()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    roles.value = await roleService.getAll();
    totalUser.value = await userService.getTotalUser();
    const response = await userService.getAllUsers(payload.value);
    users.value = response.result?.content;
    pages.value = response.result;
  } catch (e) {
    error.value = e?.message || 'Lỗi tải danh sách.'
    console.log("error", e);
  } finally {
    loading.value = false
  }
  console.log(payload.value.pageable);
}

async function getUserById(id) {
  try {
    user.value = await userService.getUserById(id);
    console.log(user.value);
  } catch (error) {
    console.log("error", error);
  }
}

async function changeStatus(user) {

  const action = user.status
    ? { msg: 'Bạn có chắc chắn muốn khóa tài khoản này không !', fn: userService.unEnableUser }
    : { msg: 'Bạn có chắc chắn muốn mở khóa tài khoản này không !', fn: userService.enableUser };

  showConfirm(action.msg, async () => {
    await action.fn(user.id);
    load();
  });
}


const debouncedLoad = debounce(load, 300);

onMounted(load)

watch(
  () => [payload.value.name, payload.value.role, payload.value.status, payload.value.gender, payload.value.pageable.size, payload.value.pageable.sort,],
  () => {
    payload.value.pageable.page = 0
    debouncedLoad()
  }
)

watch(
  () => payload.value.pageable.page,
  () => debouncedLoad()
)


</script>

<style scoped>
.page-tight {
  padding-top: 12px !important;
}

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
}

.side {
  max-width: 18%;
  height: calc(100vh - 200px);
  overflow: auto;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  height: calc(100vh - 200px);
}

.main>.content {
  overflow-y: auto;
}

.asideChildren {
  min-width: 200px;
}

.asideChildren>h5 {
  margin-bottom: 10px;
}

.asideChildren>button {
  padding-left: 10px;
  padding-right: 10px;
  margin: 4px;
  border-radius: 30px;
  background-color: white;
  min-width: 70px;
  border: 1px solid grey;
}

.asideChildren>button.active {
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

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
}

.search {
  width: 18%;
}

.form-control {
  border: none;
  border-radius: 10px;
}

.sizePage {
  max-height: 650px;
}

.page>nav>p {
  max-height: 10px;
  cursor: pointer;
}

.page>nav>.btn{
  height: 30px;
  font-size: 18px;
  border: none;
}

.page>nav>input {
  border: none;
  width: 50px;
  height: 30px;
  font-size: 18px;
  text-align: center;
}

.numberPage>p>span {
  cursor: pointer;
}

.btn {
  max-height: 40px;
  min-width: 40px;
}

.table-wrapper {
  overflow-x: auto;
}


.table-wrapper table {
  width: fit-content;
  min-width: 100%;
}

.table {
  table-layout: fixed;
}

.table th,
.table td {
  width: 140px;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scroll-body {
  position: sticky;
  top: 0;
  z-index: 10;
}


/* .table th,
.table td {
  min-width: fit-content;
  vertical-align: middle;
  white-space: nowrap;
} */

@media (max-width: 1028px) {
  .side {
    display: none;
  }
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

  .table td:last-child {
    border-bottom: none !important;
  }
}
</style>
