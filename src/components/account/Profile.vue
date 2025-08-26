<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Cột trái -->
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
              <span class="fw-bold">Giới tính:</span> {{ user.gender }}
            </p>
            <p class="profile-info">
              <i class="fa-regular fa-calendar px-2"></i>
              <span class="fw-bold">Ngày sinh:</span> {{ formatDate(user.dob) }}
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
                user.role
              }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="col-md-4">
        <div class="card shadow-sm p-1 text-center">
          <div class="card-body">
            <img
              src="@/assets/attachment-3 (1).png"
              class="rounded-circle img-fluid mb-3"
              style="width: 140px; height: 140px; object-fit: cover"
              alt="Ảnh nhân viên"
            />
            <p class="fw-bold">{{ user.name }}</p>
            <p>{{ user.email }}</p>
            <hr />
            <button class="btn btn-warning">Đổi mật khẩu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { userService } from "../../services/UserService";

const user = ref({
  id: "",
  username: "",
  name: "",
  dob: "",
  phone: "",
  email: "",
  gender: "",
  address: "",
  role: "",
//   avatar: "",
});



async function loadProfile() {
  const userId = "312603e4-18c0-47d6-a744-3cfbe8529dc6";
  // const token = localStorage.getItem("token");

  try {
    const data = await userService.getUserById(userId);
    console.log("dob: ", data)
    user.value = {
      id: data.id,
      username: data.username,
      name: data.name,
      dob: data.dob,
      phone: data.phone,
      email: data.email,
      gender: data.gender ? "Nam": "Nữ",
      address: data.address,
      role: data.roles?.join(", ")
    //   avatar: "",
    };
  } catch (error) {
    console.log("Failed to load profile: ", error);
  }
}


const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
body {
  background: #f3f4f6;
}

.profile-container {
  width: 100%;
  min-height: 100vh;
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
</style>
