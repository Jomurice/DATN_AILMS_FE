<template>
  <div class="container  p-4">

    <div class="d-flex align-items-center justify-content-end flex-wrap gap-3 mb-4">
      <div class="d-flex gap-3">

        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Tổng nhân viên</div>
            <div class="fw-bold fs-5 text-dark">{{ displayedUsers.length }}</div>
          </div>
        </div>

        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Nhân viên nam</div>
            <div class="fw-bold fs-5 text-dark">{{ displayedUsers.filter(user => user.gender === true).length }}</div>
          </div>
        </div>

        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Nhân viên nữ</div>
            <div class="fw-bold fs-5 text-dark">{{ displayedUsers.filter(user => user.gender === false).length }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 p-3 mb-3">
      <h3 class="fw-bold mb-3">Tìm kiếm</h3>
      <div class=" d-flex align-items-end justify-content-end gap-3 ">
        <div class="col-md-3">
          <label class="form-label mb-1">Tìm theo tên</label>
          <input v-model="filters.name" type="text" class="form-control" placeholder="Nhập tên cần tìm..." />
        </div>

        <div class="col-md-3">
          <label class="form-label mb-1">Chức vụ</label>
          <select v-model="filters.role" class="form-select">
            <option value="">-- Tất cả --</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>

        <div class="ms-auto d-flex gap-2 filter-actions">
          <button class="btn btn-outline-secondary" @click="resetFilters">Reset</button>
          <button class="btn btn-primary" @click="applyFilters">Tìm kiếm</button>
        </div>
      </div>
    </div>

    <div class="card p-3 border-0 rounded-3">
      <div class="d-flex justify-content-between mb-3">
        <h3 class="fw-bold mb-3">Danh sách</h3>
        <button class="btn btn-primary" @click="$router.push('/admin/account/add')">+ Thêm</button>
      </div>

      <table class="table table-bordered user-table align-middle">
        <thead class="table-primary">
          <tr>
            <th>ID</th>
            <th>Tên tài khoản</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Giới tính</th>
            <th>Chức vụ</th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in displayedUsers" :key="user.id">
            <td :data-label="'ID'">{{ user.id }}</td>
            <td :data-label="'Tên tài khoản'">{{ user.username }}</td>
            <td :data-label="'Họ tên'">{{ user.name }}</td>
            <td :data-label="'Email'">{{ user.email }}</td>
            <td :data-label="'Giới tính'">{{ user.gender ? 'Male' : 'Female' }}</td>
            <td :data-label="'Chức vụ'">
              <span v-for="role in (user.roles || [])" :key="role" class="badge bg-info me-1">{{ role }}</span>
            </td>
            <td :data-label="'Hành động'" class="text-center">
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-warning"
                  @click="$router.push(`/admin/account/${user.id}/detail`)">Sửa</button>
                <button class="btn btn-sm btn-secondary" @click="hideUser(user.id)">Ẩn</button>
              </div>
            </td>
          </tr>
          <tr v-if="displayedUsers.length === 0">
            <td colspan="7" class="text-center">No data</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userService } from "../../services/UserService";

const users = ref([]);

const filters = ref({
  name: "",
  role: "",
  sort: "name_desc"
});

const applied = ref({
  name: "",
  role: "",
  sort: "name_desc"
});

// Hàm bỏ dấu
const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Users đã lọc và sắp xếp
const displayedUsers = computed(() => {
  let list = [...users.value];

  // Filter by name
  if (applied.value.name.trim()) {
    const kw = unaccent(applied.value.name.trim().toLowerCase());
    list = list.filter(u => unaccent((u.name || "").toLowerCase()).includes(kw));
  }

  // Filter by role
  if (applied.value.role) {
    const r = applied.value.role.toLowerCase();
    list = list.filter(u => (u.roles || []).some(role => role.toLowerCase() === r));
  }

  // Sort
  switch (applied.value.sort) {
    case "name_asc":
      list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" }));
      break;
    case "name_desc":
      list.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi", { sensitivity: "base" }));
      break;
    case "id_asc":
      list.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
      break;
    case "id_desc":
      list.sort((a, b) => (b.id || "").localeCompare(a.id || ""));
      break;
    case "role_desc":
      list.sort((a, b) => (b.roles?.length || 0) - (a.roles?.length || 0));
      break;
    case "role_asc":
      list.sort((a, b) => (a.roles?.length || 0) - (b.roles?.length || 0));
      break;
  }

  return list;
});

// Áp dụng lọc
const applyFilters = () => {
  applied.value = { ...filters.value };
};

// Reset filter
const resetFilters = () => {
  filters.value = { name: "", role: "", sort: "name_desc" };
  applied.value = { name: "", role: "", sort: "name_desc" };
};

// Load users từ API
async function getAllUsers() {
  try {
    users.value = await userService.getAllUsers();
  } catch (error) {
    console.log("Failed to load users: ", error);
  }
}

// Sửa user
function editUser(id) {
  window.location.href = `/users/edit/${id}`;
}

// Ẩn user
async function hideUser(id) {
  if (confirm("Bạn có chắc chắn muốn ẩn người dùng này?")) {
    users.value = users.value.filter(u => u.id !== id);
  }
}

onMounted(getAllUsers);
</script>

<style scoped>
.card,
.search {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-table th,
.user-table td {
  vertical-align: middle;
}

/* Mobile Filters */
@media (max-width: 576px) {
  .filter-bar {
    gap: 12px !important;
  }

  .filter-bar>* {
    width: 100% !important;
    max-width: 100% !important;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .btn {
    flex: 1 1 0;
    width: 100%;
  }
}

/* Mobile Table */
@media (max-width: 1000px) {


  .user-table thead {
    display: none;
  }

  .user-table,
  .user-table tbody,
  .user-table tr,
  .user-table td {
    display: block;
    width: 100%;
  }

  .user-table tr {
    background: #fff;
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
  }

  .user-table td {
    border: none !important;
    border-bottom: 1px dashed #eee !important;
    position: relative;
    padding-left: 120px;
    min-height: 44px;
  }

  .user-table td:last-child {
    border-bottom: none !important;
    padding-bottom: 0;
  }

  .user-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    top: 10px;
    width: 100px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
  }

  .btn-group-mobile {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .btn-group-mobile .btn {
    flex: 1 1 0;
  }
}
</style>
