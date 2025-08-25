<template>
  <div class="container p-4">
    <h5 class="fw-bold mb-3">Danh sách</h5>

    <!-- BỘ LỌC -->
    <div class="d-flex flex-wrap align-items-end gap-3 mb-3">
      <!-- Tìm theo tên -->
      <div class="flex-grow-1" style="max-width: 300px;">
        <label class="form-label mb-1">Tìm theo tên</label>
        <input
          v-model="filters.name"
          type="text"
          class="form-control"
          placeholder="Nhập tên cần tìm..."
        />
      </div>

      <!-- Lọc theo chức vụ (Role) -->
      <div style="min-width: 200px;">
        <label class="form-label mb-1">Chức vụ</label>
        <select v-model="filters.role" class="form-select">
          <option value="">-- Tất cả --</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      </div>

      <!-- Sort -->
      <!--<div style="min-width: 240px;">
        <label class="form-label mb-1">Sort</label>
        <select v-model="filters.sort" class="form-select">
          <option value="name_desc">Tên Z → A</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="id_asc">ID tăng dần</option>
          <option value="id_desc">ID giảm dần</option>
          <option value="role_desc">Số vai trò giảm dần</option>
          <option value="role_asc">Số vai trò tăng dần</option>
        </select>
      </div>-->

      <div class="ms-auto d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="resetFilters">Reset</button>
        <button class="btn btn-primary" @click="applyFilters">Tìm kiếm</button>
      </div>
    </div>

    <!-- THANH HÀNH ĐỘNG -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" @click="$router.push('/users/add')">+ Thêm</button>
    </div>

    <!-- BẢNG -->
    <table class="table table-bordered table-striped">
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
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span v-if="user.gender === true || user.gender === 'true'" class="badge bg-primary">Nam</span>
            <span v-else class="badge bg-danger">Nữ</span>
          </td>
          <td>
            <span v-for="role in (user.roles || [])" :key="role" class="badge bg-info me-1">{{ role }}</span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2" @click="editUser(user.id)">Sửa</button>
            <button class="btn btn-sm btn-secondary" @click="hideUser(user.id)">Ẩn</button>
          </td>
        </tr>
        <tr v-if="displayedUsers.length === 0">
          <td colspan="7" class="text-center">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { userService } from "../../services/UserService";

const users = ref([]);

// State bộ lọc
const filters = ref({
  name: "",
  role: "",       // thay vì tag -> dùng dropdown role
  sort: "name_desc"
});

const applied = ref({
  name: "",
  role: "",
  sort: "name_desc"
});

// bỏ dấu để tìm không dấu
const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Danh sách hiển thị sau khi lọc + sort
const displayedUsers = computed(() => {
  let list = [...users.value];

  // 1) lọc theo tên
  if (applied.value.name.trim()) {
    const kw = unaccent(applied.value.name.trim().toLowerCase());
    list = list.filter(u =>
      unaccent((u.name || "").toLowerCase()).includes(kw)
    );
  }

  // 2) lọc theo role (nếu chọn)
  if (applied.value.role) {
    const r = applied.value.role.toLowerCase();
    list = list.filter(u =>
      (u.roles || []).some(role => role.toLowerCase() === r)
    );
  }

  // 3) sort
  switch (applied.value.sort) {
    case "name_asc":
      list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" })); break;
    case "name_desc":
      list.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi", { sensitivity: "base" })); break;
    case "id_asc":
      list.sort((a, b) => (a.id || "").localeCompare(b.id || "")); break;
    case "id_desc":
      list.sort((a, b) => (b.id || "").localeCompare(a.id || "")); break;
    case "role_desc":
      list.sort((a, b) => (b.roles?.length || 0) - (a.roles?.length || 0)); break;
    case "role_asc":
      list.sort((a, b) => (a.roles?.length || 0) - (b.roles?.length || 0)); break;
  }

  return list;
});

const applyFilters = () => {
  applied.value = { ...filters.value };
};

const resetFilters = () => {
  filters.value = { name: "", role: "", sort: "name_desc" };
  applied.value = { name: "", role: "", sort: "name_desc" };
};

async function getAllUsers() {
  try {
    users.value = await userService.getAllUsers();
  } catch (error) {
    console.log("Failed to load users: ", error);
  }
}

function editUser(id) {
  window.location.href = `/users/edit/${id}`;
}

async function hideUser(id) {
  if (confirm("Bạn có chắc chắn muốn ẩn người dùng này?")) {
    users.value = users.value.filter(u => u.id !== id);
  }
}

onMounted(getAllUsers);
</script>

<style scoped>
.container { background: #fff; }
.table td, .table th { vertical-align: middle; }
</style>
