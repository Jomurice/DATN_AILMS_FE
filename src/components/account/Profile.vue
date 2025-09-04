<template>
  <div class="container mt-4">
    <div class="row">

      <div class="col-md-8">
        <div class="card shadow-sm">
          <h3 class="card-header bg-primary text-white">Thông tin cá nhân</h3>
          <div class="card-body px-1">
            <p class="profile-info">
              <i class="fa-regular fa-user px-2"></i>
              <span class="fw-bold">Username:</span> {{ user.username }}
            </p>
            <p class="profile-info">
              <i class="fa-regular fa-id-card px-2"></i>
              <span class="fw-bold">Họ tên:</span> {{ user.name }}
            </p>
            <p class="profile-info">
              <i class="fa-solid fa-venus-mars px-2"></i>
              <span class="fw-bold">Giới tính:</span> {{ user.gender ? 'Male' : 'Female' }}
            </p>
            <p class="profile-info">
              <i class="fa-regular fa-calendar px-2"></i>
              <span class="fw-bold">Ngày sinh:</span> {{ formatDate(user.dob) || "" }}
            </p>
            <p class="profile-info">
              <i class="fa-solid fa-phone px-2"></i>
              <span class="fw-bold">Điện thoại:</span> {{ user.phone }}
            </p>
            <p class="profile-info">
              <i class="fa-regular fa-envelope px-2"></i>
              <span class="fw-bold">Email:</span> {{ user.email }}
            </p>
            <p class="profile-info">
              <i class="fa-solid fa-location-dot px-2"></i>
              <span class="fw-bold">Địa chỉ:</span> {{ user.address }}
            </p>
            <p class="profile-info">
              <i class="fa-solid fa-briefcase px-2"></i>
              <span class="fw-bold">Role:</span>
              <span class="font-semibold text-blue-600 px-1">{{
                user.roles
              }}</span>
            </p>
          </div>
        </div>
      </div>


      <div class="col-md-4">
        <div class="card shadow-sm p-1 text-center">
          <div class="card-body">
            <img src="@/assets/attachment-3 (1).png" class="rounded-circle img-fluid mb-3"
              style="width: 140px; height: 140px; object-fit: cover" alt="Ảnh nhân viên" />
            <p class="fw-bold">{{ user.name }}</p>
            <p>{{ user.email }}</p>
            <hr />
            <button @click="isChangePassword = true" class="btn btn-warning">Đổi mật khẩu</button>
          </div>
        </div>
      </div>


      <div v-if="isChangePassword" class="modal-overlay">
        <div class="modal-container">
          <h2 class="modal-title">Change password</h2>
          <form @submit.prevent="submitChangePassword">
            <div class="modal-row">
              <label class="modal-label">Mật khẩu cũ:</label>
              <input type="password" v-model="changePasswordForm.oldPassword" class="modal-input" required />
            </div>
            <div class="modal-row">
              <label class="modal-label">Mật khẩu mới:</label>
              <input type="password" v-model="changePasswordForm.newPassword" class="modal-input" required />
            </div>
            <div class="modal-row">
              <label class="modal-label">Xác nhận mật khẩu:</label>
              <input type="password" v-model="changePasswordForm.confirmPassword" class="modal-input" required />
            </div>
            <nav v-if="changePasswordError" class="modal-error">{{ changePasswordError }}</nav>
            <div class="modal-actions">
              <button type="button" @click="exitModal()" class="border btn-exit">Thoát</button>
              <button type="submit" class="border btn-update">Cập nhật</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';
import { userService } from "../../services/UserService";
import { tokenService } from '../../services/TokenService';
import { passwordService } from "../../services/PasswordService";
import { useRouter } from "vue-router";


const router = useRouter();
const auth = tokenService();
auth.loadToken();
storeToRefs(auth);

const userId = auth.user.id;
const user = ref({
  username: "",
  name: "",
  dob: "",
  phone: "",
  email: "",
  gender: "",
  address: "",
  roles: [],
  // avatar: ""
});

//Phần modal
const isChangePassword = ref(false);
const changePasswordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const changePasswordError = ref("");




async function loadProfile() {
  try {
    const response = await userService.getUserById(userId);
    const data = response;
    user.value = {
      ...data,
      roles: Array.isArray(data.roles) ? data.roles.join(", ") : "",
    };

  } catch (error) {
    console.log("Failed to load profile: ", error);
  }
}



const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

async function submitChangePassword() {

  changePasswordError.value = "";

  if (changePasswordForm.value.newPassword.length < 6) {
    changePasswordError.value = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    return;
  }

  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    changePasswordError.value = "Mật khẩu mới phải không giống mật khẩu confirm.";
    return;
  }

  try {
    console.log(changePasswordForm.value)
    console.log(auth.token)
    await passwordService.update(changePasswordForm.value,auth.token);
    changePasswordError.value = "Đổi mật khẩu thành công!";
    localStorage.removeItem("accessToken");
    router.push('/');
    resetForm();
  } catch (error) {
    changePasswordError.value = "Đổi mật khẩu thất bại.";
    console.error("Error changing password:", error);
  }
  isChangePassword.value = false;
}

function resetForm() {
  changePasswordForm.value.oldPassword = ''
  changePasswordForm.value.newPassword = ''
  changePasswordForm.value.confirmPassword = ''
}

function exitModal() {
  resetForm();
  changePasswordError.value = '';
  isChangePassword.value = false;
}

onMounted(() => {
  loadProfile();
});

</script>

<style scoped>
body {
  background: #f3f4f6;
}

.container {
  /* width: 100%; */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.img {
  width: 30%;
  max-height: 350px;
  border-radius: 800px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile {
  width: 70%;
  padding-left: 20px;
  margin-left: 30px;
}

.profile-info {
  font-size: 18px;
  color: #333;
  line-height: 2.5;
}

.btn {
  background-color: #f59e0b;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #134ef1;
  color: rgb(18, 17, 17);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  width: 400px;

}

.modal-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.modal-row {
  margin-bottom: 1rem;
}

.modal-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #fff;
}

.modal-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-error {
  color: #fa610f;
  margin-top: 1rem;
  font-weight: bold;
}
</style>
