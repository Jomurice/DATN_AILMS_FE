<template>
  <div class="container p-4">
    <h5 class="fw-bold mb-3">Danh sách</h5>
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" @click="$router.push('/users/add')">+ Thêm </button>
    </div>
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
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span v-if="user.gender === true" class="badge bg-primary">Nam</span>
            <span v-else class="badge bg-danger">Nữ</span>
          </td>
          <td>
            <span v-for="role in user.roles" :key="role" class="badge bg-info me-1">{{ role }}</span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2" @click="editUser(user.id)">Sửa</button>
            <button class="btn btn-sm btn-secondary" @click="hideUser(user.id)">Ẩn</button>
          </td>
        </tr>
        <!-- <tr v-if="users.length === 0">
          <td colspan="7" class="text-center">No data</td>
        </tr> -->
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userService } from "../../services/UserService";

const users = ref([]);


async function getAllUsers() {
    try {
        users.value = await userService.getAllUsers();
    } catch (error) {
        console.log("Failed to load users: ",error)
    }
}




onMounted(() => {
  getAllUsers();
});
</script>

<style scoped>
.container {
  background: #fff;
}
.table td,
.table th {
  vertical-align: middle;
}
</style>