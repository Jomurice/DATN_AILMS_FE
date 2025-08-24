<template>
  <div class="container p-4">
    <h5 class="fw-bold mb-3">1. Danh sách</h5>

    
    <form @submit.prevent="handleSubmit" class="mb-3">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Mã User</label>
          <input type="text" v-model="form.id" class="form-control" disabled />
        </div>
        <div class="col-md-6">
          <label class="form-label">Tên đăng nhập</label>
          <input type="text" v-model="form.username" class="form-control" :class="{ 'is-invalid': errors.username }" />
          <div class="invalid-feedback">{{ errors.username }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Họ tên</label>
          <input type="text" v-model="form.name" class="form-control" :class="{ 'is-invalid': errors.name }" />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Số điện thoại</label>
          <input type="text" v-model="form.phone" class="form-control" :class="{ 'is-invalid': errors.phone }" />
          <div class="invalid-feedback">{{ errors.phone }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" v-model="form.email" class="form-control" :class="{ 'is-invalid': errors.email }" />
          <div class="invalid-feedback">{{ errors.email }}</div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Địa chỉ</label>
          <input type="text" v-model="form.address" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Giới tính</label><br />
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" value="true" v-model="form.gender" />
            <label class="form-check-label">Nam</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" value="false" v-model="form.gender" />
            <label class="form-check-label">Nữ</label>
          </div>
        </div>
        <div class="col-md-6">
          <label class="form-label">Quyền</label>
          <input type="text" v-model="roleInput" class="form-control" placeholder="Nhập role và Enter"
            @keyup.enter.prevent="addRole" />
          <div class="mt-2">
            <span v-for="role in form.roles" :key="role" class="badge bg-info me-1">
              {{ role }}
              <button type="button" class="btn-close btn-close-white btn-sm ms-1" @click="removeRole(role)"></button>
            </span>
          </div>
        </div>
      </div>

      
      <div class="mt-3 d-flex gap-2">
        <button type="submit" class="btn btn-success">{{ editing ? "Cập nhật" : "Tạo mới" }}</button>
        <button type="button" class="btn btn-danger" @click="deleteUser(form.id)" :disabled="!editing">Xóa bỏ</button>
        <button type="button" class="btn btn-secondary" @click="resetForm">Nhập lại</button>
      </div>
    </form>

    
    <table class="table table-bordered table-striped">
      <thead class="table-primary">
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Giới tính</th>
          <th>Roles</th>
          <th class="text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>
            <span v-if="u.gender === 'true'" class="badge bg-primary">Nam</span>
            <span v-else class="badge bg-danger">Nữ</span>
          </td>
          <td>
            <span v-for="r in u.roles" :key="r" class="badge bg-info me-1">{{ r }}</span>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2" @click="editUser(u)">Sửa</button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(u.id)">Xóa</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue"; 
import axios from "axios"; 

const users = ref([
  { id: "U001", username: "admin", name: "Nguyễn Văn A", phone: "0909123456", email: "admin@example.com", address: "HN", gender: "true", roles: ["ADMIN", "USER"] },
  { id: "U002", username: "user1", name: "Trần Thị B", phone: "0912345678", email: "user1@example.com", address: "HCM", gender: "false", roles: ["USER"] }
]);

const form = ref({ id: "", username: "", name: "", phone: "", email: "", address: "", gender: "true", roles: [] });
const editing = ref(false);
const roleInput = ref("");
const errors = ref({});


const validateForm = () => {
  errors.value = {};
  let valid = true;
  if (!form.value.username) {
    errors.value.username = "Vui lòng nhập tên đăng nhập";
    valid = false;
  }
  if (!form.value.name) {
    errors.value.name = "Vui lòng nhập họ tên";
    valid = false;
  }
  if (!form.value.email) {
    errors.value.email = "Vui lòng nhập email";
    valid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = "Email không hợp lệ";
    valid = false;
  }
  if (form.value.phone && !/^[0-9]{9,11}$/.test(form.value.phone)) {
    errors.value.phone = "Số điện thoại không hợp lệ";
    valid = false;
  }
  return valid;
};


const handleSubmit = async () => {
  if (!validateForm()) return;

  if (editing.value) {
    
    await axios.put(`/api/users/${form.value.id}`, form.value);
    const idx = users.value.findIndex((u) => u.id === form.value.id);
    if (idx !== -1) users.value[idx] = { ...form.value };
  } else {
    
    form.value.id = "U" + (users.value.length + 1).toString().padStart(3, "0");
    await axios.post("/api/users", form.value);
    users.value.push({ ...form.value });
  }
  resetForm();
};


const editUser = (u) => {
  form.value = { ...u };
  editing.value = true;
};


const deleteUser = async (id) => {
  if (!id) return;
  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    await axios.delete(`/api/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
    if (form.value.id === id) resetForm();
  }
};


const resetForm = () => {
  form.value = { id: "", username: "", name: "", phone: "", email: "", address: "", gender: "true", roles: [] };
  editing.value = false;
  errors.value = {};
};

const addRole = () => {
  if (roleInput.value && !form.value.roles.includes(roleInput.value)) {
    form.value.roles.push(roleInput.value);
  }
  roleInput.value = "";
};
const removeRole = (r) => {
  form.value.roles = form.value.roles.filter((x) => x !== r);
};
</script>

<style scoped>
.container {
  background: #fff;
}
.table td,
.table th {
  vertical-align: middle;
}
.is-invalid {
  border-color: red;
}
.invalid-feedback {
  display: block;
}
</style>
