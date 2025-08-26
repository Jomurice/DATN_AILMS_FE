<template>
    <div class="container m-0">
        <div class="row justify-content-center ">
            <!-- Cột trái -->
            <div class="col-md-8">
                <div class="card shadow-sm">
                    <h3 class="card-header bg-primary text-white">
                        Thông tin cá nhân
                    </h3>
                    <div class="card-body px-1">
                        <p class="profile-info">
                            <i class="fa-regular fa-user px-2"></i>
                            <span class="fw-bold">Mã NV:</span> {{ employee.username }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-regular fa-id-card px-2"></i>
                            <span class="fw-bold">Họ tên:</span> {{ employee.name }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-solid fa-venus-mars px-2"></i>
                            <span class="fw-bold">Giới tính:</span> {{ employee.gender ? 'Nam' :'Nu' }} 
                        </p>
                        <p class="profile-info">
                            <i class="fa-regular fa-calendar px-2"></i>
                            <span class="fw-bold">Ngày sinh:</span> {{ formatDate(employee.dob) }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-solid fa-phone px-2"></i>
                            <span class="fw-bold">Điện thoại:</span> {{ employee.phone }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-regular fa-envelope px-2"></i>
                            <span class="fw-bold">Email:</span> {{ employee.email }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-solid fa-location-dot px-2"></i>
                            <span class="fw-bold">Địa chỉ:</span> {{ employee.address }}
                        </p>
                        <p class="profile-info">
                            <i class="fa-solid fa-briefcase px-2"></i>
                            <span class="fw-bold">Chức vụ:</span> 
                            <span class="font-semibold text-blue-600 px-1">{{ employee.roles }}</span> </p>
                    </div>
                </div>
            </div>

            <!-- Cột phải -->
            <div class="col-md-4">
                <div class="card shadow-sm p-1 text-center">
                    <div class="card-body">
                        <img src="/public/z6827970432778_2b43b97a704617f03c546e5bc7bd82e8.jpg"
                            class="rounded-circle img-fluid mb-3"
                            style="width: 140px; height: 140px; object-fit: cover;" alt="Ảnh nhân viên">
                        <p class="fw-bold">{{employee.name }}</p>
                        <p>{{ employee.email }}</p>
                        <hr>
                           <button class="btn btn-warning" @click="showChangePassword = true ">Đổi mật khẩu</button>
                    </div>
                </div>
            </div>

            <div v-if="showChangePassword" class="modal-overlay">
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
                    <div class="modal-actions">
                        <button type="button" @click="exitFrom()" class="border btn-exit">Thoát</button>
                        <button type="submit" class="border btn-update">Cập nhật</button>
                    </div>
                    <div v-if="changePasswordError" class="modal-error">{{ changePasswordError }}</div>
                </form>
            </div>
        </div>

        </div>
    </div>

</template>

<script setup>
import { onMounted, ref } from "vue";
import { userService } from "../../services/UserService";


const showChangePassword = ref(false)
const changePasswordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const changePasswordError = ref("")

const employee = ref({
    username: "",
    name: "",
    dob: "",
    phone: "",
    email: "",
    gender: "",
    address: "",
    roles: [],
    avatar: ""
});


async function load() {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    try {
        const response = await userService.getUserById('3b472836-4919-45ae-b8fc-a650fc2a0bf0');
        employee.value = response;
        console.log("Employee data:", employee.value);
    } catch (error) {
        console.log("Error fetching employee data:", error);
    }
}



const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

async function submitChangePassword() {
    const token = localStorage.getItem('token');
    changePasswordError.value = "";

    if(changePasswordForm.value.newPassword.length < 6) {
        changePasswordError.value = "Mật khẩu mới phải có ít nhất 6 ký tự.";
        return;
    }

    if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
        changePasswordError.value = "Mật khẩu mới không khớp.";
        return;
    }

    try {
        const response = await axios.post('http://localhost:8080/auth/change-password', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: changePasswordForm.value
        });
        changePasswordError.value = "Đổi mật khẩu thành công!";
        resetFrom();
    } catch (error) {
        changePasswordError.value = error.response?.data?.message || "Đổi mật khẩu thất bại.";
        console.error("Error changing password:", error);
    }
    // showChangePassword.value = false;
}

function resetFrom(){
    changePasswordForm.value.oldPassword = ''
    changePasswordForm.value.newPassword = ''
    changePasswordForm.value.confirmPassword = ''
}

function exitFrom(){
    resetFrom()
    changePasswordError.value = ""
    showChangePassword.value = false
}


onMounted(() => {
    load();
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
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: rgba(255, 255, 255,0.1);
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
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}
</style>
