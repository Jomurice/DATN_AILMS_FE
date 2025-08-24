<template>
    <div class="container mt-4">
        <div class="row">
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
                            <span class="fw-bold">Giới tính:</span> {{ employee.gender }} 
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
                            <span class="fw-bold">Role:</span> 
                            <span class="font-semibold text-blue-600 px-1">{{ employee.role }}</span> </p>
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
                        <button class="btn btn-warning">Đổi mật khẩu</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { onMounted, ref } from "vue";

const employee = ref({
    username: "NV002",
    name: "Nguyễn Văn A",
    dob: "1995-05-15",
    phone: "0987654321",
    email: "nguyenvana@company.com",
    gender: "Nam",
    address: "KCN VSIP, Thuận An, Bình Dương",
    role: "Warehouse Operator",
    avatar: ""
});


async function load() {
    const userId = localStorage.getItem("userid");
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8080/users/${userId}`, {

            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        employee.value = response.data.result;
    } catch (error) {
        console.log("Error fetching employee data:", error);
    }
}



const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

onMounted(() => {
    load();
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
