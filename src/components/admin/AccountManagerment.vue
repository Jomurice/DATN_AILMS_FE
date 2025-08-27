<template>
  <div class="container m-0 p-4">

    <div class="d-flex justify-content-end">
      <router-link to="/account-detail"><button class="btn btn-primary">+ Thêm </button></router-link>
    </div>

    <div>
      <h5 class="fw-bold mb-3">Danh sách</h5>
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
              <router-link :to="`/admin/account/${user.id}/detail`">
                <button class="btn btn-sm btn-warning me-2">Sửa</button>
              </router-link>
              <button class="btn btn-sm btn-secondary" @click="Enbale(user.id)">Ẩn</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
    console.log("Failed to load users: ", error)
  }
}

async function Enbale(id) {
  try {
    const resp = await userService.enableUser(id);
    console.log("User updated successfully!", resp);
    resetForm();
  } catch (error) {
    console.log("Failed to update user: ", error)
  }
}

onMounted(() => {
  getAllUsers();
});
</script>

<style scoped>
.container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.link {
  text-decoration: none;
  color: #080808;
  display: inline-block;
  cursor: pointer;
}

.form {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.form-container>h2 {
  width: 100%;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

input,
textarea,
select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.gender {
  margin-right: 8px;
}


.table td,
.table th {
  vertical-align: middle;
}
</style>