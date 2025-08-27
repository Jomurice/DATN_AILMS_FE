<template>
  <div class="container m-0 p-4">
    <p class="link fs-4" @click="showform = false">
      < </p>
        <div class="d-flex justify-content-end">
          <button class="btn btn-primary" @click="showform = true">+ Thêm </button>
        </div>

        <div v-if="showform" class=" form col-md-8">
          <h2>Account Management</h2>
          <form @submit.prevent="handleSubmit" class="account-form">
            <label for="txtUsername">User Name : </label>
            <input v-model="form.username" placeholder="Username" required />

            <label for="txtFullName">Full Name : </label>
            <input v-model="form.name" placeholder="Name" required />

            <label for="txtEmail">Email : </label>
            <input type="email" v-model="form.email" placeholder="Email" required />

            <label for="txtPhone">Number Phone : </label>
            <input v-model="form.phone" placeholder="Number Phone" required />

            <label for="txtdob">Dob : </label>
            <input v-model="form.dob" placeholder="Birthday" required />

            <label for="txtAddress">Address : </label>
            <textarea v-model="form.address" placeholder="Address" rows="3" required />

            <div>
              <label for="txtGender" class="gender">Gender : </label>
              <input type="radio" v-model="form.gender" :value="true"> Male
              <input type="radio" v-model="form.gender" :value="false"> Female
            </div>
            <input type="text" v-model="form.roles">

            <label for="txtRole">Roles:</label>
            <select v-model="form.roles" multiple>
              <option v-for="roles in form.roles" :key="roles" :value="roles">
                {{ roles }}
              </option>
            </select>



            <div class="d-flex gap-3 mt-3">
              <button class="btn btn-success" type="submit">Create</button>
              <button class="btn btn-primary" @click="update(form.id)">Update</button>
              <button class="btn btn-danger" @click="Enbale(form.id)">Enbale</button>
              <button class="btn btn-primary" @click="resetForm()">Reset</button>
            </div>
          </form>
        </div>

        <div v-else>
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


  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userService } from "../../services/UserService";

const users = ref([]);
const showform = ref(false);
const form = ref({ id: null, username: '', name: '', password: '', gender: true, phone: '', dob: null, address: '', email: '', roles: [] })



async function getAllUsers() {
  try {
    users.value = await userService.getAllUsers();
  } catch (error) {
    console.log("Failed to load users: ", error)
  }
}

async function handleSubmit() {
  try {
    const resp = await userService.createUser(form.value);
    console.log("User created successfully!", resp);
    resetForm();
  } catch (error) {
    console.log("Failed to create user: ", error)
  }
}


async function editUser(id) {

  try {
    const user = await userService.getUserById(id);
    form.value = { ...user, roles: [...user.roles] };
    showform.value = true;
  } catch (error) {
    console.log("Failed to fetch user: ", error)
  }

}

async function update(id) {
  try {
    // if (!form.value.id) {
    //   console.log("No user selected for update.");
    //   return;
    // }
    const resp = await userService.updateUser(id, form.value);
    console.log("User updated successfully!", resp);
    resetForm();
  } catch (error) {
    console.log("Failed to update user: ", error)
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

function resetForm() {
  form.value = { id: null, username: '', name: '', password: '', gender: true, phone: '', dob: null, address: '', email: '', roles: ['WO'] };
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