<template>
  <div class="d-flex justify-content-center">

    <div class="col-md-8">
      <div class="card shadow-sm">
        <h3 class="card-header bg-primary text-white">Thông tin cá nhân</h3>
        <div class="card-body info px-1">

          <p class="profile-info">
            <i class="fa-regular fa-user px-2"></i>
            <span class="fw-bold">Tên đăng nhập:</span> {{ user.username }}
          </p>

          <p class="profile-info">
            <i class="fa-regular fa-id-card px-2"></i>
            <span class="fw-bold">Họ tên:</span> {{ user.name }}
          </p>

          <p class="profile-info">
            <i class="fa-solid fa-key px-2"></i>
            <span class="fw-bold">Mật khẩu:</span>
            <button @click="isChangePassword = true" class="btn btn-warning" id="changePass">Đổi mật khẩu</button>
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
            <span class="font-semibold text-blue-600 px-1">{{ user.roles }}</span>
          </p>

        </div>
      </div>
    </div>

    <div v-if="isChangePassword" class="modal-overlay">
      <div class="modal-container">
        <h2 class="modal-title">Đổi mật khẩu</h2>
        <form @submit.prevent="submitChangePassword">

          <div class="modal-row">
            <label class="modal-label">Mật khẩu cũ:</label>
            <div class="input-wrapper">
              <input id="password" :type="showOldPassword ? 'text' : 'password'" v-model="changePasswordForm.oldPassword"
                class="modal-input" required />
              <i @click="showOldPassword = !showOldPassword" :class="showOldPassword ? 'fa fa-eye-slash' : 'fa fa-eye'">
              </i>
            </div>
          </div>

          <div class="modal-row">
            <label class="modal-label">Mật khẩu mới:</label>
            <div class="input-wrapper">
              <input id="newPassword" :type="showNewPassword ? 'text' : 'password'" v-model="changePasswordForm.newPassword"
                class="modal-input" maxlength="30" required />
              <i @click="showNewPassword = !showNewPassword" :class="showNewPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
            </div>
          </div>

          <div class="modal-row">
            <label class="modal-label">Xác nhận mật khẩu:</label>
            <div class="input-wrapper">
              <input id="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" v-model="changePasswordForm.confirmPassword"
                class="modal-input" required />
              <i @click="showConfirmPassword = !showConfirmPassword"
                :class="showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'">
              </i>
            </div>
          </div>

          <nav v-if="changePasswordError" class="modal-error">{{ changePasswordError }}</nav>

          <div class="modal-actions">
            <button type="button" @click="exitModal()" class="border btn-exit rounded-3">Thoát</button>
            <button type="submit" class="border btn-update rounded-3">Cập nhật</button>
          </div>

        </form>
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
import { toast } from "vue-sonner";
import { computed } from "vue";

const router = useRouter();
const auth = tokenService();
const userId = computed(() => auth.userId);
storeToRefs(auth);

// const userId = auth.userId;
const user = ref({
  username: "",
  name: "",
  dob: "",
  phone: "",
  email: "",
  gender: "",
  address: "",
  roles: [],

});
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);


const isChangePassword = ref(false);
const changePasswordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const changePasswordError = ref("");




async function loadProfile() {
  try {
    const response = await userService.getUserById(userId.value);
    const data = response;
    user.value = {
      ...data,
      roles: Array.isArray(data.roles) ? data.roles.join(", ") : "",
    };

  } catch (error) {
    console.log("Failed to load profile: ", error);
    toast.error("Tải thông tin cá nhân thất bại.");
  }
}



const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};


async function submitChangePassword() {

  changePasswordError.value = "";

  if (changePasswordForm.value.newPassword.length < 6){
    toast.error("Mật khẩu mới phải từ 6 - 30 ký tự.");
    return changePasswordError.value = "Mật khẩu mới phải từ 6 - 30 ký tự.";
  }
    

  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword){
    toast.error("Mật khẩu xác nhận không khớp !");
    return changePasswordError.value = "Mật khẩu xác nhận không khớp !";
  }
    

  try {
    console.log(changePasswordForm.value)
    console.log(auth.token)
    await passwordService.update(changePasswordForm.value, auth.token);
    changePasswordError.value = "Đổi mật khẩu thành công!";
    toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
    localStorage.removeItem("accessToken");
    window.location.replace("/login")
    resetForm();
   isChangePassword.value = false;

  } catch (error) {
    changePasswordError.value = "Đổi mật khẩu thất bại.";
    console.error("Error changing password:", error);
    toast.error("Đổi mật khẩu thất bại.");
  }

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

onMounted(async () => {
 await loadProfile();
});

</script>

<style scoped>
body {
  background: #f3f4f6;
}

.info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.profile {
  width: 70%;
  padding-left: 20px;
  margin-left: 30px;
}

.profile-info {
  font-size: 18px;
  color: #333333db;
  line-height: 2.5;
}

.btn {
  background-color: #f59e0b;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
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
  background: rgba(31, 31, 31, 0.63);
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

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper .modal-input {
  width: 100%;
  padding-right: 35px; /* chừa chỗ cho icon */
}

.input-wrapper i {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  cursor: pointer;
  color: gray;
}

.input-wrapper i:hover {
  color: blue;
}


.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-error {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}
</style>
